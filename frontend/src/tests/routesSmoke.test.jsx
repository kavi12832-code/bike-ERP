import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { routesConfig } from '../routes';
import { useAppStore } from '../store';
import { ROLE_PRESETS } from '../config/roles';

// Recursively extract all routes with concrete elements from routesConfig
function collectRouteElements(routes, parentPath = '') {
  let list = [];
  for (const route of routes) {
    if (route.path === '*') continue;

    let fullPath = '';
    if (route.path) {
      fullPath = route.path.startsWith('/')
        ? route.path
        : parentPath === '/'
        ? `/${route.path}`
        : `${parentPath}/${route.path}`;
    } else if (route.index) {
      fullPath = parentPath || '/';
    }

    if (route.element) {
      list.push({ path: fullPath || '/', element: route.element });
    }

    if (route.children) {
      list = list.concat(collectRouteElements(route.children, fullPath || parentPath));
    }
  }
  return list;
}

const allRouteElements = collectRouteElements(routesConfig);

describe('Route Smoke Tests (Auto-Enumerated Router Inspection)', () => {
  beforeEach(() => {
    cleanup();
    // Configure Super Admin with unrestricted permissions
    const superAdmin = ROLE_PRESETS.find((r) => r.id === 'super_admin') || {
      id: 'super_admin',
      role: 'Super Admin',
      permissions: ['*'],
    };
    useAppStore.setState({ currentUser: superAdmin });
  });

  it('automatically extracts all routes from routesConfig', () => {
    expect(allRouteElements.length).toBeGreaterThan(40);
    const paths = allRouteElements.map((r) => r.path);
    expect(paths).toContain('/sales/fleet');
    expect(paths).toContain('/showroom');
    expect(paths).toContain('/bookings');
    expect(paths).toContain('/counter');
  });

  // Test every single route in routesConfig
  for (const route of allRouteElements) {
    it(`renders route "${route.path}" without ReferenceError or Module Recovery Console crash`, () => {
      const loggedErrors = [];
      const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
        loggedErrors.push(args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' '));
      });

      render(
        <MemoryRouter initialEntries={[route.path]}>
          {route.element}
        </MemoryRouter>
      );

      // Verify no Error Boundary caught exception triggered
      const recoveryTitle = screen.queryByText(/Module Recovery Console/i);
      expect(recoveryTitle, `Route ${route.path} rendered Module Recovery Console`).toBeNull();

      // Verify no ReferenceError in console errors
      const refErrors = loggedErrors.filter((msg) => msg.includes('ReferenceError') || msg.includes('is not defined'));
      expect(refErrors, `Route ${route.path} logged ReferenceError: ${refErrors.join(' | ')}`).toHaveLength(0);

      errorSpy.mockRestore();
    });
  }
});

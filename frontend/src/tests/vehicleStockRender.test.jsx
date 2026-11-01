import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VehicleStockPage } from '../features/stockVehicles/pages/VehicleStockPage';
import { useAppStore } from '../store';

describe('VehicleStockPage Resilience & Model Counting', () => {
  it('renders without throwing when default store is populated', () => {
    render(
      <MemoryRouter>
        <VehicleStockPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Vehicle Stock & Chassis Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle Stock Counting Separated by Bike Model/i)).toBeInTheDocument();
    expect(screen.getByText(/All Bike Models/i)).toBeInTheDocument();
  });

  it('renders gracefully even if vehicleStock contains malformed or empty items', () => {
    const originalStock = useAppStore.getState().vehicleStock;

    // Inject malformed items
    useAppStore.setState({
      vehicleStock: [
        null,
        {},
        { modelName: undefined, chassisNumber: 'MD2A0001', status: 'IN_STOCK' },
        { modelName: 'Hunter 350', chassisNumber: 'MD2A0002', status: 'IN_STOCK', location: null },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleStockPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Vehicle Stock & Chassis Inventory/i)).toBeInTheDocument();

    // Restore original
    useAppStore.setState({ vehicleStock: originalStock });
  });
});

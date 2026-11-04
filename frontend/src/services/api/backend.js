import { toast } from 'sonner';
import { api, apiRequest, hasSession, isBackendEnabled, refreshSession, setAccessToken } from './client';

const enc = encodeURIComponent;

/**
 * Typed endpoints of the Django backend (Swagger: <backend>/api/docs/).
 */
export const backend = {
  enabled: isBackendEnabled,
  isLoggedIn: hasSession,
  /** Restores the session after a page reload using the httpOnly refresh cookie. */
  restoreSession: refreshSession,

  async login(email, password, otp) {
    const data = await apiRequest('/auth/login/', {
      method: 'POST',
      auth: false,
      body: { email, password, ...(otp ? { otp } : {}) },
    });
    if (!data.otpRequired) setAccessToken(data.access);
    return data;
  },

  async logout() {
    await apiRequest('/auth/logout/', { method: 'POST', auth: false }).catch(() => {});
    setAccessToken(null);
  },

  startTwoFactorSetup: () => api.post('/auth/2fa/setup/'),
  confirmTwoFactor: (code) => api.post('/auth/2fa/confirm/', { code }),

  bootstrap: () => api.get('/dashboard/bootstrap/'),
  dashboardSummary: (branchId) => api.get(`/dashboard/summary/${branchId ? `?branchId=${enc(branchId)}` : ''}`),
  activity: () => api.get('/dashboard/activity/'),

  // Generic REST resource (used by the store sync engine).
  createResource: (path, item) => api.post(`/${path}/`, item),
  updateResource: (path, id, patch) => api.patch(`/${path}/${enc(id)}/`, patch),
  deleteResource: (path, id) => api.delete(`/${path}/${enc(id)}/`),

  // Generic collections (module data without a dedicated table).
  listCollection: (name) => api.get(`/collections/${enc(name)}/`),
  createRecord: (name, item) => api.post(`/collections/${enc(name)}/`, item),
  replaceRecord: (name, id, item) => api.put(`/collections/${enc(name)}/${enc(id)}/`, item),
  deleteRecord: (name, id) => api.delete(`/collections/${enc(name)}/${enc(id)}/`),

  // Endpoints with server-side business rules.
  createJobCard: (card) => api.post('/job-cards/', card),
  updateJobCard: (id, patch) => api.patch(`/job-cards/${enc(id)}/`, patch),
  createAppointment: (appointment) => api.post('/appointments/', appointment),
  cancelAppointment: (id) => api.post(`/appointments/${enc(id)}/cancel/`),
  assignBay: (bayNumber, jobCardId, branchId) => api.post('/bays/assign/', { bayNumber, jobCardId, branchId }),
  releaseBay: (bayNumber, branchId) => api.post('/bays/release/', { bayNumber, branchId }),
  postInvoice: (invoice) => api.post('/invoices/', invoice),
};

/**
 * Write-through for actions that call a business-rule endpoint directly: the UI updates
 * optimistically; if the server rejects the change we say why and reload server truth.
 */
export function syncToBackend(label, call, onServerData) {
  if (!backend.enabled() || !backend.isLoggedIn()) return;
  call()
    .then((data) => onServerData?.(data))
    .catch(async (err) => {
      toast.error(`${label} not saved: ${err.message}`);
      const { useAppStore } = await import('../../store');
      useAppStore.getState().refreshFromBackend?.();
    });
}

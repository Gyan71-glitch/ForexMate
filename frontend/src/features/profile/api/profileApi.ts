import API_URL, { authFetch, apiJson } from '@/lib/api';

export const profileApi = {
  getProfile: async (userId: string) => {
    return authFetch(`${API_URL}/users/${userId}`).then(apiJson);
  },

  updateProfile: async (userId: string, data: any) => {
    // Requires an endpoint in the backend for updating profile
    return authFetch(`${API_URL}/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(apiJson);
  },

  addBank: async (userId: string, data: any) => {
    return authFetch(`${API_URL}/users/${userId}/banks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(apiJson);
  },

  deleteBank: async (userId: string, bankId: string) => {
    return authFetch(`${API_URL}/users/${userId}/banks/${bankId}`, {
      method: 'DELETE',
    }).then(apiJson);
  },

  addAddress: async (userId: string, data: any) => {
    return authFetch(`${API_URL}/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(apiJson);
  },

  deleteAddress: async (userId: string, addressId: string) => {
    return authFetch(`${API_URL}/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    }).then(apiJson);
  },

  updateAddress: async (userId: string, addressId: string, data: any) => {
    return authFetch(`${API_URL}/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(apiJson);
  },
};

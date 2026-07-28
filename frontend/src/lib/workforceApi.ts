import { WORKFORCE_API_URL } from '@/context/WorkforceAuthContext';

let workforceToken: string | null = null;

export function setWorkforceToken(token: string | null) {
  workforceToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('workforce_token', token);
    } else {
      localStorage.removeItem('workforce_token');
    }
  }
}

export function getWorkforceToken(): string | null {
  if (!workforceToken && typeof window !== 'undefined') {
    workforceToken = localStorage.getItem('workforce_token') || localStorage.getItem('forexmate_token') || sessionStorage.getItem('forexmate_token');
  }
  return workforceToken;
}

export async function workforceFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getWorkforceToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${WORKFORCE_API_URL}/workforce${path}`, { ...options, headers });
}

export async function workforceJson<T = any>(res: Response): Promise<T> {
  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    if (!res.ok) throw new Error(json.error?.message || json.message || 'Request failed');
    return json.data as T;
  }
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Request failed');
  return json as T;
}

export async function getWorkforceOrders(): Promise<any> {
  const res = await workforceFetch('/orders');
  return workforceJson(res);
}

export async function getCityInventory(): Promise<any> {
  const res = await workforceFetch('/city-inventory');
  return workforceJson(res);
}

export async function sendCustomerOtp(orderId: string, recipient: string): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/send-otp`, {
    method: 'POST',
    body: JSON.stringify({ recipient }),
  });
  return workforceJson(res);
}

export async function verifyCustomerOtp(orderId: string, recipient: string, code: string): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ recipient, code }),
  });
  return workforceJson(res);
}

export async function reassignBranch(orderId: string, targetBranchId: string, reason: string): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/reassign-branch`, {
    method: 'POST',
    body: JSON.stringify({ targetBranchId, reason }),
  });
  return workforceJson(res);
}

export async function managerCompletePickup(
  orderId: string,
  payload: { otp: string; photoUrl?: string; remarks?: string }
): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/manager-complete-pickup`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return workforceJson(res);
}

export async function assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/assign-delivery-partner`, {
    method: 'POST',
    body: JSON.stringify({ deliveryPartnerId }),
  });
  return workforceJson(res);
}

export async function allocateCash(
  orderId: string,
  items: { denomination: number; quantity: number }[]
): Promise<any> {
  const res = await workforceFetch(`/orders/${orderId}/allocate-cash`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return workforceJson(res);
}

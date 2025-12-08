// Force rebuild
export const API_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
  };
}

export async function registerUser(data: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

export async function loginUser(data: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/students/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
}

export async function updateProfile(data: any) {
  const response = await fetch(`${API_URL}/students/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

export async function requestEditAccess(reason: string) {
  const response = await fetch(`${API_URL}/students/me/request-edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to request edit access');
  }

  return response.json();
}

export async function getProfileEditRequests() {
  const response = await fetch(`${API_URL}/students/me/edit-requests`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch edit requests');
  }

  return response.json();
}

export async function getPendingEditRequests() {
  const response = await fetch(`${API_URL}/students/admin/edit-requests`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pending requests');
  }

  return response.json();
}

export async function approveEditRequest(requestId: string) {
  const response = await fetch(`${API_URL}/students/admin/edit-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    throw new Error('Failed to approve request');
  }

  return response.json();
}

export async function rejectEditRequest(requestId: string) {
  const response = await fetch(`${API_URL}/students/admin/edit-requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });

  if (!response.ok) {
    throw new Error('Failed to reject request');
  }

  return response.json();
}

// --- Rebate APIs ---

export async function createRebateRequest(data: any) {
  const response = await fetch(`${API_URL}/rebates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create rebate request');
  }

  return response.json();
}

export async function getMyRebates() {
  const response = await fetch(`${API_URL}/rebates/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch rebates');
  return response.json();
}

export async function getPendingRebates() {
  const response = await fetch(`${API_URL}/rebates/pending`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch pending rebates');
  return response.json();
}

export async function updateRebateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  const response = await fetch(`${API_URL}/rebates/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}

// --- Documents APIs ---

export async function uploadDocument(file: File, type: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: getAuthHeaders(), // No Content-Type for FormData, let browser set it
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload document');
  }

  return response.json();
}

export async function getMyDocuments() {
  const response = await fetch(`${API_URL}/documents/my`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

export async function deleteDocument(type: string) {
  const response = await fetch(`${API_URL}/documents/${type}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete document');
  return response.json();
}

export async function triggerOcr() {
  const response = await fetch(`${API_URL}/documents/ocr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to process document');
  return response.json();
}

// --- Analytics API ---

export async function getAdminAnalytics() {
  const response = await fetch(`${API_URL}/ops/analytics`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

// --- Complaints API ---

export async function createComplaint(data: any) {
  const response = await fetch(`${API_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create complaint');
  return response.json();
}

export async function getMyComplaints() {
  const response = await fetch(`${API_URL}/complaints/my`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch complaints');
  return response.json();
}

export async function getWardenComplaints() {
  const response = await fetch(`${API_URL}/complaints/warden`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch complaints');
  return response.json();
}

export async function updateComplaintStatus(id: string, status: string) {
  const response = await fetch(`${API_URL}/complaints/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}

export async function calculateDistance(addressData: any) {
  const response = await fetch(`${API_URL}/students/calculate-distance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(addressData)
  })
  if (!response.ok) {
    const text = await response.text();
    console.error('Calculate distance failed:', response.status, text);
    throw new Error(`Failed to calculate distance: ${response.status} ${text}`)
  }
  return response.json()
}

export async function joinWaitlist() {
  const response = await fetch(`${API_URL}/waitlist/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join waitlist');
  }
  return response.json();
}

export async function getWaitlistPosition() {
  const response = await fetch(`${API_URL}/waitlist/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch waitlist position');
  return response.json();
}

export async function getPriorityWaitlist() {
  const response = await fetch(`${API_URL}/waitlist/admin`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  });
  if (!response.ok) throw new Error('Failed to fetch priority waitlist');
  return response.json();
}

export async function createPaymentOrder(purpose: string) {
  const response = await fetch(`${API_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ purpose })
  });
  if (!response.ok) throw new Error('Failed to create payment order');
  return response.json();
}

export async function verifyPayment(data: any) {
  const response = await fetch(`${API_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Payment verification failed');
  return response.json();
}

export async function mockVerifyPayment(purpose: string, amount: number) {
  const response = await fetch(`${API_URL}/payments/mock-verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ purpose, amount })
  });
  if (!response.ok) throw new Error('Mock payment failed');
  return response.json();
}

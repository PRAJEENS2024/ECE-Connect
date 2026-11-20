const API_BASE = '/api';

// Helper to retrieve currently selected demo user ID or token
export const getActiveUserId = (): string | null => {
  return localStorage.getItem('ece_active_user_id');
};

export const setActiveUserId = (userId: string | number | null) => {
  if (userId) {
    localStorage.setItem('ece_active_user_id', String(userId));
  } else {
    localStorage.removeItem('ece_active_user_id');
  }
};

export const clearActiveUserId = () => {
  localStorage.removeItem('ece_active_user_id');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const activeUserId = getActiveUserId();
  
  if (activeUserId) {
    headers.set('X-User-Id', activeUserId);
    headers.set('Authorization', `Bearer ${activeUserId}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

async function requestList<T>(endpoint: string, options: RequestInit = {}): Promise<T[]> {
  const res = await request<any>(endpoint, options);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export const api = {
  // Auth
  auth: {
    me: () => request<any>('/auth/me/'),
    demoUsers: () => request<any[]>('/auth/demo-users/'),
    login: (data: any) => request<any>('/auth/login/', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => request<any>('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request<any>('/auth/logout/', { method: 'POST' }),
  },

  // Announcements & Notifications
  announcements: {
    list: () => requestList<any>('/announcements/'),
    create: (data: any) => request<any>('/announcements/', { method: 'POST', body: JSON.stringify(data) }),
  },
  notifications: {
    list: () => requestList<any>('/notifications/'),
    markRead: (id: number) => request<any>(`/notifications/${id}/mark_as_read/`, { method: 'POST' }),
    markAllRead: () => request<any>('/notifications/mark_all_read/', { method: 'POST' }),
  },

  // Timetables & Classes
  timetables: {
    getClasses: () => requestList<any>('/classes/'),
    getRooms: () => requestList<any>('/rooms/'),
    getSubjects: () => requestList<any>('/subjects/'),
    getEntries: (params: string = '') => requestList<any>(`/timetables/?${params}`),
    createEntry: (data: any) => request<any>('/timetables/', { method: 'POST', body: JSON.stringify(data) }),
    deleteEntry: (id: number) => request<any>(`/timetables/${id}/`, { method: 'DELETE' }),
    getClassMatrix: (sectionId: number) => request<any>(`/timetables/class-matrix/${sectionId}/`),
    validateConflict: (data: any) => request<any>('/timetables/validate-conflict/', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Faculty Directory & Expected Location
  faculty: {
    list: (search: string = '') => requestList<any>(`/faculty/?search=${encodeURIComponent(search)}`),
    getSchedule: (id: number) => request<any>(`/faculty/${id}/schedule/`),
  },

  // Achievements
  achievements: {
    getCategories: () => requestList<any>('/categories/'),
    list: (params: string = '') => requestList<any>(`/achievements/?${params}`),
    get: (id: number) => request<any>(`/achievements/${id}/`),
    create: (data: any) => request<any>('/achievements/', { method: 'POST', body: JSON.stringify(data) }),
    uploadEvidence: (id: number, formData: FormData) => request<any>(`/achievements/${id}/add_evidence/`, { method: 'POST', body: formData }),
    review: (id: number, data: { action: string; points?: number; feedback?: string }) =>
      request<any>(`/achievements/${id}/review/`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Gamification & Leaderboard
  gamification: {
    getBadges: () => requestList<any>('/badges/'),
    getLeaderboard: (params: string = '') => request<any>(`/leaderboard/?${params}`),
    getLedger: (studentId?: number) => requestList<any>(`/points-ledger/${studentId ? `?student=${studentId}` : ''}`),
  },

  // Classroom Issues
  issues: {
    list: (params: string = '') => requestList<any>(`/issues/?${params}`),
    get: (id: number) => request<any>(`/issues/${id}/`),
    create: (data: any) => request<any>('/issues/', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, data: { status: string; note?: string }) =>
      request<any>(`/issues/${id}/update_status/`, { method: 'POST', body: JSON.stringify(data) }),
    assign: (id: number, assignedToId: number) =>
      request<any>(`/issues/${id}/assign_technician/`, { method: 'POST', body: JSON.stringify({ assigned_to: assignedToId }) }),
  },

  // Queries & Feedback
  feedback: {
    list: (params: string = '') => requestList<any>(`/queries/?${params}`),
    get: (id: number) => request<any>(`/queries/${id}/`),
    create: (data: any) => request<any>('/queries/', { method: 'POST', body: JSON.stringify(data) }),
    addResponse: (id: number, data: { response_text: string; is_internal_note?: boolean }) =>
      request<any>(`/queries/${id}/add_response/`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Analytics & ETL
  analytics: {
    getKPIs: () => request<any>('/analytics/kpis/'),
    getETLHistory: () => requestList<any>('/analytics/etl-history/'),
    triggerETL: () => request<any>('/analytics/trigger-etl/', { method: 'POST' }),
  },
};

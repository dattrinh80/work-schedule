import {
  ActiveScope,
  CreateTaskDto,
  Facility,
  LoginDto,
  LoginResponseDto,
  Task,
  TaskFilterDto,
  TaskListResponseDto,
  TaskStatus,
  UpdateTaskDto,
  User,
} from '@wms/shared';

function getApiBase(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:4000/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
}

let memoryToken: string | null = null;
let memoryScope: ActiveScope = { facilityId: 'ALL' };

export const tokenStorage = {
  get(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('wms_token');
    }
    return memoryToken;
  },
  set(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('wms_token', token);
    }
    memoryToken = token;
  },
  clear() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('wms_token');
    }
    memoryToken = null;
  },
};

export const scopeStorage = {
  get(): ActiveScope {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('wms_scope');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return memoryScope;
  },
  set(scope: ActiveScope) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('wms_scope', JSON.stringify(scope));
    }
    memoryScope = scope;
  },
  clear() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('wms_scope');
    }
    memoryScope = { facilityId: 'ALL' };
  },
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.message) {
        errMsg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
      }
    } catch {
      // Keep default error message
    }
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const res = await request<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    tokenStorage.set(res.accessToken);
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async getFacilities(): Promise<{ facilities: Facility[] }> {
    return request<{ facilities: Facility[] }>('/facilities');
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/users');
  },

  async getTasks(filter: TaskFilterDto = {}): Promise<TaskListResponseDto> {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.priority) params.append('priority', filter.priority);
    if (filter.facilityId) params.append('facilityId', filter.facilityId);
    if (filter.assigneeUserId) params.append('assigneeUserId', filter.assigneeUserId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<TaskListResponseDto>(`/tasks${query}`);
  },

  async getTask(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`);
  },

  async createTask(dto: CreateTaskDto): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return request<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteTask(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Subtask Endpoints (Module 4) ---
  async getSubtasks(taskId: string): Promise<{ subtasks: import('@wms/shared').Subtask[]; total: number }> {
    return request<{ subtasks: import('@wms/shared').Subtask[]; total: number }>(`/tasks/${taskId}/subtasks`);
  },

  async createSubtask(
    taskId: string,
    dto: { title: string; assigneeUserId?: string },
  ): Promise<import('@wms/shared').Subtask> {
    return request<import('@wms/shared').Subtask>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async toggleSubtask(
    taskId: string,
    subtaskId: string,
    isCompleted: boolean,
  ): Promise<import('@wms/shared').Subtask> {
    return request<import('@wms/shared').Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
  },

  async deleteSubtask(
    taskId: string,
    subtaskId: string,
  ): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },

  // --- Comment Endpoints (Module 5) ---
  async getComments(taskId: string): Promise<{ comments: import('@wms/shared').TaskComment[]; total: number }> {
    return request<{ comments: import('@wms/shared').TaskComment[]; total: number }>(`/tasks/${taskId}/comments`);
  },

  async addComment(
    taskId: string,
    content: string,
  ): Promise<import('@wms/shared').TaskComment> {
    return request<import('@wms/shared').TaskComment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

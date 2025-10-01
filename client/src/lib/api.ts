import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
  };
  role: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiRequest("POST", "/api/v1/auth/login", credentials);
    return res.json();
  },
  
  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/v1/auth/logout");
  },
  
  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await apiRequest("GET", "/api/v1/auth/me");
    return res.json();
  },
};

export const animalsApi = {
  getAll: async () => {
    const res = await apiRequest("GET", "/api/v1/animals");
    return res.json();
  },
  
  getById: async (id: string) => {
    const res = await apiRequest("GET", `/api/v1/animals/${id}`);
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await apiRequest("POST", "/api/v1/animals", data);
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await apiRequest("PATCH", `/api/v1/animals/${id}`, data);
    return res.json();
  },
};

export const medicalApi = {
  getTasks: async () => {
    const res = await apiRequest("GET", "/api/v1/medical/schedule");
    return res.json();
  },
  
  createTask: async (data: any) => {
    const res = await apiRequest("POST", "/api/v1/medical/schedule", data);
    return res.json();
  },
  
  updateTask: async (id: string, data: any) => {
    const res = await apiRequest("PATCH", `/api/v1/medical/schedule/${id}`, data);
    return res.json();
  },
};

export const applicationsApi = {
  getAll: async () => {
    const res = await apiRequest("GET", "/api/v1/applications");
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await apiRequest("POST", "/api/v1/applications", data);
    return res.json();
  },
  
  update: async (id: string, data: any) => {
    const res = await apiRequest("PATCH", `/api/v1/applications/${id}`, data);
    return res.json();
  },
};

export const peopleApi = {
  getAll: async () => {
    const res = await apiRequest("GET", "/api/v1/people");
    return res.json();
  },
  
  create: async (data: any) => {
    const res = await apiRequest("POST", "/api/v1/people", data);
    return res.json();
  },
};

export const reportsApi = {
  getFeed: async (type: 'petfinder' | 'adoptapet') => {
    const res = await apiRequest("GET", `/api/v1/feeds/${type}.xml`);
    return res.text();
  },
};

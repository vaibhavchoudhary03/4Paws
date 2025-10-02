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
    // Mock authentication for demo
    const demoUsers = {
      'staff@demo.4paws.org': { role: 'admin', name: 'Staff User' },
      'foster@demo.4paws.org': { role: 'foster', name: 'Foster User' },
      'volunteer@demo.4paws.org': { role: 'volunteer', name: 'Volunteer User' },
    };
    
    if (credentials.password === 'demo-only' && demoUsers[credentials.email as keyof typeof demoUsers]) {
      const user = demoUsers[credentials.email as keyof typeof demoUsers];
      return {
        user: {
          id: 'demo-user-id',
          name: user.name,
          email: credentials.email,
        },
        organization: {
          id: '00000000-0000-0000-0000-000000000001',
          name: '4Paws Demo Shelter',
        },
        role: user.role,
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: async (): Promise<void> => {
    // Mock logout
    return Promise.resolve();
  },
  
  getCurrentUser: async (): Promise<AuthResponse> => {
    // Mock current user
    return {
      user: {
        id: 'demo-user-id',
        name: 'Staff User',
        email: 'staff@demo.4paws.org',
      },
      organization: {
        id: '00000000-0000-0000-0000-000000000001',
        name: '4Paws Demo Shelter',
      },
      role: 'admin',
    };
  },
};

export const animalsApi = {
  getAll: async () => {
    // Mock data matching the screenshots
    return [
      {
        id: '1',
        name: 'Misty',
        species: 'cat',
        breed: 'Tuxedo',
        age: 24,
        gender: 'female',
        color: 'Black and White',
        size: 'medium',
        status: 'fostered',
        intakeDate: '2025-07-08',
        photos: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'],
        description: 'Sweet and playful tuxedo cat who loves attention',
        isSpayedNeutered: true,
        isVaccinated: true,
      },
      {
        id: '2',
        name: 'Shadow',
        species: 'dog',
        breed: 'German Shepherd',
        age: 36,
        gender: 'female',
        color: 'Black and Tan',
        size: 'large',
        status: 'available',
        intakeDate: '2025-07-16',
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
        description: 'Loyal and protective German Shepherd, great with kids',
        isSpayedNeutered: true,
        isVaccinated: true,
      },
      {
        id: '3',
        name: 'Harley',
        species: 'cat',
        breed: 'Tuxedo',
        age: 18,
        gender: 'male',
        color: 'Black and White',
        size: 'medium',
        status: 'fostered',
        intakeDate: '2025-07-11',
        photos: ['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400'],
        description: 'Energetic young cat who loves to play',
        isSpayedNeutered: true,
        isVaccinated: false,
      },
      {
        id: '4',
        name: 'Bear',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 48,
        gender: 'male',
        color: 'Golden',
        size: 'large',
        status: 'available',
        intakeDate: '2025-06-20',
        photos: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'],
        description: 'Gentle giant who loves everyone he meets',
        isSpayedNeutered: true,
        isVaccinated: true,
      },
      {
        id: '5',
        name: 'Sadie',
        species: 'cat',
        breed: 'Siamese',
        age: 30,
        gender: 'female',
        color: 'Cream',
        size: 'medium',
        status: 'available',
        intakeDate: '2025-06-15',
        photos: ['https://images.unsplash.com/photo-1573865526739-10639f7e6b8d?w=400'],
        description: 'Elegant Siamese with beautiful blue eyes',
        isSpayedNeutered: true,
        isVaccinated: true,
      },
      {
        id: '6',
        name: 'Duke',
        species: 'dog',
        breed: 'Labrador Mix',
        age: 24,
        gender: 'male',
        color: 'Chocolate',
        size: 'large',
        status: 'available',
        intakeDate: '2025-07-01',
        photos: ['https://images.unsplash.com/photo-1547407139-3c921a71905c?w=400'],
        description: 'Friendly lab mix who loves to swim',
        isSpayedNeutered: true,
        isVaccinated: false,
      },
    ];
  },
  
  getById: async (id: string) => {
    const animals = await animalsApi.getAll();
    return animals.find(animal => animal.id === id) || null;
  },
  
  create: async (data: any) => {
    // Mock create
    return { id: Date.now().toString(), ...data };
  },
  
  update: async (id: string, data: any) => {
    // Mock update
    return { id, ...data };
  },
};

export const medicalApi = {
  getTasks: async () => {
    // Mock medical tasks matching the dashboard screenshot
    return [
      {
        id: '1',
        animalName: 'Bear',
        type: 'treatment',
        title: 'Hip X-ray Follow-up',
        status: 'overdue',
        dueDate: '2025-08-10',
        priority: 'high',
        description: 'needs attention',
      },
      {
        id: '2',
        animalName: 'Sadie',
        type: 'treatment',
        title: 'Dental Cleaning',
        status: 'overdue',
        dueDate: '2025-08-12',
        priority: 'high',
        description: 'needs attention',
      },
      {
        id: '3',
        animalName: 'Duke',
        type: 'vaccine',
        title: 'Annual Vaccination',
        status: 'overdue',
        dueDate: '2025-08-08',
        priority: 'high',
        description: 'needs attention',
      },
      {
        id: '4',
        animalName: 'Sophie',
        type: 'treatment',
        title: 'Health Check',
        status: 'overdue',
        dueDate: '2025-08-14',
        priority: 'high',
        description: 'needs attention',
      },
    ];
  },
  
  createTask: async (data: any) => {
    return { id: Date.now().toString(), ...data };
  },
  
  updateTask: async (id: string, data: any) => {
    return { id, ...data };
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

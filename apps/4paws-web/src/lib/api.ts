import { apiRequest } from "./queryClient";
import { supabase, type Animal, type MedicalRecord, type Adoption, type Foster, type VolunteerActivity } from "./supabase";

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
  getAll: async (): Promise<Animal[]> => {
    console.log('🔍 Fetching animals from Supabase...');
    
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📊 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Error fetching animals:', error);
      throw new Error('Failed to fetch animals');
    }
    
    console.log('✅ Animals fetched successfully:', data?.length || 0, 'animals');
    return data || [];
  },
  
  getById: async (id: string): Promise<Animal | null> => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching animal:', error);
      return null;
    }
    
    return data;
  },
  
  create: async (data: Partial<Animal>): Promise<Animal> => {
    const { data: result, error } = await supabase
      .from('animals')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating animal:', error);
      throw new Error('Failed to create animal');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<Animal>): Promise<Animal> => {
    const { data: result, error } = await supabase
      .from('animals')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating animal:', error);
      throw new Error('Failed to update animal');
    }
    
    return result;
  },
};

export const medicalApi = {
  getTasks: async () => {
    console.log('🔍 Fetching medical tasks from Supabase...');
    
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        animals!inner(name)
      `)
      .eq('is_completed', false)
      .order('date', { ascending: true });
    
    console.log('📊 Medical tasks response:', { data, error });
    
    if (error) {
      console.error('❌ Error fetching medical tasks:', error);
      throw new Error('Failed to fetch medical tasks');
    }
    
    // Transform the data to match the expected format
    const transformed = (data || []).map(record => ({
      id: record.id,
      animalName: record.animals?.name || 'Unknown',
      type: record.type,
      title: record.title,
      status: record.next_due_date && new Date(record.next_due_date) < new Date() ? 'overdue' : 'pending',
      dueDate: record.next_due_date || record.date,
      priority: record.next_due_date && new Date(record.next_due_date) < new Date() ? 'high' : 'medium',
      description: record.description || 'needs attention',
    }));
    
    console.log('✅ Medical tasks fetched successfully:', transformed.length, 'tasks');
    return transformed;
  },
  
  createTask: async (data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const { data: result, error } = await supabase
      .from('medical_records')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating medical task:', error);
      throw new Error('Failed to create medical task');
    }
    
    return result;
  },
  
  updateTask: async (id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const { data: result, error } = await supabase
      .from('medical_records')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating medical task:', error);
      throw new Error('Failed to update medical task');
    }
    
    return result;
  },
};

export const applicationsApi = {
  getAll: async (): Promise<Adoption[]> => {
    const { data, error } = await supabase
      .from('adoptions')
      .select('*')
      .order('application_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching adoptions:', error);
      throw new Error('Failed to fetch adoptions');
    }
    
    return data || [];
  },
  
  create: async (data: Partial<Adoption>): Promise<Adoption> => {
    const { data: result, error } = await supabase
      .from('adoptions')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating adoption:', error);
      throw new Error('Failed to create adoption');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<Adoption>): Promise<Adoption> => {
    const { data: result, error } = await supabase
      .from('adoptions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating adoption:', error);
      throw new Error('Failed to update adoption');
    }
    
    return result;
  },
};

export const peopleApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching people:', error);
      throw new Error('Failed to fetch people');
    }
    
    return data || [];
  },
  
  create: async (data: any) => {
    const { data: result, error } = await supabase
      .from('users')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating person:', error);
      throw new Error('Failed to create person');
    }
    
    return result;
  },
};

export const reportsApi = {
  getFeed: async (type: 'petfinder' | 'adoptapet') => {
    const res = await apiRequest("GET", `/api/v1/feeds/${type}.xml`);
    return res.text();
  },
};

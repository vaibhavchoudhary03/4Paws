import { apiRequest } from "./queryClient";
import { supabase, type Animal, type MedicalRecord, type Adoption, type AdoptionApplication, type Foster, type FosterAssignment, type VolunteerActivity, type VolunteerActivityWithRelations, type Person } from "./supabase";

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
      'staff@demo.kirby.org': { role: 'admin', name: 'Staff User' },
      'foster@demo.kirby.org': { role: 'foster', name: 'Foster User' },
      'volunteer@demo.kirby.org': { role: 'volunteer', name: 'Volunteer User' },
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
          name: 'Kirby Demo Shelter',
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
        email: 'staff@demo.kirby.org',
      },
      organization: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Kirby Demo Shelter',
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
  getAll: async (): Promise<AdoptionApplication[]> => {
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos),
        adopter:users(id, name, email, phone)
      `)
      .order('application_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching adoption applications:', error);
      throw new Error('Failed to fetch adoption applications');
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<AdoptionApplication> => {
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos, age, gender, description),
        adopter:users(id, name, email, phone)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching adoption application:', error);
      throw new Error('Failed to fetch adoption application');
    }
    
    return data;
  },
  
  create: async (data: Partial<AdoptionApplication>): Promise<AdoptionApplication> => {
    const { data: result, error } = await supabase
      .from('adoptions')
      .insert([data])
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos),
        adopter:users(id, name, email, phone)
      `)
      .single();
    
    if (error) {
      console.error('Error creating adoption application:', error);
      throw new Error('Failed to create adoption application');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<AdoptionApplication>): Promise<AdoptionApplication> => {
    const { data: result, error } = await supabase
      .from('adoptions')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos),
        adopter:users(id, name, email, phone)
      `)
      .single();
    
    if (error) {
      console.error('Error updating adoption application:', error);
      throw new Error('Failed to update adoption application');
    }
    
    return result;
  },
  
  updateStatus: async (id: string, status: string, notes?: string): Promise<AdoptionApplication> => {
    const updateData: any = { 
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Set approval date if approved
    if (status === 'approved') {
      updateData.approvalDate = new Date().toISOString();
    }
    
    // Set adoption date if completed
    if (status === 'completed') {
      updateData.adoptionDate = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return applicationsApi.update(id, updateData);
  },
  
  approve: async (id: string, notes?: string): Promise<AdoptionApplication> => {
    return applicationsApi.updateStatus(id, 'approved', notes);
  },
  
  reject: async (id: string, notes?: string): Promise<AdoptionApplication> => {
    return applicationsApi.updateStatus(id, 'rejected', notes);
  },
  
  complete: async (id: string, adoptionFee?: number, notes?: string): Promise<AdoptionApplication> => {
    const updateData: any = {
      status: 'completed',
      adoptionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (adoptionFee) {
      updateData.adoptionFee = adoptionFee;
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return applicationsApi.update(id, updateData);
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('adoptions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting adoption application:', error);
      throw new Error('Failed to delete adoption application');
    }
  },
};

export const peopleApi = {
  getAll: async (): Promise<Person[]> => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching people:', error);
      throw new Error('Failed to fetch people');
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<Person> => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching person:', error);
      throw new Error('Failed to fetch person');
    }
    
    return data;
  },
  
  create: async (data: Partial<Person>): Promise<Person> => {
    const { data: result, error } = await supabase
      .from('users')
      .insert([data])
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating person:', error);
      throw new Error('Failed to create person');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<Person>): Promise<Person> => {
    const { data: result, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating person:', error);
      throw new Error('Failed to update person');
    }
    
    return result;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting person:', error);
      throw new Error('Failed to delete person');
    }
  },
  
  getByRole: async (role: string): Promise<Person[]> => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .eq('role', role)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching people by role:', error);
      throw new Error('Failed to fetch people by role');
    }
    
    return data || [];
  },
  
  search: async (query: string): Promise<Person[]> => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching people:', error);
      throw new Error('Failed to search people');
    }
    
    return data || [];
  },
};

export const fostersApi = {
  getAll: async (): Promise<FosterAssignment[]> => {
    const { data, error } = await supabase
      .from('fosters')
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos, age, gender, description),
        foster:users(id, name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching foster assignments:', error);
      throw new Error('Failed to fetch foster assignments');
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<FosterAssignment> => {
    const { data, error } = await supabase
      .from('fosters')
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos, age, gender, description),
        foster:users(id, name, email, phone)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching foster assignment:', error);
      throw new Error('Failed to fetch foster assignment');
    }
    
    return data;
  },
  
  create: async (data: Partial<FosterAssignment>): Promise<FosterAssignment> => {
    const { data: result, error } = await supabase
      .from('fosters')
      .insert([data])
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos, age, gender, description),
        foster:users(id, name, email, phone)
      `)
      .single();
    
    if (error) {
      console.error('Error creating foster assignment:', error);
      throw new Error('Failed to create foster assignment');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<FosterAssignment>): Promise<FosterAssignment> => {
    const { data: result, error } = await supabase
      .from('fosters')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        animal:animals(id, name, breed, species, status, photos, age, gender, description),
        foster:users(id, name, email, phone)
      `)
      .single();
    
    if (error) {
      console.error('Error updating foster assignment:', error);
      throw new Error('Failed to update foster assignment');
    }
    
    return result;
  },
  
  complete: async (id: string, notes?: string): Promise<FosterAssignment> => {
    const updateData: any = {
      status: 'completed',
      endDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return fostersApi.update(id, updateData);
  },
  
  terminate: async (id: string, notes?: string): Promise<FosterAssignment> => {
    const updateData: any = {
      status: 'terminated',
      endDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return fostersApi.update(id, updateData);
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('fosters')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting foster assignment:', error);
      throw new Error('Failed to delete foster assignment');
    }
  },
};

export const volunteerActivitiesApi = {
  getAll: async (): Promise<VolunteerActivityWithRelations[]> => {
    const { data, error } = await supabase
      .from('volunteer_activities')
      .select(`
        *,
        volunteer:users(id, name, email),
        animal:animals(id, name, breed, species, photos)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching volunteer activities:', error);
      throw new Error('Failed to fetch volunteer activities');
    }
    
    return data || [];
  },
  
  getByVolunteer: async (volunteerId: string): Promise<VolunteerActivityWithRelations[]> => {
    const { data, error } = await supabase
      .from('volunteer_activities')
      .select(`
        *,
        volunteer:users(id, name, email),
        animal:animals(id, name, breed, species, photos)
      `)
      .eq('volunteer_id', volunteerId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching volunteer activities:', error);
      throw new Error('Failed to fetch volunteer activities');
    }
    
    return data || [];
  },
  
  create: async (data: Partial<VolunteerActivity>): Promise<VolunteerActivityWithRelations> => {
    const { data: result, error } = await supabase
      .from('volunteer_activities')
      .insert([data])
      .select(`
        *,
        volunteer:users(id, name, email),
        animal:animals(id, name, breed, species, photos)
      `)
      .single();
    
    if (error) {
      console.error('Error creating volunteer activity:', error);
      throw new Error('Failed to create volunteer activity');
    }
    
    return result;
  },
  
  update: async (id: string, data: Partial<VolunteerActivity>): Promise<VolunteerActivityWithRelations> => {
    const { data: result, error } = await supabase
      .from('volunteer_activities')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        volunteer:users(id, name, email),
        animal:animals(id, name, breed, species, photos)
      `)
      .single();
    
    if (error) {
      console.error('Error updating volunteer activity:', error);
      throw new Error('Failed to update volunteer activity');
    }
    
    return result;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('volunteer_activities')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting volunteer activity:', error);
      throw new Error('Failed to delete volunteer activity');
    }
  },
};

export const reportsApi = {
  getFeed: async (type: 'petfinder' | 'adoptapet') => {
    const res = await apiRequest("GET", `/api/v1/feeds/${type}.xml`);
    return res.text();
  },
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Resource = Tables<'resources'>;
export type NewResource = TablesInsert<'resources'>;
export type UpdatedResource = TablesUpdate<'resources'>;

export function useResources() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const resourcesQuery = useQuery({
    queryKey: ['resources', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('resources')
        .select('*, skills(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[]; // Cast as any to handle joined 'skills' table
    },
    enabled: !!user,
  });

  const createResource = useMutation({
    mutationFn: async (resource: NewResource) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('resources')
        .insert({ ...resource, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource created');
    },
    onError: (error) => {
      toast.error('Failed to create resource: ' + error.message);
    },
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, ...updates }: UpdatedResource) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id!)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated');
    },
    onError: (error) => {
      toast.error('Failed to update resource: ' + error.message);
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete resource: ' + error.message);
    },
  });

  return {
    resources: resourcesQuery.data || [],
    isLoading: resourcesQuery.isLoading,
    error: resourcesQuery.error,
    createResource,
    updateResource,
    deleteResource,
  };
}

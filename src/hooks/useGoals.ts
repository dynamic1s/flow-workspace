import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  type: 'skill' | 'non-skill'; 
  total_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  goal_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  notes: string | null;
  created_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(g => ({ ...g, total_seconds: g.total_seconds || 0 })) as Goal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: { name: string; description?: string; color?: string; icon?: string; type: 'skill' | 'non-skill' }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('skills')
        .insert({
          user_id: user.id,
          name: goal.name,
          description: goal.description || null,
          color: goal.color || '#6366F1',
          icon: goal.icon || 'target',
          type: goal.type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create goal: ' + error.message);
    },
  });

  const addTimeEntry = useMutation({
    mutationFn: async (entry: {
      goal_id: string;
      start_time: Date;
      end_time: Date;
      duration_seconds: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          goal_id: entry.goal_id,
          start_time: entry.start_time.toISOString(),
          end_time: entry.end_time.toISOString(),
          duration_seconds: entry.duration_seconds,
          notes: entry.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries', variables.goal_id] });
      toast.success('Time logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log time: ' + error.message);
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal,
    addTimeEntry,
  };
}

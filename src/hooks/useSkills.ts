import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  total_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  skill_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  notes: string | null;
  created_at: string;
}

export function useSkills() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const skillsQuery = useQuery({
    queryKey: ['skills', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Skill[];
    },
    enabled: !!user,
  });

  const createSkill = useMutation({
    mutationFn: async (skill: { name: string; description?: string; color?: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('skills')
        .insert({
          user_id: user.id,
          name: skill.name,
          description: skill.description || null,
          color: skill.color || '#6366F1',
          icon: skill.icon || 'target',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create skill: ' + error.message);
    },
  });

  const addTimeEntry = useMutation({
    mutationFn: async (entry: {
      skill_id: string;
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
          skill_id: entry.skill_id,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log time: ' + error.message);
    },
  });

  const getTotalSeconds = () => {
    if (!skillsQuery.data) return 0;
    return skillsQuery.data.reduce((acc, skill) => acc + skill.total_seconds, 0);
  };

  const getMasteryProgress = () => {
    const totalSeconds = getTotalSeconds();
    const targetSeconds = 36000000; // 10,000 hours in seconds
    return Math.min((totalSeconds / targetSeconds) * 100, 100);
  };

  return {
    skills: skillsQuery.data || [],
    isLoading: skillsQuery.isLoading,
    error: skillsQuery.error,
    createSkill,
    addTimeEntry,
    getTotalSeconds,
    getMasteryProgress,
  };
}

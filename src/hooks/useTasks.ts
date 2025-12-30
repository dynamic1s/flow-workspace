
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// The useTasks hook no longer accepts a goalId
export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const todayTasksQuery = useQuery({
    queryKey: ['tasks-today', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString())
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: { title: string; description?: string; priority?: number; due_date?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: task.title,
          description: task.description || null,
          priority: task.priority || 0,
          due_date: task.due_date || new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] });
      toast.success('Task created');
    },
    onError: (error) => {
      toast.error('Failed to create task: ' + error.message);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] });
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message);
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          completed, 
          completed_at: completed ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] });
      if (data.completed) {
        toast.success('Task completed!');
      }
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] });
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete task: ' + error.message);
    },
  });

  const completionRate = (
    (todayTasksQuery.data?.filter(t => t.completed).length || 0) / 
    (todayTasksQuery.data?.length || 1)
  ) * 100;

  const allTasks = tasksQuery.data || [];
  const completedTodayCount = allTasks.filter(t => {
    if (!t.completed_at) return false;
    const completedDate = new Date(t.completed_at);
    const today = new Date();
    return completedDate.getDate() === today.getDate() &&
           completedDate.getMonth() === today.getMonth() &&
           completedDate.getFullYear() === today.getFullYear();
  }).length;

  return {
    tasks: allTasks,
    todayTasks: todayTasksQuery.data || [],
    isLoading: tasksQuery.isLoading || todayTasksQuery.isLoading,
    error: tasksQuery.error || todayTasksQuery.error,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    completionRate,
    completedTodayCount,
  };
}

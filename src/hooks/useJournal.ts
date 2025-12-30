
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface JournalTaskAnnotation {
  id: string;
  user_id: string;
  journal_entry_id: string;
  task_id: string;
  annotation: string | null;
  created_at: string;
}

export function useJournal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ['journal-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });

  const todayEntryQuery = useQuery({
    queryKey: ['journal-today', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as JournalEntry | null;
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (entry: { content: string; mood?: string; entry_date?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: entry.content,
          mood: entry.mood || null,
          entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-today'] });
      toast.success('Journal entry saved');
    },
    onError: (error) => {
      toast.error('Failed to save entry: ' + error.message);
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JournalEntry> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-today'] });
      toast.success('Journal entry updated');
    },
    onError: (error) => {
      toast.error('Failed to update entry: ' + error.message);
    },
  });

  const annotationsQuery = useQuery({
    queryKey: ['journal-annotations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('journal_task_annotations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as JournalTaskAnnotation[];
    },
    enabled: !!user,
  });

  const createAnnotation = useMutation({
    mutationFn: async (annotation: { journal_entry_id: string; task_id: string; annotation?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('journal_task_annotations')
        .insert({
          user_id: user.id,
          journal_entry_id: annotation.journal_entry_id,
          task_id: annotation.task_id,
          annotation: annotation.annotation || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as JournalTaskAnnotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-annotations'] });
      toast.success('Task linked to journal');
    },
    onError: (error) => {
      toast.error('Failed to link task: ' + error.message);
    },
  });

  const updateAnnotation = useMutation({
    mutationFn: async ({ id, annotation }: { id: string; annotation: string | null }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_task_annotations')
        .update({ annotation })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as JournalTaskAnnotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-annotations'] });
      toast.success('Annotation updated');
    },
    onError: (error) => {
      toast.error('Failed to update annotation: ' + error.message);
    },
  });

  const deleteAnnotation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('journal_task_annotations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-annotations'] });
    },
  });

  const useTasksForEntry = (entryDate: string) => {
    return useQuery({
      queryKey: ['tasks-for-entry', user?.id, entryDate],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('due_date', entryDate)
        if (error) throw error;
        return data;
      },
      enabled: !!user && !!entryDate,
    });
  };

  return {
    entries: entriesQuery.data || [],
    todayEntry: todayEntryQuery.data,
    annotations: annotationsQuery.data || [],
    isLoading: entriesQuery.isLoading,
    createEntry,
    updateEntry,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    useTasksForEntry,
  };
}

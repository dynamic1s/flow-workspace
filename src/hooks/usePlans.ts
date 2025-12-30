import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';

export interface Plan {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  status: 'major' | 'minor'; // Matches the check constraint in Supabase
  completed: boolean | null;
  to_be_completed_date: string | null; // Represents a date string
  created_at: string;
}

const getPlans = async (goalId: string): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('goal_id', goalId);
  if (error) {
    throw error;
  }
  return data as Plan[];
};

const createPlan = async (plan: TablesInsert<'plans'>): Promise<Plan> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('User not authenticated');
  }
  const user_id = userData.user.id;

  const { data, error } = await supabase
    .from('plans')
    .insert({ ...plan, user_id, id: uuidv4() }) // Ensure id and user_id are set
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data as Plan;
};

const togglePlan = async (id: string): Promise<Plan> => {
  const { data: existingPlan, error: fetchError } = await supabase
    .from('plans')
    .select('completed')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw fetchError;
  }
  if (!existingPlan) {
    throw new Error('Plan not found');
  }

  const newCompletedStatus = !existingPlan.completed;

  const { data, error } = await supabase
    .from('plans')
    .update({ completed: newCompletedStatus } as TablesUpdate<'plans'>) // Removed completed_at update
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data as Plan;
};

const updatePlanStatus = async ({ id, status }: { id: string; status: 'major' | 'minor' }): Promise<Plan> => {
  const { data, error } = await supabase
    .from('plans')
    .update({ status: status } as TablesUpdate<'plans'>)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data as Plan;
};

const deletePlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);
  if (error) {
    throw error;
  }
};

const getPlanProgress = (plans: Plan[]): number => {
  if (plans.length === 0) {
    return 0;
  }
  const completedPlans = plans.filter(plan => plan.completed).length;
  return Math.round((completedPlans / plans.length) * 100);
};

export function usePlans(goalId: string) {
  const queryClient = useQueryClient();

  const { data: plansData = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['plans', goalId],
    queryFn: () => getPlans(goalId),
    enabled: !!goalId, // Only run query if goalId is provided
  });

  const progress = getPlanProgress(plansData);

  const createPlanMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', goalId] });
    },
  });

  const togglePlanMutation = useMutation({
    mutationFn: togglePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', goalId] });
    },
  });
  
  const updatePlanStatusMutation = useMutation({
    mutationFn: updatePlanStatus,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plans', goalId] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', goalId] });
    },
  });

  return {
    plans: plansData,
    isLoading,
    progress, // Make progress available in the return value
    createPlan: createPlanMutation,
    togglePlan: togglePlanMutation,
    updatePlanStatus: updatePlanStatusMutation,
    deletePlan: deletePlanMutation,
  };
}

// Hook to get all plans for progress calculation
export function useAllPlans() {
    const { data: allPlansData = [] } = useQuery<Plan[]>({
        queryKey: ['plans', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('plans')
                .select('*');
            if (error) {
                throw error;
            }
            return data as Plan[];
        },
    });
    return { allPlans: allPlansData };
}
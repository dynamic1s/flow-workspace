import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CreatePlanDialog } from './CreatePlanDialog';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';
import { TablesInsert } from '@/integrations/supabase/types';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlanListProps {
  goalId: string;
}

export function PlanList({ goalId }: PlanListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { plans, createPlan, togglePlan, deletePlan } = usePlans(goalId);

  const handleCreatePlan = (planData: { title: string; status: 'major' | 'minor'; to_be_completed_date: string | null }) => {
    if (!user) {
      console.error('User not authenticated.');
      return;
    }
    const newPlan: TablesInsert<'plans'> = {
      user_id: user.id,
      goal_id: goalId,
      title: planData.title,
      status: planData.status,
      completed: false,
      to_be_completed_date: planData.to_be_completed_date,
    };
    createPlan.mutate(newPlan);
  };

  const handleTogglePlan = (id: string) => {
    togglePlan.mutate(id);
  };

  const handleDeletePlan = (id: string) => {
    deletePlan.mutate(id);
  };

  return (
    <div className="space-y-4">
      <CreatePlanDialog
        goalId={goalId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreated={handleCreatePlan}
      />
      <Button onClick={() => setIsDialogOpen(true)} className="w-full">Create Plan</Button>
      <div className="space-y-2 h-40 overflow-y-auto pr-1">
        {plans.map((plan) => (
          <div key={plan.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-3 flex-grow">
              <Checkbox
                checked={plan.completed ?? false}
                onCheckedChange={() => handleTogglePlan(plan.id)}
              />
              <span className={plan.completed ? 'line-through text-muted-foreground' : ''}>{plan.title}</span>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={plan.status === 'major' ? "default" : "secondary"}>
                  {plan.status === 'major' ? 'Major' : 'Minor'}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)} aria-label="Delete plan">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">No plans yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
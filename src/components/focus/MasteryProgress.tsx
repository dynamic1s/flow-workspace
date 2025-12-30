import { useState } from 'react';
import { Trophy, Target, ListChecks } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { useAllPlans } from '@/hooks/usePlans';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MasteryProgress() {
  const { goals } = useGoals();
  const { allPlans } = useAllPlans();
  const [goalType, setGoalType] = useState<'skill' | 'non-skill'>('skill');

  const formatHours = (hours: number) => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toLocaleString();
  };

  const filteredGoals = goals.filter(g => g.type === goalType);
  const targetHours = 10000;

  const calculatePlanProgress = (goalId: string) => {
    const goalPlans = allPlans.filter(p => p.goal_id === goalId);
    if (goalPlans.length === 0) {
        return { totalWeight: 0, completedWeight: 0, progressRate: 0 };
    }

    const totalWeight = goalPlans.reduce((acc, plan) => acc + (plan.status === 'major' ? 1 : 0.5), 0);
    const completedWeight = goalPlans
      .filter(plan => plan.completed)
      .reduce((acc, plan) => acc + (plan.status === 'major' ? 1 : 0.5), 0);
      
    const progressRate = totalWeight === 0 ? 0 : (completedWeight / totalWeight) * 100;

    return { totalWeight, completedWeight, progressRate };
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {goalType === 'skill' ? (
            <Trophy className="w-5 h-5 text-primary" />
          ) : (
            <ListChecks className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-lg font-semibold text-foreground">
            {goalType === 'skill' ? 'Mastery Progress' : 'Goals & Plans'}
          </h2>
        </div>
        <Select value={goalType} onValueChange={(v) => setGoalType(v as 'skill' | 'non-skill')}>
          <SelectTrigger className="w-[150px] text-xs h-8">
            <SelectValue placeholder="Goal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skill">Skill-related</SelectItem>
            <SelectItem value="non-skill">Non-skill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {goalType === 'skill' ? (
        <ScrollArea className="h-[280px] pr-4 -mr-4">
          <div className="space-y-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map(goal => {
                const hours = Math.floor((goal.total_seconds || 0) / 3600);
                const progress = (hours / targetHours) * 100;

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                        {goal.name}
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">
                        {formatHours(hours)}h / {formatHours(targetHours)}h
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No skill-related goals yet.</p>
                <p className="text-xs text-muted-foreground">Create one to track your mastery!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col h-full">
          <ScrollArea className="h-[280px] pr-4 -mr-4">
            <div className="space-y-3">
              {filteredGoals.length > 0 ? (
                filteredGoals.map(goal => {
                    const { totalWeight, completedWeight, progressRate } = calculatePlanProgress(goal.id);
                    return (
                        <div key={goal.id} className="glass-card-inner p-3 rounded-lg">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <div className="flex items-center gap-2 font-medium text-foreground">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                                    {goal.name}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                <p>Total Weight: {totalWeight.toFixed(1)}</p>
                                <p>Completed Weight: {completedWeight.toFixed(1)}</p>
                                <p>Progress Rate: {progressRate.toFixed(1)}%</p>
                            </div>
                            <Progress value={progressRate} className="h-2" />
                        </div>
                    );
                })
              ) : (
                <div className="text-center py-10">
                  <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No non-skill goals found.</p>
                   <p className="text-xs text-muted-foreground">Create one to start making plans.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
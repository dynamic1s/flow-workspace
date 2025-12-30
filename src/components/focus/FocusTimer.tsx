import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimer } from '@/hooks/useTimer';
import { useGoals, Goal } from '@/hooks/useGoals';
import { getIconComponent } from '@/components/goals/CreateGoalDialog';
import { PlanList } from '@/components/plans/PlanList';
import { usePlans } from '@/hooks/usePlans'; // Import usePlans
// import { ProgressRing } from '@/components/dashboard/ProgressRing'; // Removed ProgressRing

export function FocusTimer() {
  const timer = useTimer();
  const { goals, addTimeEntry } = useGoals();
  const [goalType, setGoalType] = useState<'skill' | 'non-skill'>('skill');

  // State for skill-related goals
  const [selectedSkillGoalId, setSelectedSkillGoalId] = useState<string>('');

  // State for non-skill-related goals
  const [selectedPlanGoalId, setSelectedPlanGoalId] = useState<string>('');

  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualGoalId, setManualGoalId] = useState('');

  const skillGoals = goals.filter(g => g.type === 'skill');
  const nonSkillGoals = goals.filter(g => g.type === 'non-skill');

  // Get plans for the selected non-skill goal to calculate progress
  usePlans(selectedPlanGoalId);

  const handleStart = () => {
    if (!selectedSkillGoalId) return;
    timer.start(selectedSkillGoalId);
  };

  const handleStop = async () => {
    const result = timer.stop();
    if (result.goalId && result.startTime && result.durationSeconds > 0) {
      await addTimeEntry.mutateAsync({
        goal_id: result.goalId,
        start_time: result.startTime,
        end_time: new Date(),
        duration_seconds: result.durationSeconds,
      });
    }
  };

  const handleManualEntry = async () => {
    if (!manualGoalId || !manualStartTime || !manualEndTime) return;

    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(`${today}T${manualStartTime}`);
    const endDate = new Date(`${today}T${manualEndTime}`);

    if (endDate <= startDate) return;

    const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    await addTimeEntry.mutateAsync({
      goal_id: manualGoalId,
      start_time: startDate,
      end_time: endDate,
      duration_seconds: durationSeconds,
    });

    setManualStartTime('');
    setManualEndTime('');
    setManualGoalId('');
  };

  const renderGoalOption = (goal: Goal) => {
    const IconComponent = getIconComponent(goal.icon);
    return (
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4" style={{ color: goal.color }} />
        {goal.name}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Focus Mode
        </h2>
      </div>

      <div>
        <Label className="text-muted-foreground">Focus Type</Label>
        <Select
          value={goalType}
          onValueChange={(value) => setGoalType(value as 'skill' | 'non-skill')}
          disabled={timer.isRunning}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Choose a focus type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skill">Skill-related</SelectItem>
            <SelectItem value="non-skill">Non-skill-related</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {goalType === 'skill' ? (
        <Tabs defaultValue="live" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="live">Live Timer</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="text-center">
              <motion.div
                key={timer.elapsedSeconds}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="font-mono text-5xl md:text-7xl font-bold text-foreground tracking-tight"
              >
                {timer.formatTime(timer.elapsedSeconds)}
              </motion.div>

              {timer.isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Recording...
                </motion.div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground">Select Skill-based Goal</Label>
              <Select
                value={timer.goalId || selectedSkillGoalId}
                onValueChange={setSelectedSkillGoalId}
                disabled={timer.isRunning}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a goal to focus on" />
                </SelectTrigger>
                <SelectContent>
                  {skillGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {renderGoalOption(goal)}
                    </SelectItem>
                  ))}
                   {skillGoals.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No skill-related goals yet.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center gap-4 min-h-[64px]">
              <AnimatePresence mode="wait">
                {!timer.isRunning && timer.elapsedSeconds === 0 && (
                  <motion.div key="start" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Button size="lg" className="h-16 w-16 rounded-full" onClick={handleStart} disabled={!selectedSkillGoalId}>
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </motion.div>
                )}

                {timer.isRunning && (
                  <motion.div key="running" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-4">
                    <Button size="lg" variant="secondary" className="h-16 w-16 rounded-full" onClick={timer.pause}>
                      <Pause className="w-6 h-6" />
                    </Button>
                    <Button size="lg" variant="destructive" className="h-16 w-16 rounded-full" onClick={handleStop}>
                      <Square className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}

                {!timer.isRunning && timer.elapsedSeconds > 0 && (
                  <motion.div key="paused" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-4">
                    <Button size="lg" className="h-16 w-16 rounded-full" onClick={timer.resume}>
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                    <Button size="lg" variant="destructive" className="h-16 w-16 rounded-full" onClick={handleStop}>
                      <Square className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Select Skill-based Goal</Label>
              <Select value={manualGoalId} onValueChange={setManualGoalId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a goal" />
                </SelectTrigger>
                <SelectContent>
                  {skillGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {renderGoalOption(goal)}
                    </SelectItem>
                  ))}
                   {skillGoals.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No skill-related goals yet.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" value={manualEndTime} onChange={(e) => setManualEndTime(e.target.value)} className="mt-1.5" />
              </div>
            </div>

            {manualStartTime && manualEndTime && (
              <div className="text-center text-sm text-muted-foreground">
                Duration: {calculateDuration(manualStartTime, manualEndTime)}
              </div>
            )}

            <Button onClick={handleManualEntry} disabled={!manualGoalId || !manualStartTime || !manualEndTime} className="w-full">
              Log Time
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4 mt-6">
            <Label className="text-muted-foreground">Select Goal</Label>
            <Select
                value={selectedPlanGoalId}
                onValueChange={setSelectedPlanGoalId}
                >
                <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose a goal for your plans" />
                </SelectTrigger>
                <SelectContent>
                    {nonSkillGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                        {renderGoalOption(goal)}
                    </SelectItem>
                    ))}
                    {nonSkillGoals.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                        No non-skill goals yet.
                    </div>
                    )}
                </SelectContent>
            </Select>
            {selectedPlanGoalId && (
              <>
                <PlanList goalId={selectedPlanGoalId} />
              </>
            )}
        </div>
      )}
    </div>
  );
}

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return '0m';
  const today = new Date().toISOString().split('T')[0];
  const startDate = new Date(`${today}T${start}`);
  const endDate = new Date(`${today}T${end}`);

  if (endDate <= startDate) return 'Invalid';

  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
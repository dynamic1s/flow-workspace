import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, Plus, Target } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimer } from '@/hooks/useTimer';
import { useSkills } from '@/hooks/useSkills';

export function FocusTimer() {
  const timer = useTimer();
  const { skills, createSkill, addTimeEntry } = useSkills();
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Manual entry state
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualSkillId, setManualSkillId] = useState('');

  const handleStart = () => {
    if (!selectedSkillId) return;
    timer.start(selectedSkillId);
  };

  const handleStop = async () => {
    const result = timer.stop();
    if (result.skillId && result.startTime && result.durationSeconds > 0) {
      await addTimeEntry.mutateAsync({
        skill_id: result.skillId,
        start_time: result.startTime,
        end_time: result.endTime,
        duration_seconds: result.durationSeconds,
      });
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    await createSkill.mutateAsync({ name: newSkillName.trim() });
    setNewSkillName('');
    setIsDialogOpen(false);
  };

  const handleManualEntry = async () => {
    if (!manualSkillId || !manualStartTime || !manualEndTime) return;
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(`${today}T${manualStartTime}`);
    const endDate = new Date(`${today}T${manualEndTime}`);
    
    if (endDate <= startDate) {
      return;
    }
    
    const durationSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    
    await addTimeEntry.mutateAsync({
      skill_id: manualSkillId,
      start_time: startDate,
      end_time: endDate,
      duration_seconds: durationSeconds,
    });
    
    setManualStartTime('');
    setManualEndTime('');
    setManualSkillId('');
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Focus Mode
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., Piano, Coding, Design"
                  className="mt-1.5"
                />
              </div>
              <Button onClick={handleCreateSkill} className="w-full">
                Create Skill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="live">Live Timer</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* Timer Display */}
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

          {/* Skill Selector */}
          <div>
            <Label className="text-muted-foreground">Select Skill</Label>
            <Select
              value={timer.skillId || selectedSkillId}
              onValueChange={setSelectedSkillId}
              disabled={timer.isRunning}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a skill to practice" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: skill.color }} />
                      {skill.name}
                    </div>
                  </SelectItem>
                ))}
                {skills.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No skills yet. Create one first!
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <AnimatePresence mode="wait">
              {!timer.isRunning && timer.elapsedSeconds === 0 && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full"
                    onClick={handleStart}
                    disabled={!selectedSkillId}
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </motion.div>
              )}

              {timer.isRunning && (
                <motion.div
                  key="running"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-4"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-16 w-16 rounded-full"
                    onClick={timer.pause}
                  >
                    <Pause className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full"
                    onClick={handleStop}
                  >
                    <Square className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {!timer.isRunning && timer.elapsedSeconds > 0 && (
                <motion.div
                  key="paused"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-4"
                >
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full"
                    onClick={timer.resume}
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full"
                    onClick={handleStop}
                  >
                    <Square className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Select Skill</Label>
            <Select value={manualSkillId} onValueChange={setManualSkillId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: skill.color }} />
                      {skill.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={manualStartTime}
                onChange={(e) => setManualStartTime(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={manualEndTime}
                onChange={(e) => setManualEndTime(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {manualStartTime && manualEndTime && (
            <div className="text-center text-sm text-muted-foreground">
              Duration: {calculateDuration(manualStartTime, manualEndTime)}
            </div>
          )}

          <Button
            onClick={handleManualEntry}
            disabled={!manualSkillId || !manualStartTime || !manualEndTime}
            className="w-full"
          >
            Log Time
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function calculateDuration(start: string, end: string): string {
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

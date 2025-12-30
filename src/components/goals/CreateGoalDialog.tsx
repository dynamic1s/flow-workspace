import { useState } from 'react';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { 
  Target, Code, Music, Palette, BookOpen, Dumbbell, 
  Camera, Gamepad2, PenTool, Utensils, Languages, Calculator,
  Mic, Video, Cpu, Wrench, Heart, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/useGoals';

const ICONS = [
  { name: 'target', icon: Target },
  { name: 'code', icon: Code },
  { name: 'music', icon: Music },
  { name: 'palette', icon: Palette },
  { name: 'book', icon: BookOpen },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'camera', icon: Camera },
  { name: 'gamepad', icon: Gamepad2 },
  { name: 'pen', icon: PenTool },
  { name: 'utensils', icon: Utensils },
  { name: 'languages', icon: Languages },
  { name: 'calculator', icon: Calculator },
  { name: 'mic', icon: Mic },
  { name: 'video', icon: Video },
  { name: 'cpu', icon: Cpu },
  { name: 'wrench', icon: Wrench },
  { name: 'heart', icon: Heart },
  { name: 'lightbulb', icon: Lightbulb },
];

const PRESET_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6B7280', '#1F2937',
];

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const { createGoal } = useGoals();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'skill' | 'non-skill'>('skill');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('target');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createGoal.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      type: goalType,
    });

    setName('');
    setDescription('');
    setGoalType('skill');
    setColor('#6366F1');
    setIcon('target');
    onOpenChange(false);
  };

  const SelectedIcon = ICONS.find(i => i.name === icon)?.icon || Target;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <SelectedIcon className="w-5 h-5" style={{ color }} />
            </div>
            Create New Goal
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-5 pt-4">
            <div>
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Learn Piano, Master React"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="goal-description">Description (optional)</Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's your objective?"
                className="mt-1.5 resize-none"
                rows={2}
              />
            </div>

            <div>
              <Label>Goal Type</Label>
              <Select value={goalType} onValueChange={(value) => setGoalType(value as 'skill' | 'non-skill')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skill">Skill-related</SelectItem>
                  <SelectItem value="non-skill">Non-skill-related</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color</Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all',
                        color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    Custom Color
                  </Button>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 font-mono text-sm"
                    placeholder="#6366F1"
                  />
                </div>

                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <HexColorPicker color={color} onChange={setColor} className="w-full" />
                  </motion.div>
                )}
              </div>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {ICONS.map(({ name: iconName, icon: IconComponent }) => (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'p-3 rounded-lg transition-all flex items-center justify-center',
                      icon === iconName
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: icon === iconName ? color : undefined }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreate}
              className="w-full"
              disabled={!name.trim() || createGoal.isPending}
            >
              {createGoal.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function getIconComponent(iconName: string) {
  const found = ICONS.find(i => i.name === iconName);
  return found?.icon || Target;
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  onCreated?: (planData: { title: string; status: 'major' | 'minor'; to_be_completed_date: string | null }) => void;
}

export function CreatePlanDialog({ open, onOpenChange, goalId, onCreated }: CreatePlanDialogProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'major' | 'minor'>('minor');
  const [toBeCompletedDate, setToBeCompletedDate] = useState<Date | undefined>(undefined);
  const { createPlan } = usePlans(goalId);
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) return;

    const formattedDate = toBeCompletedDate ? format(toBeCompletedDate, 'yyyy-MM-dd') : null;

    try {
      await createPlan.mutateAsync({
        user_id: user.id,
        goal_id: goalId,
        title: title.trim(),
        status: status,
        completed: false,
        to_be_completed_date: formattedDate,
      });
      
      onCreated?.({ title: title.trim(), status: status, to_be_completed_date: formattedDate });

      setTitle('');
      setStatus('minor');
      setToBeCompletedDate(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
      // Optionally show a toast notification for error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="plan-title">Plan Title</Label>
            <Input
              id="plan-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Learn React hooks, Exercise 30 mins"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="plan-status">Status</Label>
            <Select value={status} onValueChange={(value: 'major' | 'minor') => setStatus(value)}>
              <SelectTrigger id="plan-status" className="mt-1.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>To be completed by</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1.5',
                    !toBeCompletedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toBeCompletedDate ? format(toBeCompletedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toBeCompletedDate}
                  onSelect={setToBeCompletedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleCreate} className="w-full" disabled={!title.trim() || !user?.id}>
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
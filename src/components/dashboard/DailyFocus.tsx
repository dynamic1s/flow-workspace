
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, MinusCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const priorityMap = {
  3: { name: "High", color: "border-l-destructive" },
  2: { name: "Medium", color: "border-l-warning" },
  1: { name: "Low", color: "border-l-success" },
};

export function DailyFocus() {
  const { todayTasks, createTask, toggleTask, deleteTask, isLoading, completedTodayCount } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [newPriority, setNewPriority] = useState<number>(2);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleToggleTask = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed: !completed });
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      createTask.mutate({
        title: newTaskTitle.trim(),
        priority: newPriority,
        due_date: newDueDate ? newDueDate.toISOString() : new Date().toISOString(),
      });
      setNewTaskTitle("");
      setNewDueDate(undefined);
      setNewPriority(2);
    }
  };
  
  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete);
      setTaskToDelete(null);
    }
  }

  const totalTasks = todayTasks.length + completedTodayCount;

  return (
    <>
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daily Focus</h2>
            <p className="text-sm text-muted-foreground">
              {completedTodayCount} of {totalTasks} completed today
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            className="flex-grow"
          />
          <DatePicker date={newDueDate} setDate={setNewDueDate} />
          <Select onValueChange={(value) => setNewPriority(parseInt(value))} defaultValue="2">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">High</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="1">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 h-48 overflow-y-auto pr-1">
          <AnimatePresence>
            {isLoading ? (
              <p className="text-muted-foreground">Loading tasks...</p>
            ) : totalTasks === 0 ? (
              <div className="text-center text-muted-foreground pt-8">
                  <p>No tasks for today.</p>
                  <p>Create one to get started!</p>
              </div>
            ) : (
              todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl border-l-4 bg-muted/30 p-3 pr-8 transition-all duration-200 hover:bg-muted/50",
                    priorityMap[task.priority]?.color || "border-l-primary",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className={cn(
                      "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      task.completed
                        ? "border-success bg-success"
                        : "border-muted-foreground hover:border-primary"
                    )}
                  >
                    <AnimatePresence>
                      {task.completed && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check className="h-3 w-3 text-success-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <span className={cn("flex-1 text-sm font-medium truncate", task.completed && "text-muted-foreground line-through")}>
                    {task.title}
                  </span>

                  <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                      onClick={() => setTaskToDelete(task.id)}
                  >
                      <MinusCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this task.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={handleDeleteTask}
                className={buttonVariants({ variant: 'destructive' })}
            >
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

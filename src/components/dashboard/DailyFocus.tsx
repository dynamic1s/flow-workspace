import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Sparkles, Flag, MinusCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const priorityMap = {
  3: { name: "High", color: "border-l-destructive" },
  2: { name: "Medium", color: "border-l-warning" },
  1: { name: "Low", color: "border-l-success" },
};

export function DailyFocus() {
  const { todayTasks, createTask, toggleTask, deleteTask, isLoading, completedTodayCount } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(2);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleToggleTask = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed: !completed });
    if (!completed) {
      setCelebratingId(id);
      setTimeout(() => setCelebratingId(null), 600);
    }
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      createTask.mutate({ title: newTaskTitle.trim(), priority: newTaskPriority });
      setNewTaskTitle("");
      setNewTaskPriority(2);
    }
  };
  
  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete);
      setTaskToDelete(null);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Focus</h2>
          <p className="text-sm text-muted-foreground">
            {completedTodayCount} of {todayTasks.length + completedTodayCount} completed today
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Input 
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Flag className={cn("h-4 w-4", 
                newTaskPriority === 3 && "text-destructive",
                newTaskPriority === 2 && "text-warning",
                newTaskPriority === 1 && "text-success"
              )} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={String(newTaskPriority)} onValueChange={(v) => setNewTaskPriority(Number(v))}>
              <DropdownMenuRadioItem value="3">High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="2">Medium</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="1">Low</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleCreateTask} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 h-48 overflow-y-auto pr-1">
        <AnimatePresence>
          {isLoading ? (
            <p className="text-muted-foreground">Loading tasks...</p>
          ) : todayTasks.length === 0 ? (
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
                  "group relative flex items-center gap-3 rounded-xl border-l-4 bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50",
                  priorityMap[task.priority]?.color || "border-l-primary",
                  task.completed && "opacity-60"
                )}
              >
                <button
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className={cn(
                    "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                    task.completed
                      ? "border-success bg-success"
                      : "border-muted-foreground hover:border-primary"
                  )}
                >
                  <AnimatePresence>
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-3 w-3 text-success-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                <span
                  className={cn(
                    "flex-1 text-sm font-medium transition-all duration-200",
                    task.completed && "text-muted-foreground line-through"
                  )}
                >
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

                <AnimatePresence>
                  {celebratingId === task.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-4"
                    >
                      <Sparkles className="h-5 w-5 text-warning animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
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
    </div>
  );
}

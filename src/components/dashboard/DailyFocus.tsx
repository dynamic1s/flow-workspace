import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const initialTasks: Task[] = [
  { id: "1", title: "Review project roadmap", completed: false, priority: "high" },
  { id: "2", title: "Complete design review", completed: true, priority: "medium" },
  { id: "3", title: "Update documentation", completed: false, priority: "low" },
  { id: "4", title: "Team standup meeting", completed: true, priority: "high" },
  { id: "5", title: "Code review for PR #42", completed: false, priority: "medium" },
];

const priorityColors = {
  high: "border-l-destructive",
  medium: "border-l-warning",
  low: "border-l-success",
};

export function DailyFocus() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id && !task.completed) {
          setCelebratingId(id);
          setTimeout(() => setCelebratingId(null), 600);
        }
        return task.id === id ? { ...task, completed: !task.completed } : task;
      })
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Focus</h2>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <Button variant="ghost" size="icon-sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl border-l-4 bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50",
                priorityColors[task.priority],
                task.completed && "opacity-60"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
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

              {/* Celebration animation */}
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
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

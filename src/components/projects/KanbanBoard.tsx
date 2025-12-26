import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, GripVertical, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  comments: number;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Research competitors",
        description: "Analyze top 5 competitors",
        priority: "high",
        comments: 3,
        dueDate: "Dec 28",
      },
      {
        id: "2",
        title: "Design system audit",
        priority: "medium",
        comments: 1,
      },
      {
        id: "3",
        title: "Update documentation",
        priority: "low",
        comments: 0,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Build dashboard UI",
        description: "Create main dashboard components",
        priority: "high",
        comments: 5,
        dueDate: "Dec 27",
      },
      {
        id: "5",
        title: "API integration",
        priority: "medium",
        comments: 2,
      },
    ],
  },
  {
    id: "review",
    title: "In Review",
    tasks: [
      {
        id: "6",
        title: "Homepage redesign",
        description: "New hero section",
        priority: "high",
        comments: 8,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "7",
        title: "Setup project",
        priority: "low",
        comments: 0,
      },
      {
        id: "8",
        title: "Initial wireframes",
        priority: "medium",
        comments: 4,
      },
    ],
  },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30"
    >
      <div className="mb-3 flex items-start justify-between">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>

      <h4 className="mb-1 font-medium text-foreground">{task.title}</h4>
      {task.description && (
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.dueDate}
          </div>
        )}
        {task.comments > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {task.comments}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function KanbanColumn({ column }: { column: Column }) {
  return (
    <div className="flex h-full min-w-[300px] flex-col rounded-2xl bg-muted/30 p-4 lg:min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {column.tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon-sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>

      <Button variant="ghost" className="mt-3 w-full justify-start text-muted-foreground">
        <Plus className="mr-2 h-4 w-4" />
        Add task
      </Button>
    </div>
  );
}

export function KanbanBoard() {
  const [columns] = useState(initialColumns);
  const [activeTab, setActiveTab] = useState("todo");
  const isMobile = useIsMobile();

  if (isMobile) {
    const activeColumn = columns.find((c) => c.id === activeTab) || columns[0];

    return (
      <div className="flex flex-col">
        {/* Mobile Tabs */}
        <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-2">
          {columns.map((column) => (
            <button
              key={column.id}
              onClick={() => setActiveTab(column.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                activeTab === column.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {column.title}
              <span className="ml-2 text-xs opacity-70">
                ({column.tasks.length})
              </span>
            </button>
          ))}
        </div>

        {/* Active Column Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {activeColumn.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add task
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-16rem)] grid-cols-4 gap-4">
      {columns.map((column) => (
        <KanbanColumn key={column.id} column={column} />
      ))}
    </div>
  );
}

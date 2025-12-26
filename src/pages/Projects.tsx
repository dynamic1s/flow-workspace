import { motion } from "framer-motion";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/projects/KanbanBoard";

export default function Projects() {
  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage tasks and track progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="h-9 w-[200px] rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="icon-sm" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "Total Tasks", value: 24, color: "text-foreground" },
          { label: "In Progress", value: 8, color: "text-warning" },
          { label: "Completed", value: 12, color: "text-success" },
          { label: "Overdue", value: 2, color: "text-destructive" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-4 text-center"
          >
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

import { motion } from "framer-motion";
import { Plus, Filter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GanttTimeline } from "@/components/roadmap/GanttTimeline";

export default function Roadmap() {
  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roadmap</h1>
          <p className="mt-1 text-muted-foreground">
            Track project timelines and milestones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <LayoutGrid className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Timeline Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Design</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Development</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Integration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-4" />
          <span className="text-xs text-muted-foreground">Marketing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-chart-5" />
          <span className="text-xs text-muted-foreground">Research</span>
        </div>
      </motion.div>

      {/* Gantt Chart */}
      <GanttTimeline />

      {/* Mobile Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center text-xs text-muted-foreground lg:hidden"
      >
        Swipe left/right to navigate • Pinch to zoom
      </motion.p>
    </div>
  );
}

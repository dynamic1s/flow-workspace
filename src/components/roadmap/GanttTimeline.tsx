import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
}

const projects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 2, 15),
    progress: 75,
    color: "bg-primary",
  },
  {
    id: "2",
    name: "Mobile App",
    startDate: new Date(2025, 1, 1),
    endDate: new Date(2025, 5, 30),
    progress: 40,
    color: "bg-success",
  },
  {
    id: "3",
    name: "API Integration",
    startDate: new Date(2025, 0, 15),
    endDate: new Date(2025, 3, 1),
    progress: 60,
    color: "bg-warning",
  },
  {
    id: "4",
    name: "Marketing Campaign",
    startDate: new Date(2025, 3, 1),
    endDate: new Date(2025, 6, 30),
    progress: 10,
    color: "bg-chart-4",
  },
  {
    id: "5",
    name: "User Research",
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 4, 15),
    progress: 25,
    color: "bg-chart-5",
  },
];

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function GanttTimeline() {
  const [zoom, setZoom] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthWidth = 100 * zoom;
  const yearStart = new Date(2025, 0, 1);

  const getBarPosition = (startDate: Date, endDate: Date) => {
    const startMonth = (startDate.getFullYear() - 2025) * 12 + startDate.getMonth();
    const endMonth = (endDate.getFullYear() - 2025) * 12 + endDate.getMonth();
    const startDay = startDate.getDate() / 30;
    const endDay = endDate.getDate() / 30;

    const left = (startMonth + startDay) * monthWidth;
    const width = (endMonth - startMonth + endDay - startDay) * monthWidth;

    return { left, width };
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = monthWidth * 3;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleScroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleScroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={containerRef}
        className="scrollbar-hide overflow-x-auto"
        style={{ touchAction: "pan-x" }}
      >
        <div style={{ minWidth: monthWidth * 12 + 200 }}>
          {/* Month Headers */}
          <div className="flex border-b border-border">
            <div className="w-[200px] shrink-0 border-r border-border bg-muted/30 p-3">
              <span className="text-sm font-medium text-muted-foreground">Projects</span>
            </div>
            <div className="flex">
              {months.map((month, i) => (
                <div
                  key={month}
                  className="shrink-0 border-r border-border/50 p-3 text-center"
                  style={{ width: monthWidth }}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Rows */}
          {projects.map((project, index) => {
            const { left, width } = getBarPosition(project.startDate, project.endDate);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex border-b border-border/50 hover:bg-muted/20"
              >
                <div className="flex w-[200px] shrink-0 items-center border-r border-border bg-muted/10 px-4 py-4">
                  <span className="truncate text-sm font-medium text-foreground">
                    {project.name}
                  </span>
                </div>
                <div className="relative flex-1 py-4">
                  <div className="relative h-8" style={{ marginLeft: left }}>
                    <motion.div
                      className={cn(
                        "absolute h-full rounded-lg opacity-90 transition-all duration-200 group-hover:opacity-100",
                        project.color
                      )}
                      style={{ width }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      {/* Progress indicator */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg bg-background/20"
                        style={{ width: `${project.progress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="truncate text-xs font-medium text-primary-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface DayData {
  date: Date;
  count: number;
}

const generateMockData = (): DayData[] => {
  const data: DayData[] = [];
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    data.push({
      date: new Date(d),
      count: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
    });
  }

  return data;
};

const getIntensityClass = (count: number): string => {
  if (count === 0) return "bg-muted/30";
  if (count === 1) return "bg-primary/25";
  if (count === 2) return "bg-primary/50";
  if (count === 3) return "bg-primary/75";
  return "bg-primary";
};

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function HeatmapCalendar() {
  const [year, setYear] = useState(2025);
  const data = useMemo(() => generateMockData(), []);

  const weeks = useMemo(() => {
    const result: (DayData | null)[][] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust start to include days from previous year if needed
    const firstDayOfYear = startDate.getDay();
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - firstDayOfYear);

    let currentWeek: (DayData | null)[] = [];
    let currentDate = new Date(adjustedStart);

    while (currentDate <= endDate || currentWeek.length > 0) {
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      if (currentDate > endDate) {
        break;
      }

      const dayData = data.find(
        (d) => d.date.toDateString() === currentDate.toDateString()
      );

      currentWeek.push(
        currentDate.getFullYear() === year ? dayData || { date: new Date(currentDate), count: 0 } : null
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [year, data]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    const sortedData = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const day of sortedData) {
      if (day.count > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [data]);

  const totalDays = data.filter((d) => d.count > 0).length;

  const handleShare = () => {
    toast({
      title: "Streak shared!",
      description: "Your consistency card has been copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Streak Card - Optimized for mobile sharing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mx-auto max-w-sm rounded-2xl p-6 text-center"
      >
        <div className="mb-4 flex items-center justify-center">
          <span className="text-6xl">🔥</span>
        </div>
        <h2 className="text-5xl font-bold text-foreground">{currentStreak}</h2>
        <p className="mt-1 text-lg text-muted-foreground">Day Streak</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div>
            <p className="text-2xl font-semibold text-foreground">{totalDays}</p>
            <p className="text-muted-foreground">Active Days</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {Math.round((totalDays / 365) * 100)}%
            </p>
            <p className="text-muted-foreground">Consistency</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Streak
        </Button>
      </motion.div>

      {/* Heatmap */}
      <div className="glass-card overflow-hidden rounded-2xl p-6">
        {/* Year Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setYear(year - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold text-foreground">{year}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setYear(year + 1)}
            disabled={year >= new Date().getFullYear()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month Labels */}
        <div className="mb-2 ml-8 flex">
          {months.map((month, i) => (
            <div
              key={month}
              className="text-xs text-muted-foreground"
              style={{ width: `${100 / 12}%` }}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1">
          {/* Weekday Labels */}
          <div className="flex flex-col gap-1 pr-2">
            {weekdays.map((day, i) => (
              <div
                key={`${day}-${i}`}
                className="flex h-3 w-4 items-center justify-center text-[10px] text-muted-foreground"
              >
                {i % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="scrollbar-hide flex flex-1 gap-[2px] overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: weekIndex * 0.005 + dayIndex * 0.001,
                      duration: 0.2,
                    }}
                    className={cn(
                      "streak-cell h-3 w-3 rounded-sm",
                      day ? getIntensityClass(day.count) : "bg-transparent"
                    )}
                    title={
                      day
                        ? `${day.date.toLocaleDateString()}: ${day.count} activities`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("h-3 w-3 rounded-sm", getIntensityClass(level))}
            />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

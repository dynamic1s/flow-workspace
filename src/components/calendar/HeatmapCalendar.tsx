import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useSkills } from "@/hooks/useSkills";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIconComponent } from "@/components/skills/CreateSkillDialog";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getIntensityClass = (intensity: string): string => {
  switch (intensity) {
    case 'none': return "bg-muted/30";
    case 'low': return "bg-primary/25";
    case 'medium': return "bg-primary/50";
    case 'high': return "bg-primary";
    default: return "bg-muted/30";
  }
};

export function HeatmapCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedSkillId, setSelectedSkillId] = useState<string>('all');
  const { skills } = useSkills();
  const { getCalendarData, getCurrentStreak, entries } = useTimeEntries(
    selectedSkillId === 'all' ? undefined : selectedSkillId
  );

  const calendarData = getCalendarData();
  const currentStreak = getCurrentStreak();

  const weeks = useMemo(() => {
    const result: { date: Date; intensity: string; seconds: number }[][] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const firstDayOfYear = startDate.getDay();
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - firstDayOfYear);

    let currentWeek: { date: Date; intensity: string; seconds: number }[] = [];
    let currentDate = new Date(adjustedStart);

    while (currentDate <= endDate || currentWeek.length > 0) {
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      if (currentDate > endDate) {
        break;
      }

      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = calendarData[dateStr];

      if (currentDate.getFullYear() === year) {
        currentWeek.push({
          date: new Date(currentDate),
          intensity: dayData?.intensity || 'none',
          seconds: dayData?.totalSeconds || 0,
        });
      } else {
        currentWeek.push({
          date: new Date(currentDate),
          intensity: 'none',
          seconds: 0,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(currentDate),
          intensity: 'none',
          seconds: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      result.push(currentWeek);
    }

    return result;
  }, [year, calendarData]);

  const totalActiveDays = Object.keys(calendarData).filter(
    date => date.startsWith(year.toString()) && calendarData[date].intensity !== 'none'
  ).length;

  const handleShare = () => {
    toast.success("Streak shared! (Coming soon)");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Streak Card */}
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
            <p className="text-2xl font-semibold text-foreground">{totalActiveDays}</p>
            <p className="text-muted-foreground">Active Days</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {Math.round((totalActiveDays / 365) * 100)}%
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

      {/* Filter by Skill */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((skill) => {
                const IconComponent = getIconComponent(skill.icon);
                return (
                  <SelectItem key={skill.id} value={skill.id}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" style={{ color: skill.color }} />
                      {skill.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

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
          {months.map((month) => (
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
                      "streak-cell h-3 w-3 rounded-sm cursor-pointer",
                      day.date.getFullYear() === year 
                        ? getIntensityClass(day.intensity) 
                        : "bg-transparent"
                    )}
                    title={
                      day.date.getFullYear() === year
                        ? `${day.date.toLocaleDateString()}: ${day.seconds > 0 ? formatTime(day.seconds) : 'No activity'}`
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
          <div className={cn("h-3 w-3 rounded-sm", getIntensityClass('none'))} />
          <div className={cn("h-3 w-3 rounded-sm", getIntensityClass('low'))} />
          <div className={cn("h-3 w-3 rounded-sm", getIntensityClass('medium'))} />
          <div className={cn("h-3 w-3 rounded-sm", getIntensityClass('high'))} />
          <span className="text-xs text-muted-foreground">More</span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Low: &lt;1h</span>
          <span>Medium: 1-2h</span>
          <span>High: 3h+</span>
        </div>
      </div>
    </div>
  );
}

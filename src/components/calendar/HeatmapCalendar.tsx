import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapData {
  date: string;
  value: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
}

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const today = new Date();
  const endDate = today;
  const startDate = new Date(today.getFullYear(), 0, 1);

  const dateValues = data.reduce((acc, item) => {
    acc[item.date] = item.value;
    return acc;
  }, {} as Record<string, number>);

  const weeks = [];
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        value: dateValues[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  const getCellColor = (value: number) => {
    if (value === 0) return 'bg-muted/30';
    if (value < 2) return 'bg-primary/20';
    if (value < 4) return 'bg-primary/40';
    if (value < 6) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <TooltipProvider>
      <div className="flex gap-1.5 text-xs text-muted-foreground">
        <div className="w-6 flex flex-col justify-between">
          <div></div>
          <div className="h-full flex flex-col justify-around">
             <span>Mon</span>
             <span>Wed</span>
             <span>Fri</span>
          </div>
          <div></div>
        </div>
        
        <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1.5">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => (
              <Tooltip key={`${weekIndex}-${dayIndex}`}>
                <TooltipTrigger asChild>
                  <div
                    className={cn("w-full h-3.5 rounded-sm", getCellColor(day.value))}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{day.value} hours on {new Date(day.date).toDateString()}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ))}
        </div>
      </div>
       <div className="flex justify-end items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
        <span>More</span>
      </div>
    </TooltipProvider>
  );
}
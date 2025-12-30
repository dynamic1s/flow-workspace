
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { usePlans } from "@/hooks/usePlans";
import { useTasks } from "@/hooks/useTasks";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Helper Components ---

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-3 px-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("w-3 h-3 rounded-sm", item.color)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// --- Main Calendar View Component ---

function CalendarView({ month, onMonthChange, data, getColor, disabled = false, legendItems }) {
  const [currentMonth, setCurrentMonth] = useState(month);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const placeholders = Array.from({ length: startingDayIndex }, (_, i) => (
    <div key={`placeholder-${i}`} className="h-24" />
  ));

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    setCurrentMonth(new Date(prevMonth));
    onMonthChange(new Date(prevMonth));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() + 1));
    setCurrentMonth(new Date(nextMonth));
    onMonthChange(new Date(nextMonth));
  };

  return (
    <Card className={cn(disabled && "opacity-50 pointer-events-none")}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <CardTitle className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-muted-foreground text-xs mb-1">
          <div>S</div> <div>M</div> <div>T</div> <div>W</div> <div>T</div> <div>F</div> <div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {placeholders}
          {daysInMonth.map((day) => {
            const dayData = data.find(d => isSameDay(d.date, day));
            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-24 rounded-md p-1.5 text-left border text-xs",
                  getColor(dayData?.value, day),
                  "flex flex-col justify-between"
                )}
              >
                <span className="font-semibold text-foreground">{format(day, 'd')}</span>
                <span className="text-xs font-bold text-right self-end">{dayData?.label || ''}</span>
              </div>
            );
          })}
        </div>
        {legendItems && <Legend items={legendItems} />}
      </CardContent>
    </Card>
  );
}

// --- Skill-Related Goals Calendar ---

function SkillGoalsCalendar() {
  const [month, setMonth] = useState(new Date());
  const [selectedGoal, setSelectedGoal] = useState('all');
  const { goals } = useGoals();
  const { entries: time_entries } = useTimeEntries();

  const skillRelatedGoals = goals.filter(s => s.type === 'skill');
  const selectedGoalObject = selectedGoal === 'all' ? null : goals.find(g => g.id === selectedGoal);
  const goalStartDate = selectedGoalObject ? new Date(selectedGoalObject.created_at) : null;

  const dailyTime = time_entries.reduce((acc: { [key: string]: number }, entry) => {
    const isGoalMatch = selectedGoal === 'all' 
      ? skillRelatedGoals.some(g => g.id === entry.goal_id)
      : entry.goal_id === selectedGoal;

    if (isGoalMatch) {
        const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + entry.duration_seconds;
    }
    return acc;
  }, {});

  const calendarData = Object.entries(dailyTime).map(([date, totalSeconds]) => ({
    date: new Date(date),
    value: totalSeconds / 3600,
    label: `${(totalSeconds / 3600).toFixed(1)}h`
  }));
  
  const getColor = (value: number | undefined, date: Date) => {
    if (value !== undefined) {
        if (value <= 1) return 'bg-sky-200 dark:bg-sky-800';
        if (value <= 2) return 'bg-teal-200 dark:bg-teal-800';
        return 'bg-emerald-300 dark:bg-emerald-700';
    }
    if (goalStartDate && isAfter(date, goalStartDate) && isBefore(date, new Date())) {
        return 'bg-rose-200/50 dark:bg-rose-900/50'; // Failed color
    }
    return 'bg-muted/30';
  };

  const legendItems = [
    { color: 'bg-sky-200 dark:bg-sky-800', label: 'Low (<=1hr)' },
    { color: 'bg-teal-200 dark:bg-teal-800', label: 'Medium (1-2hr)' },
    { color: 'bg-emerald-300 dark:bg-emerald-700', label: 'High (>2hr)' },
    { color: 'bg-rose-200/50 dark:bg-rose-900/50', label: 'Missed' },
  ];

  return (
    <div>
      <Select onValueChange={setSelectedGoal} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[320px] mb-4">
          <SelectValue placeholder="Select a goal to display" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Skill-Related Goals</SelectItem>
          {skillRelatedGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <CalendarView month={month} onMonthChange={setMonth} data={calendarData} getColor={getColor} legendItems={legendItems} />
    </div>
  );
}

// --- Non-Skill-Related Goals Calendar ---

function NonSkillGoalsCalendar() {
  const [month, setMonth] = useState(new Date());
  const { goals } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(goals.find(g => g.type === 'non-skill')?.id || null);
  const { plans } = usePlans(selectedGoal);

  const nonSkillRelatedGoals = goals.filter(g => g.type === 'non-skill');
  const selectedGoalObject = selectedGoal ? goals.find(g => g.id === selectedGoal) : null;
  const goalStartDate = selectedGoalObject ? new Date(selectedGoalObject.created_at) : null;

  const completedPlansByDay = (plans || [])
    .filter(p => p.completed && p.to_be_completed_date)
    .reduce((acc: { [key: string]: number }, plan) => {
        const date = format(new Date(plan.to_be_completed_date!), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

  const calendarData = Object.entries(completedPlansByDay).map(([date, count]) => ({
    date: new Date(date),
    value: count,
    label: `${count}`
  }));
  
  const getColor = (value: number | undefined, date: Date) => {
    if (value !== undefined) {
        if (value <= 2) return 'bg-sky-200 dark:bg-sky-800'; // Low
        if (value <= 4) return 'bg-teal-200 dark:bg-teal-800'; // Medium
        return 'bg-emerald-300 dark:bg-emerald-700'; // High
    }
    if (goalStartDate && isAfter(date, goalStartDate) && isBefore(date, new Date())) {
        return 'bg-rose-200/50 dark:bg-rose-900/50'; // Failed
    }
    return 'bg-muted/30';
  };

  const legendItems = [
    { color: 'bg-sky-200 dark:bg-sky-800', label: 'Low (1-2)' },
    { color: 'bg-teal-200 dark:bg-teal-800', label: 'Medium (3-4)' },
    { color: 'bg-emerald-300 dark:bg-emerald-700', label: 'High (5+)' },
    { color: 'bg-rose-200/50 dark:bg-rose-900/50', label: 'Missed' },
  ];
  
  return (
    <div>
      <Select onValueChange={(val) => setSelectedGoal(val)} value={selectedGoal || ''}>
        <SelectTrigger className="w-full sm:w-[320px] mb-4">
          <SelectValue placeholder="Select a non-skill goal" />
        </SelectTrigger>
        <SelectContent>
          {nonSkillRelatedGoals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <CalendarView month={month} onMonthChange={setMonth} data={calendarData} getColor={getColor} disabled={!selectedGoal} legendItems={legendItems} />
    </div>
  );
}

// --- Tasks Calendar ---

function TasksCalendar() {
  const [month, setMonth] = useState(new Date());
  const { tasks } = useTasks();

  const tasksByDay = (tasks || []).filter(t => t.due_date).reduce((acc: { [key: string]: { total: number; completed: number } }, task) => {
    const date = format(new Date(task.due_date!), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = { total: 0, completed: 0 };
    acc[date].total += 1;
    if (task.completed) acc[date].completed += 1;
    return acc;
  }, {});
    
  const calendarData = Object.entries(tasksByDay).map(([date, { total, completed }]) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return {
      date: new Date(date),
      value: percentage,
      label: `${Math.round(percentage)}%`
    };
  });
  
  const getColor = (value: number | undefined) => {
    if (value === undefined) return 'bg-muted/30';
    if (value < 40) return 'bg-rose-200/50 dark:bg-rose-900/50';
    if (value < 70) return 'bg-amber-200 dark:bg-amber-800';
    return 'bg-emerald-300 dark:bg-emerald-700';
  };

  const legendItems = [
    { color: 'bg-emerald-300 dark:bg-emerald-700', label: '>=70%' },
    { color: 'bg-amber-200 dark:bg-amber-800', label: '40-69%' },
    { color: 'bg-rose-200/50 dark:bg-rose-900/50', label: '<40%' },
  ];
  
  return <CalendarView month={month} onMonthChange={setMonth} data={calendarData} getColor={getColor} legendItems={legendItems} />;
}

// --- Main Export ---

export default function CalendarPage() {
  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Progress Calendars</h1>
      <Tabs defaultValue="skill-goals">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skill-goals">Skill Goals</TabsTrigger>
          <TabsTrigger value="non-skill-goals">Life Goals</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="skill-goals" className="mt-4"><SkillGoalsCalendar /></TabsContent>
        <TabsContent value="non-skill-goals" className="mt-4"><NonSkillGoalsCalendar /></TabsContent>
        <TabsContent value="tasks" className="mt-4"><TasksCalendar /></TabsContent>
      </Tabs>
    </div>
  );
}

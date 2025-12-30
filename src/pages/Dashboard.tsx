import { TrendingUp, Flame, Clock, Plus } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { DailyFocus } from "@/components/dashboard/DailyFocus";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FocusTimer } from "@/components/focus/FocusTimer";
import { MasteryProgress } from "@/components/focus/MasteryProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { goals } = useGoals();
  const { todayTasks, completionRate, completedTodayCount } = useTasks();
  const [isCreateGoalOpen, setCreateGoalOpen] = useState(false);

  const totalSeconds = goals.reduce((acc, goal) => acc + goal.total_seconds, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const remainingTasks = todayTasks.filter(t => !t.completed).length;

  return (
    <div className="container max-w-6xl py-8">
      <CreateGoalDialog open={isCreateGoalOpen} onOpenChange={setCreateGoalOpen} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Good morning, {displayName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here's your productivity overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Hours"
          value={`${totalHours}h`}
          change="Towards mastery"
          icon={Clock}
          trend="up"
          delay={0}
        />
        <StatsCard
          title="Active Goals"
          value={goals.length}
          change="Being tracked"
          icon={TrendingUp} 
          trend="up"
          delay={0.1}
        />
        <StatsCard
          title="Tasks Done Today"
          value={completedTodayCount}
          change="Keep it up!"
          icon={Flame}
          trend="up"
          delay={0.2}
        />
        <button onClick={() => setCreateGoalOpen(true)} className="text-left">
          <StatsCard
            title="Create Goal"
            value=""
            change="Start a new journey"
            icon={Plus}
            trend="up"
            delay={0.3}
          />
        </button>
      </div>

      {/* Focus Timer & Mastery Progress */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <FocusTimer />
        <MasteryProgress />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        {/* Progress Ring */}
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-8 w-full">
          <ProgressRing progress={completionRate} className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64" />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {completionRate > 80 ? "You're on fire today!" : "You're making great progress!"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {remainingTasks > 0 ? `${remainingTasks} tasks remaining` : "All tasks complete! 🎉"}
            </p>
          </div>
        </div>

        {/* Daily Focus List */}
        <DailyFocus />
      </div>

      {/* Calendar View */}
      
    </div>
  );
}

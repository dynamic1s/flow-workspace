import { Target, TrendingUp, Flame, Clock } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { DailyFocus } from "@/components/dashboard/DailyFocus";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Good morning, Alex</h1>
        <p className="mt-1 text-muted-foreground">
          Here's your productivity overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Tasks Completed"
          value={12}
          change="+3 from yesterday"
          icon={Target}
          trend="up"
          delay={0}
        />
        <StatsCard
          title="Current Streak"
          value="7 days"
          change="Personal best!"
          icon={Flame}
          trend="up"
          delay={0.1}
        />
        <StatsCard
          title="Focus Time"
          value="4.5h"
          change="+45min"
          icon={Clock}
          trend="up"
          delay={0.2}
        />
        <StatsCard
          title="Productivity"
          value="87%"
          change="+12% this week"
          icon={TrendingUp}
          trend="up"
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Ring */}
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-8">
          <ProgressRing progress={67} size={220} strokeWidth={14} />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              You're ahead of schedule today!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              4 tasks remaining • Est. 2h to complete
            </p>
          </div>
        </div>

        {/* Daily Focus List */}
        <DailyFocus />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Start Focus", emoji: "🎯" },
            { label: "Add Task", emoji: "➕" },
            { label: "View Calendar", emoji: "📅" },
            { label: "Team Chat", emoji: "💬" },
          ].map((action, i) => (
            <button
              key={action.label}
              className="glass-card flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-muted/50"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

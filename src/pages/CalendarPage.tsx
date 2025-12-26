import { motion } from "framer-motion";
import { HeatmapCalendar } from "@/components/calendar/HeatmapCalendar";

export default function CalendarPage() {
  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-foreground">Consistency Calendar</h1>
        <p className="mt-2 text-muted-foreground">
          Track your daily habits and build unbreakable streaks
        </p>
      </motion.div>

      {/* Heatmap Calendar */}
      <HeatmapCalendar />

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            title: "Best Day",
            value: "Monday",
            description: "Most productive day",
            emoji: "📈",
          },
          {
            title: "Peak Hours",
            value: "9am - 11am",
            description: "Your focus window",
            emoji: "⚡",
          },
          {
            title: "Longest Streak",
            value: "14 days",
            description: "March 2025",
            emoji: "🏆",
          },
        ].map((insight, i) => (
          <div
            key={insight.title}
            className="glass-card rounded-xl p-5 text-center"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="text-3xl">{insight.emoji}</span>
            <p className="mt-3 text-xl font-bold text-foreground">{insight.value}</p>
            <p className="text-sm font-medium text-foreground">{insight.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

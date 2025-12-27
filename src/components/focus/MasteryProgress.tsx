import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import { useSkills } from '@/hooks/useSkills';
import { Progress } from '@/components/ui/progress';

export function MasteryProgress() {
  const { skills, getTotalSeconds, getMasteryProgress } = useSkills();
  
  const totalSeconds = getTotalSeconds();
  const progress = getMasteryProgress();
  const totalHours = Math.floor(totalSeconds / 3600);
  const targetHours = 10000;
  const remainingHours = Math.max(0, targetHours - totalHours);

  const formatHours = (hours: number) => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toLocaleString();
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Mastery Progress</h2>
      </div>

      {/* Main Progress */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-3xl font-bold text-foreground">{formatHours(totalHours)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Goal</p>
            <p className="text-lg font-semibold text-muted-foreground">{formatHours(targetHours)}h</p>
          </div>
        </div>

        <div className="relative">
          <Progress value={progress} className="h-4" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-primary to-primary/70 overflow-hidden"
          >
            <div className="absolute inset-0 shimmer" />
          </motion.div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">{progress.toFixed(2)}% complete</span>
          <span className="text-sm text-muted-foreground">{formatHours(remainingHours)}h remaining</span>
        </div>
      </div>

      {/* Skills Breakdown */}
      {skills.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Skills Breakdown
          </p>
          
          <div className="space-y-2">
            {skills.slice(0, 5).map((skill) => {
              const hours = Math.floor(skill.total_seconds / 3600);
              const skillProgress = (skill.total_seconds / 36000000) * 100;
              
              return (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: skill.color }}
                      />
                      <span className="text-foreground">{skill.name}</span>
                    </div>
                    <span className="text-muted-foreground">{formatHours(hours)}h</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(skillProgress, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivation Text */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Keep going!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {progress < 1
                ? "Every expert was once a beginner. Start your journey today!"
                : progress < 10
                ? "Great start! Consistency is the key to mastery."
                : progress < 50
                ? "You're making real progress! Keep building your skills."
                : "Incredible dedication! You're on the path to mastery."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

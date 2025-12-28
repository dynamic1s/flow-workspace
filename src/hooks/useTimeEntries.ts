import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TimeEntry {
  id: string;
  user_id: string;
  skill_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  notes: string | null;
  created_at: string;
}

export interface DayActivity {
  date: string;
  totalSeconds: number;
  entries: TimeEntry[];
}

export function useTimeEntries(skillId?: string) {
  const { user } = useAuth();

  const entriesQuery = useQuery({
    queryKey: ['time-entries', user?.id, skillId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (skillId) {
        query = query.eq('skill_id', skillId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!user,
  });

  const getActivityByDate = (): DayActivity[] => {
    const entries = entriesQuery.data || [];
    const activityMap = new Map<string, DayActivity>();
    
    entries.forEach(entry => {
      const date = entry.start_time.split('T')[0];
      
      if (!activityMap.has(date)) {
        activityMap.set(date, {
          date,
          totalSeconds: 0,
          entries: [],
        });
      }
      
      const dayActivity = activityMap.get(date)!;
      dayActivity.totalSeconds += entry.duration_seconds;
      dayActivity.entries.push(entry);
    });
    
    return Array.from(activityMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getIntensityLevel = (totalSeconds: number): 'none' | 'low' | 'medium' | 'high' => {
    if (totalSeconds === 0) return 'none';
    if (totalSeconds < 3600) return 'low'; // < 1 hour
    if (totalSeconds < 7200) return 'medium'; // 1-2 hours
    return 'high'; // 3+ hours
  };

  const getCalendarData = () => {
    const activityByDate = getActivityByDate();
    const calendarData: { [date: string]: { totalSeconds: number; intensity: string } } = {};
    
    activityByDate.forEach(day => {
      calendarData[day.date] = {
        totalSeconds: day.totalSeconds,
        intensity: getIntensityLevel(day.totalSeconds),
      };
    });
    
    return calendarData;
  };

  const getCurrentStreak = () => {
    const activityByDate = getActivityByDate();
    if (activityByDate.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < activityByDate.length; i++) {
      const activityDate = new Date(activityByDate[i].date);
      activityDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (activityDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && activityDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow yesterday if today has no activity yet
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    entries: entriesQuery.data || [],
    isLoading: entriesQuery.isLoading,
    error: entriesQuery.error,
    getActivityByDate,
    getCalendarData,
    getIntensityLevel,
    getCurrentStreak,
  };
}

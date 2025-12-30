import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';

export function CalendarView() {
  const [calendarMode, setCalendarMode] = useState<'skill' | 'non-skill' | 'task'>('skill');

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Calendar View</h2>
        <Select value={calendarMode} onValueChange={(v) => setCalendarMode(v as 'skill' | 'non-skill' | 'task')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Calendar Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skill">Skill-based</SelectItem>
            <SelectItem value="non-skill">Non-skill-based</SelectItem>
            <SelectItem value="task">Task-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        {calendarMode === 'skill' && (
          <HeatmapCalendar data={[]} />
        )}
        {calendarMode === 'non-skill' && (
          <div>Non-skill calendar coming soon...</div>
        )}
        {calendarMode === 'task' && (
          <div>Task-based calendar coming soon...</div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BookOpen, CheckCircle2, Plus, Link2, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useJournal } from '@/hooks/useJournal';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
];

export default function Journal() {
  const { todayEntry, entries, createEntry, updateEntry, createAnnotation, annotations } = useJournal();
  const { todayTasks } = useTasks();
  const [content, setContent] = useState(todayEntry?.content || '');
  const [mood, setMood] = useState(todayEntry?.mood || '');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    
    if (todayEntry) {
      await updateEntry.mutateAsync({
        id: todayEntry.id,
        content: content.trim(),
        mood: mood || null,
      });
    } else {
      await createEntry.mutateAsync({
        content: content.trim(),
        mood: mood || undefined,
      });
    }
  };

  const handleLinkTask = async () => {
    if (!selectedTaskId || !todayEntry) return;
    
    await createAnnotation.mutateAsync({
      journal_entry_id: todayEntry.id,
      task_id: selectedTaskId,
      annotation: annotation.trim() || undefined,
    });
    
    setSelectedTaskId(null);
    setAnnotation('');
    setIsLinkDialogOpen(false);
  };

  const linkedTaskIds = annotations
    .filter(a => a.journal_entry_id === todayEntry?.id)
    .map(a => a.task_id);

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Journal</h1>
            <p className="text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Journal Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Mood Selector */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">How are you feeling today?</h3>
            <div className="flex gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                    mood === m.value 
                      ? "bg-primary/10 ring-2 ring-primary" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Writing Area */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Today's Reflections
              </h3>
              {todayEntry && (
                <Badge variant="secondary" className="text-xs">
                  Last saved: {format(new Date(todayEntry.updated_at), 'h:mm a')}
                </Badge>
              )}
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Reflect on your day, your progress, and your learnings..."
              className="min-h-[300px] resize-none text-base leading-relaxed"
            />
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {content.length} characters
              </p>
              <Button onClick={handleSave} disabled={!content.trim()}>
                {todayEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Sidebar - Today's Completed Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Completed Today
              </h3>
              <Badge variant="outline">{todayTasks.length}</Badge>
            </div>
            
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks completed yet today
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg bg-muted/50 flex items-center justify-between gap-2",
                      linkedTaskIds.includes(task.id) && "ring-1 ring-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm truncate">{task.title}</span>
                    </div>
                    {todayEntry && !linkedTaskIds.includes(task.id) && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setIsLinkDialogOpen(true);
                        }}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {linkedTaskIds.includes(task.id) && (
                      <Badge variant="secondary" className="text-xs">
                        Linked
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Entries */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Previous Entries
            </h3>
            
            {entries.filter(e => e.id !== todayEntry?.id).slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No previous entries yet
              </p>
            ) : (
              <div className="space-y-3">
                {entries.filter(e => e.id !== todayEntry?.id).slice(0, 5).map((entry) => (
                  <button
                    key={entry.id}
                    className="w-full p-3 rounded-lg bg-muted/50 text-left hover:bg-muted transition-colors"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                      {entry.mood && ` • ${MOODS.find(m => m.value === entry.mood)?.emoji}`}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {entry.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Link Task Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Link Task to Journal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Add a note about this task to your journal entry.
            </p>
            <Textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="What did you learn? Any reflections on this task?"
              className="resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleLinkTask} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Link Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

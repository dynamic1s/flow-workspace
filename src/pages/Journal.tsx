
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { BookOpen, CheckCircle2, Plus, Link2, Sparkles, Calendar, Edit2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useJournal } from '@/hooks/useJournal';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', 'value': 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
];

interface AnnotationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAnnotationContent: string;
  onSave: (newAnnotationContent: string) => void;
}

function AnnotationEditDialog({ open, onOpenChange, initialAnnotationContent, onSave }: AnnotationEditDialogProps) {
  const [editedAnnotation, setEditedAnnotation] = useState(initialAnnotationContent);

  useEffect(() => {
    setEditedAnnotation(initialAnnotationContent);
  }, [initialAnnotationContent]);

  const handleSaveClick = () => {
    onSave(editedAnnotation);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Annotation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={editedAnnotation}
            onChange={(e) => setEditedAnnotation(e.target.value)}
            placeholder="Edit your reflection for this task..."
            className="resize-none"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveClick}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Journal() {
  const { todayEntry, entries, createEntry, updateEntry, createAnnotation, updateAnnotation, annotations } = useJournal();
  const { tasks: allTasks, toggleTask } = useTasks(); 
  const { toast } = useToast();
  const [content, setContent] = useState(todayEntry?.content || '');
  const [mood, setMood] = useState(todayEntry?.mood || '');
  const [selectedEntryDate, setSelectedEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskFilter, setTaskFilter] = useState('all');

  useEffect(() => {
    const entry = entries.find(e => e.entry_date === selectedEntryDate);
    setContent(entry?.content || '');
    setMood(entry?.mood || '');
  }, [selectedEntryDate, entries]);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [annotation, setAnnotation] = useState('');

  const [isEditAnnotationDialogOpen, setIsEditAnnotationDialogOpen] = useState(false);
  const [annotationToEditId, setAnnotationToEditId] = useState<string | null>(null);
  const [annotationToEditContent, setAnnotationToEditContent] = useState('');


  const handleSave = async () => {
    if (!content.trim()) return;
    const entry = entries.find(e => e.entry_date === selectedEntryDate);

    if (entry) {
      await updateEntry.mutateAsync({
        id: entry.id,
        content: content.trim(),
        mood: mood || null,
      });
    } else {
      await createEntry.mutateAsync({
        content: content.trim(),
        mood: mood || undefined,
        entry_date: selectedEntryDate,
      });
    }
  };

  const handleLinkTask = async () => {
    if (!selectedTaskId) return;

    try {
      let entry = entries.find(e => e.entry_date === selectedEntryDate);

      if (!entry) {
        entry = await createEntry.mutateAsync({
          content: "Journal entry started to link a task.",
          mood: mood || undefined,
          entry_date: selectedEntryDate,
        });
        toast({
          title: "Journal Entry Created",
          description: "A new entry was automatically created to link your task.",
        });
      }

      if (entry) {
        await createAnnotation.mutateAsync({
          journal_entry_id: entry.id,
          task_id: selectedTaskId,
          annotation: annotation.trim() || undefined,
        });
      }

      setSelectedTaskId(null);
      setAnnotation('');
      setIsLinkDialogOpen(false);
    } catch (error) {
      console.error("Failed to link task:", error);
      toast({
        title: "Error Linking Task",
        description: "Could not link the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAnnotation = async (newAnnotationContent: string) => {
    if (!annotationToEditId) return;

    await updateAnnotation.mutateAsync({
      id: annotationToEditId,
      annotation: newAnnotationContent.trim() || null,
    });

    setAnnotationToEditId(null);
    setAnnotationToEditContent('');
    setIsEditAnnotationDialogOpen(false);
  };

  const linkedAnnotations = annotations.filter(a => a.journal_entry_id === entries.find(e => e.entry_date === selectedEntryDate)?.id);

  const getTaskTitle = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = allTasks.filter(task => {
    if (taskFilter === 'overdue') {
      return task.due_date && new Date(task.due_date) < today && !task.completed;
    }
    if (taskFilter === 'completed') {
      return task.completed;
    }
    if (taskFilter === 'today') {
      return task.due_date && isToday(new Date(task.due_date));
    }
    return true;
  });

  return (
    <div className="container max-w-4xl py-8">
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
              {format(new Date(selectedEntryDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
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

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Today's Reflections
              </h3>
              {entries.find(e => e.entry_date === selectedEntryDate) && (
                <Badge variant="secondary" className="text-xs">
                  Last saved: {format(new Date(entries.find(e => e.entry_date === selectedEntryDate)!.updated_at), 'h:mm a')}
                </Badge>
              )}
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Reflect on your day, your progress, and your learnings..."
              className="min-h-[300px] resize-none text-base leading-relaxed"
            />
            
            {linkedAnnotations.length > 0 && (
              <div className="glass-card-inner rounded-xl p-4 mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Linked Tasks:</h4>
                <div className="space-y-3">
                  {linkedAnnotations.map((ann) => (
                    <button
                      key={ann.id}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => {
                        setAnnotationToEditId(ann.id);
                        setAnnotationToEditContent(ann.annotation || '');
                        setIsEditAnnotationDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{getTaskTitle(ann.task_id)}</p>
                        <Edit2 className="w-4 h-4 text-muted-foreground transition-opacity" />
                      </div>
                      <p className="text-xs text-foreground italic pl-2 border-l-2 border-primary/50">
                        {ann.annotation || "No annotation provided."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {content.length} characters
              </p>
              <Button onClick={handleSave} disabled={!content.trim() && !entries.find(e => e.entry_date === selectedEntryDate)}>
                {entries.find(e => e.entry_date === selectedEntryDate) ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </motion.div>

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
                Tasks
              </h3>
              <Select onValueChange={setTaskFilter} defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="today">Today's</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks match the filter.
              </p>
            ) : (
              <ScrollArea className="h-60">
                <div className="space-y-2 pr-4">
                  {filteredTasks.map((task) => {
                      const isOverdue = task.due_date && new Date(task.due_date) < today && !task.completed;
                      const isLinked = linkedAnnotations.some(a => a.task_id === task.id);
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "p-3 rounded-lg bg-muted/50 flex items-center justify-between gap-2",
                            isOverdue && 'bg-destructive/20',
                            isLinked && "ring-1 ring-primary/50"
                          )}
                        >
                           <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button onClick={() => toggleTask.mutate({ id: task.id, completed: !task.completed })} className="mt-1">
                              <CheckCircle2 className={cn("w-4 h-4 text-green-500 flex-shrink-0", task.completed ? 'opacity-100' : 'opacity-30')} />
                            </button>
                            <div className="flex-1">
                              <span className={cn("text-sm truncate font-medium", isOverdue && 'text-destructive-foreground', task.completed && 'line-through text-muted-foreground')}>{task.title}</span>
                              {task.due_date && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(task.due_date), 'MMM d')}
                                </div>
                              )}
                            </div>
                          </div>
                          {!isLinked ? (
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
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Linked
                            </Badge>
                          )}
                        </div>
                      )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Previous Entries
            </h3>
            
            {entries.filter(e => e.id !== todayEntry?.id).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No previous entries yet
              </p>
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntryDate(entry.entry_date)}
                      className="w-full p-3 rounded-lg bg-muted/50 text-left hover:bg-muted transition-colors"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                        {entry.mood && ` • ${MOODS.find(m => m.value === entry.mood)?.emoji}`}
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {entry.content}
                      </p>
                      {annotations.filter(ann => ann.journal_entry_id === entry.id).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {annotations.filter(ann => ann.journal_entry_id === entry.id).map((ann) => (
                            <div key={ann.id} className="flex flex-col gap-0.5">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Link2 className="w-3 h-3 text-primary/70"/> {getTaskTitle(ann.task_id)}
                              </p>
                              <p className="text-xs text-foreground italic pl-4 border-l border-primary/30">
                                {ann.annotation || "No annotation."}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </motion.div>
      </div>

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

      <AnnotationEditDialog
        open={isEditAnnotationDialogOpen}
        onOpenChange={setIsEditAnnotationDialogOpen}
        initialAnnotationContent={annotationToEditContent}
        onSave={handleUpdateAnnotation}
      />
    </div>
  );
}

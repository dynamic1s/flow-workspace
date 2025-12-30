
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Book, Video, FileText, Briefcase, Trash2, Edit, ExternalLink, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useResources, NewResource, Resource } from '@/hooks/useResources';
import { useGoals } from '@/hooks/useGoals';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const resourceTypeIcons = {
  video: <Video className="w-4 h-4" />,
  article: <FileText className="w-4 h-4" />,
  book: <Book className="w-4 h-4" />,
  course: <Briefcase className="w-4 h-4" />,
};

const resourceTypeColors = {
  video: 'bg-blue-100 text-blue-800',
  article: 'bg-green-100 text-green-800',
  book: 'bg-orange-100 text-orange-800',
  course: 'bg-purple-100 text-purple-800',
};

export default function ResourcesPage() {
  const { resources, isLoading, createResource, updateResource, deleteResource } = useResources();
  const { goals } = useGoals();
  const { register, handleSubmit, control, reset } = useForm<NewResource>();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const { register: editRegister, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<Resource>();

  const onSubmit = (data: NewResource) => {
    createResource.mutate(data, { onSuccess: () => reset() });
  };

  const onEditSubmit = (data: Resource) => {
    if (!selectedResource) return;
    updateResource.mutate({ ...selectedResource, ...data }, { onSuccess: () => setEditDialogOpen(false) });
  };

  const handleDelete = () => {
    if (!selectedResource) return;
    deleteResource.mutate(selectedResource.id, { onSuccess: () => setDeleteDialogOpen(false) });
  };

  return (
    <div className="container max-w-7xl py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Library className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Resource Library</h1>
                    <p className="text-muted-foreground">Manage and organize your learning materials.</p>
                </div>
            </div>
          <Badge variant="outline">Total Resources: {resources.length}</Badge>
        </div>
      </motion.div>

      <Card className="mb-8 glass-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
            <Input id="title" placeholder="e.g. React Patterns" {...register('title', { required: true })} />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="url" className="block text-sm font-medium text-muted-foreground mb-1">URL</label>
            <Input id="url" placeholder="https://..." {...register('url', { required: true })} />
          </div>
          <div>
            <label htmlFor="goal_id" className="block text-sm font-medium text-muted-foreground mb-1">Goal Related To</label>
            <Controller
              name="goal_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                  <SelectTrigger><SelectValue placeholder="Select a goal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {goals.map(goal => <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
            <Controller
              name="type"
              control={control}
              defaultValue="article"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button type="submit" className="w-full lg:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Resource</Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map(resource => (
            <motion.div layout key={resource.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="h-full flex flex-col glass-card">
                <CardContent className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={cn('capitalize', resourceTypeColors[resource.type as keyof typeof resourceTypeColors])}>
                      {resourceTypeIcons[resource.type as keyof typeof resourceTypeIcons]} <span className="ml-1">{resource.type}</span>
                    </Badge>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <h3 className="font-bold text-md mb-2 flex-grow min-h-[40px]">{resource.title}</h3>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Book className="w-4 h-4 mr-2" />
                    <span>{resource.skills?.name || 'General'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>{format(new Date(resource.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-auto border-t pt-2 border-muted/50">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedResource(resource); setEditDialogOpen(true); resetEditForm(resource); }}>
                      <Edit className="h-4 w-4 mr-1" /> Modify
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setSelectedResource(resource); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
             <Input {...editRegister('title')} placeholder="Title" />
             <Input {...editRegister('url')} placeholder="URL" />
             <DialogFooter>
              <Button type="submit">Save Changes</Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Resource</DialogTitle></DialogHeader>
            <p>Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}

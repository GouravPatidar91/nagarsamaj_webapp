import { useState } from 'react';
import { Plus, Trash2, Edit, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, useAllArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const categories = ['Community', 'Culture', 'Business', 'Education', 'Health', 'Technology'];

interface ArticleForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string;
  status: string;
  featured: boolean;
}

const defaultForm: ArticleForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category: 'Community',
  image_url: '',
  status: 'draft',
  featured: false,
};

export function AdminArticlesTab() {
  const { toast } = useToast();
  const { data: articles, isLoading } = useAllArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(defaultForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.category) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: form.title,
          slug,
          content: form.content,
          excerpt: form.excerpt || null,
          category: form.category,
          image_url: form.image_url || null,
          status: form.status,
          featured: form.featured,
          published_at: form.status === 'published' ? new Date().toISOString() : null,
        });
        toast({ title: 'Article updated' });
      } else {
        await createMutation.mutateAsync({
          title: form.title,
          slug,
          content: form.content,
          excerpt: form.excerpt || null,
          category: form.category,
          image_url: form.image_url || null,
          status: form.status,
          featured: form.featured,
          published_at: form.status === 'published' ? new Date().toISOString() : null,
        });
        toast({ title: 'Article created' });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      image_url: article.image_url || '',
      status: article.status || 'draft',
      featured: article.featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Article deleted' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const filteredArticles = articles?.filter(article => {
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold">Articles ({filteredArticles?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setForm(defaultForm); setEditingId(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Article
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Title</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Category</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Date</th>
              <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles?.map((article) => (
              <tr key={article.id} className="border-b border-border/30 hover:bg-card/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium max-w-xs truncate">{article.title}</span>
                    {article.featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                    {article.category}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    article.status === 'published' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                  }`}>
                    {article.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {article.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(article.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => handleEdit(article)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(article.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {(!filteredArticles || filteredArticles.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No articles found. Create your first article!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Article' : 'Create Article'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the article details below.' : 'Fill in the details to create a new article.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Article title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Excerpt</Label>
                <Input
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Content *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Article content..."
                  rows={6}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

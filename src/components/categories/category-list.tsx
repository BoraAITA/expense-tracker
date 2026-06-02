"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryItem } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryFormDialog } from "./category-form-dialog";
import { useToast } from "@/hooks/use-toast";

interface CategoryListProps {
  categories: CategoryItem[];
  onChanged: () => void;
}

export function CategoryList({ categories, onChanged }: CategoryListProps) {
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Kategori silindi" });
      onChanged();
    } catch {
      toast({ title: "Silme başarısız", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (categories.length === 0) {
    return <EmptyState title="Kategori yok" description="Yeni kategori ekleyin." />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <div>
                <p className="font-medium">{cat.name}</p>
                <Badge variant="secondary" className="mt-1">
                  {cat._count?.expenses ?? 0} gider
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="min-h-10 min-w-10"
                onClick={() => setEditCategory(cat)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-10 min-w-10"
                onClick={() => setDeleteId(cat.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CategoryFormDialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
        category={editCategory}
        onSaved={() => {
          onChanged();
          setEditCategory(null);
        }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Kategoriyi sil"
        description="İlişkili giderlerin kategorisi kaldırılacak. Devam edilsin mi?"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}

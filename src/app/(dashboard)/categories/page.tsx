"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryList } from "@/components/categories/category-list";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CategoryItem } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  function fetchCategories() {
    setLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <Header
        title="Kategoriler"
        description="Gider kategorilerinizi yönetin"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kategori
          </Button>
        }
      />
      <div className="p-4 sm:p-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CategoryList categories={categories} onChanged={fetchCategories} />
        )}
      </div>
      <CategoryFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSaved={fetchCategories}
      />
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Category } from '../types/database';
import { productsService } from '../services/productsService';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await productsService.getAllCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    setSaving(true);
    try {
      const slug =
        editingCategory.slug ||
        editingCategory.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      await productsService.saveCategory({
        ...editingCategory,
        slug,
      });

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products linked to it will become uncategorized.')) return;
    try {
      await productsService.deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
            Category Management
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Configure fine jewelry taxonomy: Rings, Chains, Bracelets, Necklaces.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-wider font-medium hover:bg-[#8C6D17] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-[#E8E4DA] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin mb-2" />
            <span className="text-xs text-[#777777]">Loading categories...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E8E4DA] text-[10px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Sort Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE2]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAF9F5]">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 bg-[#F5F3EC] border border-[#E8E4DA] overflow-hidden">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#999999]">
                          None
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-medium text-[#111111]">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#777777]">
                    /jewelry/{cat.slug}
                  </td>
                  <td className="py-3 px-4 text-[#555555] max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono">{cat.sort_order}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                        cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 border border-[#D6CEBE] text-[#111111] hover:bg-[#FAF9F5]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border border-[#E8E4DA] shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-6">
              <h3 className="font-serif text-2xl text-[#111111]">
                {editingCategory.id ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#888888]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Rings, Chains, Bracelets, Necklaces"
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="auto-generated from name if blank"
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                />
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.sort_order || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                    className="w-24 bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={editingCategory.is_active ?? true}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                    className="accent-[#111111]"
                  />
                  <span>Active in Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D6CEBE] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-wider font-medium hover:bg-[#8C6D17]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

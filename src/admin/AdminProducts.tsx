import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Sparkles,
  Search,
} from 'lucide-react';
import { Product, Category } from '../types/database';
import { productsService } from '../services/productsService';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, cats] = await Promise.all([
        productsService.getProducts({ limit: 100 }),
        productsService.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading products for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct({
      name: '',
      slug: '',
      sku: `KJ-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      price: 50000,
      discount_price: null,
      category_id: categories[0]?.id || null,
      material: '22K Hallmarked Gold',
      weight: '12.0 grams',
      dimensions: 'Standard Luxury',
      colour: 'Yellow Gold',
      collection: 'Temple Heritage',
      occasion: 'Festive & Bridal',
      stock_quantity: 5,
      is_featured: false,
      is_active: true,
    });
    setImageUrls([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct({ ...prod });
    setImageUrls(prod.images?.map((i) => i.public_url) || []);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const publicUrl = await productsService.uploadProductImage(file);
      setImageUrls((prev) => [...prev, publicUrl]);
    } catch (err: any) {
      alert(`Storage upload error: ${err.message || 'Make sure jewelry-images bucket exists'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    setSaving(true);
    try {
      const slug =
        editingProduct.slug ||
        editingProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const payload = {
        ...editingProduct,
        slug,
      };

      if (editingProduct.id) {
        // Update existing
        await productsService.updateProduct(editingProduct.id, payload);
      } else {
        // Create new
        const imagesToAttach = imageUrls.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
        }));
        await productsService.createProduct(payload, imagesToAttach);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you wish to delete this creation from the catalog?')) return;
    try {
      await productsService.deleteProduct(id);
      await loadData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleToggleActive = async (prod: Product) => {
    try {
      await productsService.updateProduct(prod.id, { is_active: !prod.is_active });
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (prod: Product) => {
    try {
      await productsService.updateProduct(prod.id, { is_featured: !prod.is_featured });
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.material?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
            Product Management
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Create, edit, price, and publish fine jewelry creations in Supabase.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-wider font-medium hover:bg-[#8C6D17] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-[#E8E4DA] p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#888888]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product name, SKU, metal..."
          className="w-full text-xs text-[#111111] focus:outline-none bg-transparent"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E8E4DA] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin mb-2" />
            <span className="text-xs text-[#777777]">Loading catalog inventory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#777777]">
            No creations found in catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E8E4DA] text-[10px] uppercase tracking-wider text-[#777777]">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE2]">
                {filtered.map((prod) => {
                  const img = prod.images?.[0]?.public_url;
                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-14 bg-[#F5F3EC] border border-[#E8E4DA] overflow-hidden">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#999999]">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-serif text-sm font-medium text-[#111111]">{prod.name}</div>
                        <div className="text-[11px] text-[#777777] font-mono mt-0.5">{prod.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-[#555555]">
                        {categories.find((c) => c.id === prod.category_id)?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#111111] tabular-nums">
                        {formatPrice(prod.price)}
                        {prod.discount_price && (
                          <div className="text-[10px] text-[#8C6D17]">
                            Discount: {formatPrice(prod.discount_price)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-semibold ${
                            prod.stock_quantity === 0
                              ? 'text-red-700'
                              : prod.stock_quantity < 5
                              ? 'text-amber-700'
                              : 'text-emerald-800'
                          }`}
                        >
                          {prod.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`px-2 py-0.5 text-[10px] uppercase font-medium tracking-wider ${
                            prod.is_featured
                              ? 'bg-[#C5A059] text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {prod.is_featured ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`px-2 py-0.5 text-[10px] uppercase font-medium tracking-wider ${
                            prod.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.is_active ? 'Live' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 border border-[#D6CEBE] text-[#111111] hover:bg-[#FAF9F5]"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white border border-[#E8E4DA] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA] mb-6">
              <h3 className="font-serif text-2xl text-[#111111]">
                {editingProduct.id ? 'Edit Jewelry Piece' : 'Add New Creation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#888888] hover:text-[#111111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              
              {/* Image Upload Area */}
              <div className="p-4 bg-[#FAF9F5] border border-[#E8E4DA] space-y-3">
                <span className="block font-medium uppercase tracking-wider text-[11px] text-[#777777]">
                  Product Imagery (Supabase Storage: jewelry-images)
                </span>
                
                <div className="flex flex-wrap gap-3 items-center">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-20 bg-white border border-[#D6CEBE] overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                        className="absolute top-0 right-0 bg-black/70 text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-16 h-20 border border-dashed border-[#C5A059] flex flex-col items-center justify-center cursor-pointer hover:bg-white text-center p-1">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#8C6D17] mb-1" />
                        <span className="text-[9px] text-[#8C6D17]">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-[10px] text-[#888888]">
                  Or paste external public image URL:
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="url-input"
                    placeholder="https://..."
                    className="flex-1 bg-white border border-[#D6CEBE] px-3 py-1.5 text-xs text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('url-input') as HTMLInputElement;
                      if (input?.value) {
                        setImageUrls([...imageUrls, input.value]);
                        input.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-[#111111] text-white text-[11px]"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value || null })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Discount Price (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.discount_price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discount_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Vault Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock_quantity ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Precious Material
                  </label>
                  <input
                    type="text"
                    value={editingProduct.material || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Gross Weight
                  </label>
                  <input
                    type="text"
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                    placeholder="e.g. 18.4 grams"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={editingProduct.collection || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                    placeholder="e.g. Royal Polki Heritage"
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-[11px] text-[#777777] mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#D6CEBE] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_featured || false}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                      }
                      className="accent-[#111111]"
                    />
                    <span>Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_active ?? true}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, is_active: e.target.checked })
                      }
                      className="accent-[#111111]"
                    />
                    <span>Active in Storefront</span>
                  </label>
                </div>
              </div>

              {/* Submit CTAs */}
              <div className="pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-[#D6CEBE] text-xs hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#111111] text-[#FAF9F5] text-xs uppercase tracking-wider font-medium hover:bg-[#8C6D17] flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product to Supabase'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

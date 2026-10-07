import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react';
import { Product } from '../types/database';
import { productsService } from '../services/productsService';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await productsService.getProducts({ limit: 100 });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock_quantity + delta);
    setUpdatingId(product.id);
    try {
      await productsService.updateProduct(product.id, { stock_quantity: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock_quantity: newStock } : p))
      );
    } catch (err: any) {
      alert(`Stock update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111111]">
          Inventory & Vault Control
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Monitor real-time vault counts and prevent overselling. Quantities update atomically during order settlement.
        </p>
      </div>

      <div className="bg-white border border-[#E8E4DA] p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-[#888888]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by piece title or SKU..."
          className="w-full text-xs text-[#111111] focus:outline-none bg-transparent"
        />
      </div>

      <div className="bg-white border border-[#E8E4DA] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin mb-2" />
            <span className="text-xs text-[#777777]">Auditing vault inventory...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E8E4DA] text-[10px] uppercase tracking-wider text-[#777777]">
              <tr>
                <th className="py-3 px-4">Jewelry Creation</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Current Vault Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE2]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF9F5]">
                  <td className="py-3.5 px-4 font-serif text-sm font-medium text-[#111111]">
                    {prod.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#555555]">
                    {prod.sku}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm font-semibold tabular-nums text-[#111111]">
                      {prod.stock_quantity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {prod.stock_quantity === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-700 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Out of Stock (Disabled in Shop)
                      </span>
                    ) : prod.stock_quantity < 5 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Vault Reserve
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Reserve
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center border border-[#D6CEBE]">
                      <button
                        onClick={() => handleUpdateStock(prod, -1)}
                        disabled={updatingId === prod.id || prod.stock_quantity === 0}
                        className="px-2.5 py-1 text-xs text-[#444444] hover:bg-[#FAF9F5] disabled:opacity-30"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleUpdateStock(prod, 1)}
                        disabled={updatingId === prod.id}
                        className="px-2.5 py-1 text-xs text-[#444444] hover:bg-[#FAF9F5] border-l border-[#D6CEBE]"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateStock(prod, 5)}
                        disabled={updatingId === prod.id}
                        className="px-2.5 py-1 text-xs text-[#444444] hover:bg-[#FAF9F5] border-l border-[#D6CEBE]"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

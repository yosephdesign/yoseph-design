import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export const AdminProducts = () => {
  const { products, deleteProduct, addProduct } = useShop();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80',
      featured: formData.get('featured') === 'on'
    };
    
    addProduct(newProduct);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light tracking-tight">Inventory</h2>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Manage your architectural collection</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none outline-none text-sm focus:ring-1 focus:ring-black rounded-lg transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-colors">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded bg-neutral-100 object-cover" />
                      <div>
                        <p className="text-sm font-bold">{product.name}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        Featured
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">Standard</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600"><Edit2 size={16} /></button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-neutral-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-lg font-light tracking-tight">Add New Object</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Plus size={20} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product Name</label>
                <input name="name" required className="w-full border-b border-neutral-200 py-2 focus:border-black outline-none text-sm" placeholder="e.g. Sculptural Armchair" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Category</label>
                  <select name="category" className="w-full border-b border-neutral-200 py-2 focus:border-black outline-none text-sm bg-transparent">
                    <option>Seating</option>
                    <option>Lighting</option>
                    <option>Tables</option>
                    <option>Storage</option>
                    <option>Decor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Price (USD)</label>
                  <input name="price" type="number" required className="w-full border-b border-neutral-200 py-2 focus:border-black outline-none text-sm" placeholder="4500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Image URL</label>
                <input name="image" className="w-full border-b border-neutral-200 py-2 focus:border-black outline-none text-sm" placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Description</label>
                <textarea name="description" required className="w-full border-b border-neutral-200 py-2 focus:border-black outline-none text-sm min-h-[80px]" placeholder="A brief description of the architectural piece..." />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" name="featured" id="featured" className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black" />
                <label htmlFor="featured" className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Feature on Homepage</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 hover:bg-neutral-50 transition-colors rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-neutral-800 transition-colors rounded-lg">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
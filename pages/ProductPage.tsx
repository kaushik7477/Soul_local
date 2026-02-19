
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

interface ProductPageProps {
  products: Product[];
  addToCart: (productId: string, size: string) => void;
  toggleWishlist: (productId: string) => void;
  wishlist: string[];
}

const ProductPage: React.FC<ProductPageProps> = ({ products, addToCart, toggleWishlist, wishlist }) => {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('relevant');
  const [filterCat, setFilterCat] = useState(searchParams.get('cat') || 'All');
  
  // Tag filter from URL
  const filterTag = searchParams.get('tag');

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (filterCat !== 'All') {
      result = result.filter(p => p.category.some(c => c.toLowerCase() === filterCat.toLowerCase()));
    }

    if (filterTag) {
      result = result.filter(p => p.tags && p.tags.includes(filterTag));
    }

    const gender = searchParams.get('gender');
    if (gender) {
      result = result.filter(p => 
        (p.category && p.category.some(c => c.toLowerCase() === gender.toLowerCase())) ||
        (p.tags && p.tags.some(t => t.toLowerCase() === gender.toLowerCase()))
      );
    }

    const query = searchParams.get('q');
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category.some(c => c.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.offerPrice - b.offerPrice);
    if (sortBy === 'price-high') result.sort((a, b) => b.offerPrice - a.offerPrice);
    if (sortBy === 'discount') result.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

    return result;
  }, [products, filterCat, sortBy, searchParams]);

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">The Collection</h1>
            <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest">{filteredProducts.length} Artifacts Found</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex bg-zinc-900 p-1 rounded-sm">
              {['All', ...CATEGORIES.slice(0, 4)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${filterCat === cat ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-zinc-900 border border-white/5 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-white/20">
                <span>Sort: {sortBy.replace('-', ' ')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => setSortBy('relevant')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">Relevant</button>
                <button onClick={() => setSortBy('price-low')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">Price Low to High</button>
                <button onClick={() => setSortBy('price-high')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">Price High to Low</button>
                <button onClick={() => setSortBy('discount')} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">Most Discounted</button>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
                toggleWishlist={toggleWishlist} 
                isWishlisted={wishlist.includes(product.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 text-zinc-600">
            <Filter className="w-12 h-12 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-sm">No items match your DNA signature</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;

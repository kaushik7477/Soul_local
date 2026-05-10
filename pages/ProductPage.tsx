
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, ChevronDown, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { fetchTags } from '../src/api';

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
  const [tags, setTags] = useState<{ name: string }[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await fetchTags();
        setTags(data);
      } catch (e) {
      }
    };
    loadTags();
  }, []);

  const filterOptions = useMemo(() => {
    const names = tags.map(t => t.name);
    return ['All', ...names];
  }, [tags]);
  
  // Tag filter from URL
  const filterTag = searchParams.get('tag');

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (filterCat !== 'All') {
      const f = filterCat.toLowerCase();
      result = result.filter(p =>
        (p.category && p.category.some(c => c.toLowerCase() === f)) ||
        (p.tags && p.tags.some(t => t.toLowerCase() === f))
      );
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
    if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discountA = a.actualPrice > 0 ? ((a.actualPrice - a.offerPrice) / a.actualPrice) * 100 : 0;
        const discountB = b.actualPrice > 0 ? ((b.actualPrice - b.offerPrice) / b.actualPrice) * 100 : 0;
        return discountB - discountA;
      });
    }

    return result;
  }, [products, filterCat, sortBy, searchParams]);

  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <Helmet>
        <title>The Collection | Soul Stich</title>
        <meta name="description" content="Browse our complete collection of premium apparel. Find T-shirts, Hoodies, Oversized tees and more at Soul Stich." />
      </Helmet>
      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "Soul T-shirt",
              "position": 1,
              "name": "Home",
              "item": "https://thesoulstich.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Collection",
              "item": "https://thesoulstich.com/products"
            }
          ]
        })}
      </script>

      <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">The Collection</h1>
              <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest">{filteredProducts.length} Artifacts Found</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Category Filter */}
              <div className="relative flex items-center bg-zinc-900 rounded-sm p-1 group/filter">
                <button 
                   onClick={() => scroll('left')}
                   className="absolute left-0 z-10 p-1 bg-zinc-900/90 text-white md:hidden"
                 >
                   <ChevronLeft className="w-4 h-4" />
                 </button>
                 
                 <div 
                   ref={scrollContainerRef}
                   className="flex overflow-x-auto no-scrollbar max-w-[85vw] md:max-w-full px-6 md:px-0"
                 >
                   <div className="flex flex-nowrap min-w-max">
                     {filterOptions.map(cat => (
                       <button 
                         key={cat}
                         onClick={() => setFilterCat(cat)}
                         className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterCat === cat ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                 </div>

                 <button 
                   onClick={() => scroll('right')}
                   className="absolute right-0 z-10 p-1 bg-zinc-900/90 text-white md:hidden"
                 >
                   <ChevronRight className="w-4 h-4" />
                 </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full md:w-auto flex items-center justify-between md:justify-start space-x-2 bg-zinc-900 border border-white/5 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-white/20 transition-all"
                >
                  <span>Sort: {sortBy.replace('-', ' ')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-full md:w-48 bg-zinc-900 border border-white/10 shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => { setSortBy('relevant'); setIsSortOpen(false); }} 
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest ${sortBy === 'relevant' ? 'text-green-500' : 'text-zinc-400'}`}
                    >
                      Relevant
                    </button>
                    <button 
                      onClick={() => { setSortBy('price-low'); setIsSortOpen(false); }} 
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest ${sortBy === 'price-low' ? 'text-green-500' : 'text-zinc-400'}`}
                    >
                      Price Low to High
                    </button>
                    <button 
                      onClick={() => { setSortBy('price-high'); setIsSortOpen(false); }} 
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest ${sortBy === 'price-high' ? 'text-green-500' : 'text-zinc-400'}`}
                    >
                      Price High to Low
                    </button>
                    <button 
                      onClick={() => { setSortBy('discount'); setIsSortOpen(false); }} 
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest ${sortBy === 'discount' ? 'text-green-500' : 'text-zinc-400'}`}
                    >
                      Most Discounted
                    </button>
                  </div>
                )}
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


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { Product, User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  cartCount: number;
  wishlistCount: number;
  products: Product[];
}

const Header: React.FC<HeaderProps> = ({ user, cartCount, wishlistCount, products }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const navigate = useNavigate();
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      // Filter from actual products passed via props
      const filtered = products.filter(p => 
        p.sku !== 'DUMMY-ERR' && (
          p.name.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q) ||
          p.category.some(c => c.toLowerCase().includes(q))
        )
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (id: string) => {
    navigate(`/product/${id}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-[100] bg-black border-b border-white/10 text-white font-heading">
      <div className="container mx-auto px-4 lg:px-8 h-14 md:h-20 flex items-center justify-between relative">
        
        {/* Left: Desktop Menu & Mobile Hamburger */}
        <div className="flex items-center">
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 mr-2">
            <Menu className="w-6 h-6" />
          </button>
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-widest uppercase">
            <Link to="/" className="hover:text-green-500 transition-colors">Home</Link>
            <Link to="/products?gender=Men" className="hover:text-green-500 transition-colors">Men</Link>
            <Link to="/products?gender=Women" className="hover:text-green-500 transition-colors">Women</Link>
          </nav>
        </div>

        {/* Center: Logo - Fixed z-index and spacing for mobile */}
        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
          <span className="flex items-center">
            <span className="text-xl md:text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-zinc-500 bg-clip-text">
              SOUL STICH
            </span>
            <span className="ml-1 text-[0.4em] md:text-[0.45em] text-white font-semibold translate-y-[-0.8em] md:translate-y-[-0.95em]">
              TM
            </span>
          </span>
          <span className="text-[8px] md:text-[10px] tracking-[0.3em] font-light text-zinc-500 uppercase -mt-1">Premium Apparel</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 md:space-x-6">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-green-500 transition-colors p-2">
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <Link to="/profile" className="hover:text-green-500 transition-colors p-2">
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          {/* Wishlist Hidden on Mobile as requested */}
          <Link to="/wishlist" className="hidden md:block hover:text-green-500 transition-colors p-2 relative">
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="hover:text-green-500 transition-colors p-2 relative">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <>
          {/* Backdrop - High z-index to cover everything including header */}
          <div 
            className="fixed inset-0 z-[105] bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsSearchOpen(false)}
          />
          
          <div ref={searchRef} className="absolute top-full left-0 w-full p-4 z-[110] animate-in slide-in-from-top duration-300">
            <div className="container mx-auto max-w-2xl relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Type to search (Name, SKU, Category)..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-full focus:outline-none focus:border-green-500 transition-all shadow-2xl placeholder:text-zinc-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white">
                  <Search className="w-5 h-5" />
                </button>
              </form>
              
              {suggestions.length > 0 && (
                <div className="mt-2 border border-white/10 rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/5 bg-black/60 backdrop-blur-xl">
                  {suggestions.map(suggestion => (
                    <button 
                      key={suggestion.id} 
                      onClick={() => handleSuggestionClick(suggestion.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <img src={suggestion.images[0]} alt="" className="w-12 h-12 object-cover rounded-md" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-tight text-white">{suggestion.name}</span>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{suggestion.sku}</span>
                      </div>
                      <span className="ml-auto text-green-500 font-black text-sm">₹{suggestion.offerPrice}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-4/5 bg-black border-r border-white/10 p-8 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-bold tracking-tighter">SOUL STICH</span>
              <button onClick={() => setIsMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex flex-col space-y-8 text-2xl font-bold uppercase tracking-tight">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-green-500">Home</Link>
              <Link to="/products?gender=Men" onClick={() => setIsMenuOpen(false)} className="hover:text-green-500">Men</Link>
              <Link to="/products?gender=Women" onClick={() => setIsMenuOpen(false)} className="hover:text-green-500">Women</Link>
              <Link to="/products?cat=hoodie" onClick={() => setIsMenuOpen(false)} className="hover:text-green-500">Hoodies</Link>
            </div>
            <div className="mt-auto pt-10 border-t border-white/10 flex flex-col space-y-6 text-zinc-500 text-sm font-bold uppercase tracking-widest">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                <User className="w-4 h-4" /> <span>My Account</span>
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                <Heart className="w-4 h-4" /> <span>Wishlist</span>
              </Link>
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" /> <span>Shopping Bag</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

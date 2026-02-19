
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  addToCart: (productId: string, size: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart, toggleWishlist, isWishlisted }) => {
  const discount = Math.round(((product.actualPrice - product.offerPrice) / product.actualPrice) * 100);
  
  // Find first available size
  // Added type cast for stock to prevent the error: Operator '>' cannot be applied to types 'unknown' and 'number'.
  const availableSize = Object.entries(product.sizes).find(([_, stock]) => (stock as number) > 0)?.[0] || 'N/A';

  return (
    <div className="group relative bg-black border border-white/5 hover:border-white/20 transition-all duration-300">
      {/* Discount Badge */}
      <div className="absolute top-2 left-2 z-10 bg-green-500 text-black text-[10px] font-black px-2 py-1 uppercase">
        {discount}% OFF
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-green-500 transition-colors"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-green-500 text-green-500' : 'text-white'}`} />
      </button>

      {/* Image Gallery */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img 
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
        )}
      </Link>

      {/* Info */}
      <div className="p-4 bg-zinc-950/50">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-lg font-bold text-green-500">₹{product.offerPrice}</span>
          <span className="text-xs text-zinc-500 line-through">₹{product.actualPrice}</span>
        </div>
        <Link to={`/product/${product.id}`} className="block text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
          {product.name}
        </Link>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{product.category.join(' / ')}</p>
        
        <button 
          onClick={() => addToCart(product.id, availableSize)}
          disabled={availableSize === 'N/A'}
          className="mt-4 w-full flex items-center justify-center space-x-2 border border-white/10 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>{availableSize === 'N/A' ? 'Out of Stock' : 'Add to Bag'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

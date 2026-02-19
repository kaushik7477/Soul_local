
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ChevronRight, Share2, Info, X, ChevronDown, ChevronUp, Check, Banknote, Lock, Gift } from 'lucide-react';
import { Product, FreeGift } from '../types';
import { DUMMY_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { fetchFreeGifts } from '../src/api';

interface ProductDetailsProps {
  products: Product[];
  cart: { productId: string; quantity: number; size: string; isGift?: boolean }[];
  addToCart: (productId: string, size: string, quantity?: number, isGift?: boolean) => void;
  toggleWishlist: (productId: string) => void;
  wishlist: string[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ products, cart, addToCart, toggleWishlist, wishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  
  const [freeGifts, setFreeGifts] = useState<FreeGift[]>([]);

  useEffect(() => {
    const loadGifts = async () => {
        try {
            const data = await fetchFreeGifts();
            setFreeGifts(data.filter((g: FreeGift) => g.isActive));
        } catch (e) {
            // console.error("Failed to load gifts", e);
        }
    };
    loadGifts();
  }, []);

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      const firstAvailable = Object.entries(found.sizes).find(([_, stock]) => (stock as number) > 0)?.[0];
      if (firstAvailable) setSelectedSize(firstAvailable);
      setIsAddedToCart(false); // Reset cart state on product change
    }
    window.scrollTo(0, 0);
  }, [id, products]);

  const handleAddToCart = () => {
    if (product && selectedSize) {
        addToCart(product.id, selectedSize, quantity, false);
        setIsAddedToCart(true);
    }
  };

  const handleClaimGift = () => {
    // If the user clicks claim, we add the gift to cart.
    // We can assume default size or first available size if selectedSize is set,
    // but typically gift might just be added. 
    // Since we are on product page, 'product' is the gift item.
    // 'selectedSize' is selected by user.
    if (product && selectedSize) {
        addToCart(product.id, selectedSize, 1, true);
        setIsAddedToCart(true);
        navigate('/cart');
    } else if (product) {
        // If size not selected, maybe prompt or select first?
        // But UI disables Add to Cart if size not selected.
        // For claim button, we should probably ensure size is selected.
        // But wait, the Claim button is separate from the main Add to Bag button.
        // Does the Claim button require size selection?
        // The main size selector updates 'selectedSize'.
        // So we should check selectedSize.
        if (!selectedSize) {
            // If no size selected, maybe alert or just try to select first available?
            const firstAvailable = Object.entries(product.sizes).find(([_, stock]) => (stock as number) > 0)?.[0];
            if (firstAvailable) {
                 addToCart(product.id, firstAvailable, 1, true);
                 setIsAddedToCart(true);
                 navigate('/cart');
            }
        } else {
             addToCart(product.id, selectedSize, 1, true);
             setIsAddedToCart(true);
             navigate('/cart');
        }
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  if (!product) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Scanning Soul Stitch Records...</div>;

  const currentStock = product.sizes && selectedSize ? product.sizes[selectedSize] : 0;
  const discount = Math.round(((product.actualPrice - product.offerPrice) / product.actualPrice) * 100);

  // GIFTS Logic
  const cartSubtotal = cart.reduce((acc, item) => {
    // Only count non-gift items for eligibility
    if (item.isGift) return acc;
    const p = products.find(prod => prod.id === item.productId);
    return acc + (p ? p.offerPrice * item.quantity : 0);
  }, 0);

  const matchedGift = freeGifts.find(g => g.sku === product.sku);
  const isEligibleForFree = matchedGift && cartSubtotal >= matchedGift.minBilling;
  const isGiftInCart = cart.some(item => item.productId === product.id && item.isGift);

  return (
    <div className="bg-black min-h-screen text-white pt-6 md:pt-12 pb-24">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-zinc-500 mb-8">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-white">Collection</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 ">
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto no-scrollbar md:w-24">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-20 md:w-full aspect-[3/4] border ${activeImage === i ? 'border-green-500' : 'border-white/10'} overflow-hidden transition-all`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="order-1 md:order-2 w-full h-[90vh] overflow-hidden bg-transparent border-none">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wide leading-tight">{product.name}</h1>
              <p className="text-sm tracking-[0.2em] text-zinc-400 font-bold uppercase">{product.category.join(' • ')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-black text-green-500">₹{product.offerPrice}</span>
                <span className="text-xl text-zinc-500 line-through">₹{product.actualPrice}</span>
                <span className="bg-green-500/10 text-green-500 px-3 py-1 text-xs font-black rounded-full">{discount}% OFF</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Inclusive of all taxes</p>
            </div>

            {matchedGift && (
                <div className={`p-4 rounded-xl border ${isEligibleForFree ? 'bg-green-500/10 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {isEligibleForFree ? (
                                <Gift className="w-5 h-5 text-green-500" />
                            ) : (
                                <Lock className="w-5 h-5 text-zinc-500" />
                            )}
                            <div>
                                <h4 className={`text-sm font-black uppercase tracking-wider ${isEligibleForFree ? 'text-green-500' : 'text-zinc-500'}`}>
                                    {isEligibleForFree ? 'Gift Unlocked!' : 'Gift Locked'}
                                </h4>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {isEligibleForFree 
                                        ? `You've unlocked this gift! Add it to your cart${matchedGift.price ? ` for ₹${matchedGift.price}` : ''}.` 
                                        : `Shop for ₹${Math.max(0, matchedGift.minBilling - cartSubtotal)} more to unlock this gift.`
                                    }
                                </p>
                            </div>
                        </div>
                        
                        {isGiftInCart ? (
                             <button 
                                disabled
                                className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed flex items-center space-x-2"
                            >
                                <Check className="w-3 h-3" />
                                <span>Claimed</span>
                            </button>
                        ) : isEligibleForFree ? (
                            <button 
                                onClick={handleClaimGift}
                                className="bg-green-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center space-x-2"
                            >
                                <Gift className="w-3 h-3" />
                                <span>Claim</span>
                            </button>
                        ) : (
                            <button 
                                disabled
                                className="bg-zinc-800 text-zinc-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed flex items-center space-x-2"
                            >
                                <Lock className="w-3 h-3" />
                                <span>Locked</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="p-4 bg-zinc-950 border-l-4 border-zinc-800">
              <p className="text-xs text-zinc-400 leading-relaxed"><span className="text-white font-bold uppercase mr-2">The Quality:</span>{product.quality}</p>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest">Select Size</h3>
                <button onClick={() => setShowSizeGuide(true)} className="text-[10px] text-zinc-500 underline flex items-center space-x-1 hover:text-white">
                  <Info className="w-3 h-3" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(product.sizes).map(([size, stock]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] px-4 py-3 text-sm font-bold border transition-all ${
                      selectedSize === size ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSize && currentStock > 0 && currentStock <= 10 && (
                <p className="text-xs text-red-400/80 font-medium italic">Hurry! Only {currentStock} left in stock</p>
              )}
              {selectedSize && currentStock === 0 && (
                <div className="p-4 bg-zinc-900 border border-white/5 flex flex-col space-y-2">
                  <p className="text-sm text-zinc-500">This size is currently unavailable.</p>
                  <button 
                    onClick={() => setShowNotifyModal(true)}
                    className="text-xs text-green-500 font-bold uppercase tracking-widest hover:underline text-left"
                  >
                    Notify me when available
                  </button>
                </div>
              )}
            </div>

            {/* Color Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Colour: <span className="text-zinc-400 ml-1">{product.color?.name || 'Standard'}</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Current Product Color */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-green-500 p-0.5 cursor-default shadow-lg shadow-green-500/20"
                    title={product.color?.name || 'Current'}
                  >
                    <div 
                      className="w-full h-full rounded-full" 
                      style={{ backgroundColor: product.color?.hex || '#333' }}
                    />
                  </div>
                </div>

                {/* Linked Product Colors */}
                {product.linkedProducts && product.linkedProducts.length > 0 && product.linkedProducts.map(linkedSku => {
                  const linkedProd = products.find(p => p.sku === linkedSku);
                  if (!linkedProd) return null;
                  
                  return (
                    <Link 
                      key={linkedSku}
                      to={`/product/${linkedProd.id}`}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-white/10 p-0.5 group-hover:border-white/40 transition-all"
                        title={linkedProd.color?.name || linkedSku}
                      >
                        <div 
                          className="w-full h-full rounded-full" 
                          style={{ backgroundColor: linkedProd.color?.hex || '#333' }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => isAddedToCart ? navigate('/cart') : handleAddToCart()}
                disabled={!selectedSize || currentStock === 0}
                className={`flex-grow py-5 text-sm font-black uppercase tracking-[0.2em] transition-all disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center space-x-3 ${isAddedToCart ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-green-500'}`}
              >
                {isAddedToCart ? (
                    <><Check className="w-5 h-5" /> <span>Go for Checkout</span></>
                ) : (
                    <><ShoppingBag className="w-5 h-5" /> <span>{currentStock === 0 ? 'Sold Out' : 'Add to Bag'}</span></>
                )}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-5 border transition-all ${wishlist.includes(product.id) ? 'bg-green-500 text-black border-green-500' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}
              >
                <Heart className={`w-6 h-6 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Key Highlights */}
            <div className="pt-8 border-t border-white/5 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Key Highlights</h3>
              <div className="grid grid-cols-2 gap-y-6 text-xs tracking-wider">
                <div>
                  <p className="text-zinc-500 mb-1">SKU Number</p>
                  <p className="font-bold uppercase">{product.sku}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Country of Origin</p>
                  <p className="font-bold uppercase">{product.countryOfOrigin || 'India'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Mfg Date</p>
                  <p className="font-bold uppercase">{product.manufactureDate ? new Date(product.manufactureDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Category</p>
                  <p className="font-bold uppercase">{product.category.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Product Details Accordion */}
            <div className="border-t border-white/5 mt-8">
                {/* Description */}
                <div className="border-b border-white/5">
                    <button onClick={() => toggleAccordion('description')} className="w-full py-6 flex items-center justify-between text-left group">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-white group-hover:text-black transition-colors">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-green-500 transition-colors">Product Description</h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Manufacture, Care and Fit</p>
                            </div>
                        </div>
                        {activeAccordion === 'description' ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'description' ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm text-zinc-400 leading-relaxed pl-[3.5rem] pr-4 whitespace-pre-line">
                            {product.description || "No description available."}
                        </p>
                    </div>
                </div>

                {/* Cash on Delivery */}
                <div className="border-b border-white/5 py-6 flex items-center space-x-4">
                     <div className="p-2 bg-zinc-900 rounded-lg text-green-500">
                        <Banknote className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Cash on Delivery</h4>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Available on all orders</p>
                     </div>
                </div>

                {/* Returns & Exchange */}
                <div className="border-b border-white/5">
                    <button onClick={() => toggleAccordion('returns')} className="w-full py-6 flex items-center justify-between text-left group">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-white group-hover:text-black transition-colors">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest group-hover:text-green-500 transition-colors">Returns & Exchange</h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Know about return & exchange policy</p>
                            </div>
                        </div>
                        {activeAccordion === 'returns' ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${activeAccordion === 'returns' ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                        <div className="text-sm text-zinc-400 leading-relaxed pl-[3.5rem] pr-4 space-y-2">
                             <p><span className="text-white font-bold uppercase text-xs">Exchange Policy:</span> {product.exchangePolicy?.type === 'no-exchange' ? 'No Exchange' : `${product.exchangePolicy?.days || 7} Days Exchange Policy`}</p>
                             <p><span className="text-white font-bold uppercase text-xs">Cancellation Policy:</span> {product.cancelPolicy || 'Orders can be cancelled before shipping.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-green-500" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="w-10 h-10 text-green-500" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Secure Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Lock className="w-10 h-10 text-green-500" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Encrypted Payment</span>
              </div>
            </div>

          </div>
        </div>

        {/* You May Like */}
        <div className="mt-32 pt-20 border-t border-white/5">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products
                .filter(p => p.id !== product.id && p.category.some(c => product.category.includes(c)))
                .slice(0, 4)
                .map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                addToCart={addToCart} 
                toggleWishlist={toggleWishlist} 
                isWishlisted={wishlist.includes(p.id)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowSizeGuide(false)}></div>
            <div className="relative bg-zinc-900 border border-white/10 p-2 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={() => setShowSizeGuide(false)}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
                <img 
                    src="/assets/size-chart.avif" 
                    alt="Size Guide" 
                    className="w-full h-auto"
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Size+Guide+Image+Not+Found';
                    }}
                />
            </div>
        </div>
      )}

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowNotifyModal(false)}></div>
          <div className="relative bg-zinc-900 border border-white/10 p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Waitlist: {product.name}</h2>
            <p className="text-zinc-400 text-sm mb-8">We'll notify you as soon as size <span className="text-white font-bold">{selectedSize}</span> drops back in stock.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Email Address</label>
                <input type="email" placeholder="you@example.com" className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors" />
              </div>
              <button 
                onClick={() => setShowNotifyModal(false)}
                className="w-full bg-green-500 text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-white transition-all mt-4"
              >
                Join the Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

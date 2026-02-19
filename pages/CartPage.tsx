import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, MapPin, Ticket, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, Plus, LogIn, Lock, Gift, Check, AlertCircle } from 'lucide-react';
import { Product, User, Coupon, FreeGift, Address } from '../types';
import { fetchCoupons, fetchFreeGifts, updateUser, createRazorpayOrder, verifyRazorpayPayment } from '../src/api';

interface CartPageProps {
  cart: { productId: string; quantity: number; size: string; isGift?: boolean }[];
  addToCart: (productId: string, size: string, quantity: number, isGift?: boolean) => void;
  updateCartItem: (productId: string, size: string, quantity: number, isGift?: boolean) => void;
  updateCartItemSize: (productId: string, oldSize: string, newSize: string, isGift?: boolean) => void;
  removeFromCart: (productId: string, size: string, isGift?: boolean) => void;
  clearCart?: () => void;
  user: User | null;
  setUser?: (user: User | null) => void;
  products: Product[];
}

const CustomDropdown = ({ 
  value, 
  options, 
  onChange, 
  label, 
  availableStock 
}: { 
  value: string | number; 
  options: { label: string; value: string | number; disabled?: boolean }[]; 
  onChange: (val: any) => void; 
  label: string;
  availableStock?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-white hover:border-green-500/50 hover:bg-zinc-800 transition-all min-w-[100px] shadow-lg group"
      >
        <span className="group-hover:text-green-500 transition-colors">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 text-zinc-500 group-hover:text-green-500 transition-all ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-40 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl bg-zinc-900/90">
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Select {label}</span>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => {
              const isQty = typeof opt.value === 'number';
              const isAvailable = isQty ? (availableStock !== undefined && (opt.value as number) <= availableStock) : !opt.disabled;
              
              return (
                <button
                  key={opt.value}
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all relative flex items-center justify-between
                    ${opt.value === value ? 'bg-white/5 text-green-500' : 'hover:bg-white/5 text-white/80 hover:text-white'}
                    ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isQty && !isAvailable && (
                      <span className="text-[7px] text-red-500 font-black whitespace-nowrap opacity-80">OUT OF STOCK</span>
                    )}
                    <span className={`${isQty ? (isAvailable ? 'text-green-500' : 'text-white/40') : ''}`}>
                      {opt.label}
                    </span>
                  </div>
                  {opt.value === value && <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CartPage: React.FC<CartPageProps> = ({ cart, addToCart, updateCartItem, updateCartItemSize, removeFromCart, clearCart, user, setUser, products }) => {
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [freeGifts, setFreeGifts] = useState<FreeGift[]>([]);
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Load coupons and GIFTS
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("CartPage: Loading coupons and gifts...");
        const couponsData = await fetchCoupons();
        console.log("CartPage: Coupons loaded:", couponsData);
        setCoupons(couponsData || []); 
        
        const giftsData = await fetchFreeGifts();
        console.log("CartPage: Gifts loaded:", giftsData);
        setFreeGifts((giftsData || []).filter((g: FreeGift) => g.isActive));
      } catch (error) {
        console.error("CartPage: Failed to load offers", error);
      }
    };
    loadData();
  }, []);

  // Initialize selected address
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr);
    } else {
      setSelectedAddress(null);
    }
  }, [user]);

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => (p.id || (p as any)._id) === item.productId)!
  })).filter(item => item.product);

  // Calculate regular subtotal (excluding gifts)
  const regularSubtotal = cartItems
    .filter(item => !item.isGift)
    .reduce((acc, item) => acc + (item.product.offerPrice * item.quantity), 0);
  
  const sortedGifts = [...freeGifts].sort((a, b) => a.minBilling - b.minBilling);
  
  // Find potential gift based on regular subtotal
  // Note: We use regularSubtotal (user's spend) to determine eligibility
  let unlockedGift = [...sortedGifts].reverse().find(g => regularSubtotal >= g.minBilling);
  const lockedGift = sortedGifts.find(g => regularSubtotal < g.minBilling);
  const displayGift = unlockedGift || lockedGift;

  // Identify Gift Item in Cart (by isGift flag)
  const giftItemInCart = cartItems.find(item => item.isGift);
  
  // Calculate gift total
  let giftTotal = 0;
  cartItems.forEach(item => {
    if (item.isGift) {
        // Find the FreeGift definition that matches this product SKU
        const giftDef = freeGifts.find(g => g.sku === item.product.sku);
        giftTotal += (giftDef?.price || 0) * item.quantity;
    }
  });

  const subtotal = regularSubtotal + giftTotal;

  // Banner logic
  const giftInCart = !!giftItemInCart;
  const isGiftUnlocked = !!unlockedGift;
  const showGiftBanner = displayGift && (!giftInCart || (giftInCart && !isGiftUnlocked));

  const invalidGiftItems = cartItems.filter(item => {
    if (!item.isGift) return false;
    const giftDef = freeGifts.find(g => g.sku === item.product.sku);
    return giftDef && regularSubtotal < giftDef.minBilling;
  });
  
  const hasInvalidItems = invalidGiftItems.length > 0;
  const isCouponValid = !appliedCoupon || subtotal >= appliedCoupon.minBilling;

  let discountAmount = 0;
  if (appliedCoupon && isCouponValid) {
    if (appliedCoupon.type === 'flat') {
      discountAmount = appliedCoupon.value;
    } else {
      discountAmount = (regularSubtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  // Filter addresses to handle potential undefined/null
  const userAddresses = user?.addresses || [];
  const sortedAddresses = [...userAddresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));


  const handleSaveAddress = async () => {
    if (!user || !setUser) return;
    if (!newAddress.receiverName || !newAddress.pincode || !newAddress.apartment || !newAddress.roadName || !newAddress.city || !newAddress.state) {
      alert("Please fill all fields");
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      receiverName: newAddress.receiverName || '',
      apartment: newAddress.apartment || '',
      roadName: newAddress.roadName || '',
      city: newAddress.city || '',
      state: newAddress.state || '',
      pincode: newAddress.pincode || '',
      phone: user.phone || '',
      isDefault: user.addresses.length === 0
    };

    const updatedAddresses = [...user.addresses, address];
    
    // If this is the only address, it should be default
    if (updatedAddresses.length === 1) {
        updatedAddresses[0].isDefault = true;
    }

    try {
      // Sync with backend if available
      const updatedUser = await updateUser(user.id, { addresses: updatedAddresses });
      setUser(updatedUser);
      setSelectedAddress(address);
      setIsAddingAddress(false);
      setNewAddress({});
    } catch (error) {
      console.error("Failed to save address", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!user || !selectedAddress) return;
    setIsCheckingOut(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id || (item.product as any)._id,
        quantity: item.quantity,
        size: item.size,
        isGift: !!item.isGift,
        sku: item.product.sku
      }));

      const createResp = await createRazorpayOrder({
        userId: user.id,
        items: itemsPayload,
        addressId: selectedAddress.id || (selectedAddress as any)._id,
        couponCode: appliedCoupon?.code
      });

      if (!createResp || !createResp.orderId) {
        alert("Unable to initiate payment. Please try again.");
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert("Razorpay SDK failed to load. Check your network.");
        return;
      }

      const options = {
        key: createResp.keyId,
        amount: createResp.amount,
        currency: createResp.currency,
        name: 'Soul Stich',
        description: 'Secure Checkout',
        order_id: createResp.orderId,
        prefill: {
          name: user.name || 'Customer',
          email: user.email || '',
          contact: user.phone || ''
        },
        notes: { userId: user.id },
        theme: { color: '#22c55e' },
        handler: async (response: any) => {
          try {
            const verified = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              items: itemsPayload,
              addressId: selectedAddress.id || (selectedAddress as any)._id,
              couponCode: appliedCoupon?.code
            });
            if (clearCart) clearCart();
            const oid = verified.id || (verified as any)._id;
            navigate(`/order/${oid}`);
          } catch (e) {
            alert("Payment verification failed. If amount was deducted, contact support.");
          } finally {
            setIsCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => setIsCheckingOut(false)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Checkout failed. Please try again.");
      setIsCheckingOut(false);
    }
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    setAppliedCoupon(null);
    
    const code = codeToApply || couponInput;
    
    if (!code.trim()) {
      setCouponError("Please enter a code");
      return;
    }

    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    
    if (found) {
      // Check expiry
      if (found.expiry && new Date(found.expiry) < new Date()) {
        setCouponError("Coupon Expired");
        return;
      }
      
      // Check min billing
      if (subtotal < found.minBilling) {
        setCouponError(`Min order of ₹${found.minBilling} required`);
        return;
      }

      setAppliedCoupon(found);
      setCouponSuccess("Yay! Coupon applied successfully 🎉");
      setCouponInput(found.code);
    } else {
      setCouponError("Invalid Coupon Code or Coupon Expired");
    }
  };

  const handleClaimGift = (giftToClaim: FreeGift) => {
    if (giftToClaim) {
      // Check if product exists in products list
      const giftProduct = products.find(p => p.sku === giftToClaim.sku);
      if (giftProduct) {
        // Default to first available size if exists
        const firstSize = Object.keys(giftProduct.sizes)[0] || 'OneSize';
        addToCart(giftProduct.id || (giftProduct as any)._id, firstSize, 1, true); 
      } else {
        // console.error("GIFTS product not found in product list");
      }
    }
  };

  // Early return removed to show full layout


  return (
    <div className="bg-black min-h-screen text-white pt-10 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-12 flex items-center space-x-4">
          <span>Shopping Bag</span>
          <span className="text-sm text-zinc-500 font-bold bg-zinc-900 px-3 py-1 rounded-full">{cartItems.length}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Cart Items & Address */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Address Selection */}
            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Delivery Address</h3>
                </div>
              </div>

              {!user ? (
                <div className="text-center py-8 space-y-4">
                   <p className="text-zinc-400 text-sm">Login to manage your delivery addresses and checkout.</p>
                   <button 
                    onClick={() => navigate('/auth')}
                    className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-all mx-auto"
                   >
                     <LogIn className="w-4 h-4" />
                     <span>Login to Checkout</span>
                   </button>
                </div>
              ) : isAddingAddress ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-white font-bold text-sm uppercase tracking-wider">Add New Address</h4>
                     <button onClick={() => setIsAddingAddress(false)} className="text-zinc-500 text-xs hover:text-white transition-colors">Cancel</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input 
                        placeholder="Receiver Name" 
                        value={newAddress.receiverName || ''}
                        onChange={e => setNewAddress({...newAddress, receiverName: e.target.value})}
                        className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                     />
                     {/* Phone number is derived from user OTP verified login. Removed from address input. */}
                     <input 
                        placeholder="Apartment / Building" 
                        value={newAddress.apartment || ''}
                        onChange={e => setNewAddress({...newAddress, apartment: e.target.value})}
                        className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                     />
                     <input 
                        placeholder="Pincode" 
                        value={newAddress.pincode || ''}
                        onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                        className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                     />
                     <input 
                        placeholder="City" 
                        value={newAddress.city || ''}
                        onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                        className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                     />
                     <input 
                        placeholder="State" 
                        value={newAddress.state || ''}
                        onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                        className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                     />
                     <div className="md:col-span-2">
                       <input 
                          placeholder="Road Name / Area / Colony" 
                          value={newAddress.roadName || ''}
                          onChange={e => setNewAddress({...newAddress, roadName: e.target.value})}
                          className="w-full bg-black border border-white/10 p-3 rounded-lg text-sm text-white placeholder-zinc-600 focus:border-green-500 outline-none transition-colors"
                       />
                     </div>
                  </div>
                  <button 
                     onClick={handleSaveAddress}
                     className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-green-500 hover:text-white transition-colors mt-4 text-xs"
                  >
                     Save & Deliver Here
                  </button>
                </div>
              ) : (
                <>
                  {selectedAddress ? (
                    <div className="relative">
                       <div 
                         className="flex justify-between items-start cursor-pointer group"
                         onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                       >
                         <div className="text-sm text-zinc-400">
                           <p className="text-white font-bold">{selectedAddress.receiverName} <span className="ml-2 text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{selectedAddress.isDefault ? 'DEFAULT' : 'HOME'}</span></p>
                           <p>{selectedAddress.apartment}, {selectedAddress.roadName}</p>
                           <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                           <p className="mt-2 text-xs">Ph: {selectedAddress.phone || (user?.phone || '')}</p>
                         </div>
                         <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                       </div>

                       {/* Address Dropdown */}
                       {isAddressDropdownOpen && (
                         <div className="absolute top-full left-0 w-full bg-zinc-900 border border-white/10 rounded-xl mt-4 z-20 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                           {sortedAddresses.map(addr => (
                             <div 
                               key={addr.id}
                               onClick={() => {
                                 setSelectedAddress(addr);
                                 setIsAddressDropdownOpen(false);
                               }}
                               className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedAddress.id === addr.id ? 'bg-white/5' : ''}`}
                             >
                               <p className="font-bold text-white text-sm">{addr.receiverName}</p>
                               <p className="text-xs text-zinc-400">{addr.apartment}, {addr.roadName}, {addr.city}, {addr.state} - {addr.pincode}</p>
                             </div>
                           ))}
                           <button 
                            onClick={() => {
                                setIsAddingAddress(true);
                                setIsAddressDropdownOpen(false);
                            }}
                            className="w-full p-4 flex items-center justify-center space-x-2 text-green-500 hover:bg-white/5 transition-colors"
                           >
                             <Plus className="w-4 h-4" />
                             <span className="text-xs font-black uppercase tracking-widest">Add New Address</span>
                           </button>
                         </div>
                       )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full border-2 border-dashed border-white/10 py-6 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:border-white/20 hover:text-white transition-all"
                    >
                      + Add New Address
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Product List */}
            <div className="space-y-6">
              
              {/* GIFTS Carousel */}
              {freeGifts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Gift className="w-5 h-5 text-green-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest">GIFTS</h3>
                    </div>
                    {freeGifts.length > 1 && (
                        <div className="flex space-x-2">
                            <button onClick={() => scroll('left')} className="p-2 bg-zinc-900 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => scroll('right')} className="p-2 bg-zinc-900 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                  </div>

                  <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
                  >
                    {sortedGifts.map((gift) => {
                        const isUnlocked = regularSubtotal >= gift.minBilling;
                        const product = products.find(p => p.sku === gift.sku);
                        const isClaimed = cartItems.some(item => item.product.sku === gift.sku && item.isGift);

                        if (!product) return null;

                        return (
                            <div key={gift.id || gift._id} className={`snap-start min-w-[280px] border p-4 rounded-xl flex flex-col gap-3 ${isUnlocked ? 'bg-green-500/5 border-green-500/20' : 'bg-zinc-900 border-white/5'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-20 bg-zinc-800 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
                                        <img src={product.images[0]} alt={gift.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h4 className={`font-black uppercase tracking-wider text-xs truncate ${isUnlocked ? 'text-green-500' : 'text-zinc-500'}`}>
                                            {isUnlocked ? 'Unlocked' : 'Locked'}
                                        </h4>
                                        <Link to={`/product/${product.id}`} className="block text-white font-bold text-xs uppercase hover:text-green-500 transition-colors truncate mt-1">
                                            {product.name}
                                        </Link>
                                        <div className="flex items-center space-x-2 text-xs mt-1">
                                            <span className="text-zinc-500 line-through">₹{product.offerPrice}</span>
                                            <span className="text-green-500 font-black text-sm">₹{gift.price || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {gift.description && (
                                    <p className="text-[10px] text-zinc-400 font-medium italic border-t border-white/5 pt-2">
                                        "{gift.description}"
                                    </p>
                                )}

                                {!isUnlocked && (
                                    <p className="text-[10px] text-zinc-500">
                                        Add <span className="text-white font-bold">₹{gift.minBilling - regularSubtotal}</span> more
                                    </p>
                                )}

                                <button 
                                    onClick={() => handleClaimGift(gift)}
                                    disabled={!isUnlocked || isClaimed}
                                    className={`w-full py-2 text-[10px] font-black uppercase tracking-widest transition-colors rounded-lg flex items-center justify-center space-x-2 ${isClaimed ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : isUnlocked ? 'bg-green-500 text-black hover:bg-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                                >
                                    {isClaimed ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            <span>Claimed</span>
                                        </>
                                    ) : isUnlocked ? (
                                        <>
                                            <Gift className="w-3 h-3" />
                                            <span>Claim Gift</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-3 h-3" />
                                            <span>Locked</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                  </div>
                </div>
              )}

              {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => {
                    const isThisItemFree = item.isGift;
                    const giftDef = isThisItemFree ? freeGifts.find(g => g.sku === item.product.sku) : null;
                    
                    // Check validity
                    const isInvalidGift = isThisItemFree && giftDef && regularSubtotal < giftDef.minBilling;

                    return (
                      <div key={`${item.productId}-${item.size}-${isThisItemFree}`} className={`flex flex-col md:flex-row gap-6 p-6 transition-all group relative ${isInvalidGift ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900/30 border-white/5 hover:border-white/10'}`}>
                        {isThisItemFree && (
                            <div className={`absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 ${isInvalidGift ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                                {isInvalidGift ? 'Criteria Not Met' : 'Gift'}
                            </div>
                        )}
                        <div className="w-24 h-32 flex-shrink-0 overflow-hidden bg-zinc-800">
                          <img src={item.product.images[0]} alt={item.product.name} className={`w-full h-full object-cover ${isInvalidGift ? 'grayscale opacity-75' : ''}`} />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            {isInvalidGift && (
                                <div className="mb-2">
                                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Lock className="w-3 h-3" />
                                        <span>Add ₹{giftDef ? giftDef.minBilling - regularSubtotal : 0} more to unlock</span>
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between items-start">
                              <Link to={`/product/${item.productId}`} className="text-lg font-black uppercase tracking-tight group-hover:text-green-500 transition-colors">{item.product.name}</Link>
                              <button onClick={() => removeFromCart(item.productId, item.size, item.isGift)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-3">
                                {/* Size Selector */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Size:</span>
                                    <CustomDropdown 
                                      value={item.size}
                                      label="Size"
                                      onChange={(newSize) => updateCartItemSize(item.productId, item.size, newSize, item.isGift)}
                                      options={Object.keys(item.product.sizes).map(size => ({
                                        label: `${size} ${(item.product.sizes[size] || 0) === 0 ? '(Out of Stock)' : ''}`,
                                        value: size,
                                        disabled: (item.product.sizes[size] || 0) === 0
                                      }))}
                                    />
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Qty:</span>
                                    {isThisItemFree ? (
                                       <span className="text-[10px] text-white font-bold px-3 py-1.5 bg-zinc-800 rounded-lg border border-white/10 uppercase tracking-widest">{item.quantity}</span>
                                    ) : (
                                       <CustomDropdown 
                                          value={item.quantity}
                                          label="Qty"
                                          availableStock={item.product.sizes[item.size] || 0}
                                          onChange={(newQty) => updateCartItem(item.productId, item.size, parseInt(newQty), item.isGift)}
                                          options={[...Array(5)].map((_, i) => ({
                                            label: (i + 1).toString(),
                                            value: i + 1
                                          }))}
                                       />
                                    )}
                                </div>
                            </div>

                          </div>
                          <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            {isThisItemFree ? (
                                <>
                                     <span className="text-xl font-black text-green-500">
                                        ₹{giftDef?.price || 0}
                                     </span>
                                     <span className="text-sm text-zinc-500 line-through">₹{item.product.offerPrice}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xl font-black text-white">₹{item.product.offerPrice}</span>
                                    <span className="text-sm text-zinc-500 line-through">₹{item.product.actualPrice}</span>
                                </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                        <ShoppingBag className="w-8 h-8 text-zinc-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Your Bag is Empty</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">The soul of your wardrobe is waiting</p>
                    </div>
                    <Link to="/" className="mt-4 px-8 py-3 bg-green-500 text-black font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors text-xs shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        Explore Drops
                    </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Coupon Section */}
            <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Ticket className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">Available Offers</h3>
              </div>
              
              {coupons.filter(c => c.isVisible).length > 0 ? (
                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                  {coupons.filter(c => c.isVisible).map(coupon => (
                    <div 
                      key={coupon.code}
                      className="ticket-border flex-shrink-0 px-8 py-5 flex flex-col items-center bg-black border-white/5 group"
                    >
                      <span className="text-xl font-black text-green-500 tracking-tighter group-hover:scale-110 transition-transform">{coupon.code}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No coupons available at the moment.</p>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter custom code" 
                    className="w-full bg-black border border-white/10 px-4 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-green-500 transition-colors rounded-xl" 
                  />
                  <button 
                    onClick={() => handleApplyCoupon()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xs font-black uppercase tracking-widest hover:text-white"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-2 animate-pulse">{couponError}</p>}
                {!isCouponValid && appliedCoupon && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest pl-2 animate-pulse">
                        Min spend of ₹{appliedCoupon.minBilling} required
                    </p>
                )}
                {couponSuccess && isCouponValid && <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest pl-2">{couponSuccess}</p>}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-zinc-900 p-8 rounded-3xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest border-b border-white/5 pb-4">Order Summary</h3>
              <div className="space-y-4 text-sm tracking-wide">
                <div className="flex justify-between text-zinc-400">
                  <span>Bag Total</span>
                  <span>₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Coupon Discount</span>
                    <span className="text-green-500">-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                {giftTotal > 0 && (
                   <div className="flex justify-between text-zinc-400">
                     <span>Gift Price Included</span>
                     <span className="text-green-500">₹{giftTotal}</span>
                   </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Fee</span>
                  <div className="flex items-center space-x-2">
                    <span className="line-through">₹49</span>
                    <span className="text-green-500 font-bold">0</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-lg font-black uppercase tracking-tighter">Total Amount</span>
                  <span className="text-2xl font-black text-green-500">₹{Math.round(total)}</span>
                </div>
              </div>
              
              <button 
                disabled={cartItems.length === 0 || !user || isCheckingOut || hasInvalidItems || !isCouponValid}
                onClick={handleCheckout}
                className={`w-full py-5 text-sm font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-4 shadow-[0_10px_30px_rgba(255,255,255,0.05)] ${cartItems.length === 0 || !user || isCheckingOut || hasInvalidItems || !isCouponValid ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-green-500'}`}
              >
                <span>
                    {isCheckingOut ? 'Processing...' : 
                     cartItems.length === 0 ? 'Add Product' :
                     hasInvalidItems ? 'Review Cart Items' :
                     !isCouponValid ? 'Coupon Criteria Not Met' :
                     user ? 'Secure Checkout' : 'Login to Checkout'}
                </span>
                {!isCheckingOut && cartItems.length > 0 && <ChevronRight className="w-5 h-5" />}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted Transaction</span>
              </div>
            </div>

            <button className="w-full text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Need Help? Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

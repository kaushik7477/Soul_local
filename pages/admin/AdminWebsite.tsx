import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Link as LinkIcon, Save, Search, Check, AlertTriangle } from 'lucide-react';
import { 
  fetchHeroImages, createHeroImage, deleteHeroImage, 
  fetchTags, createTag, deleteTag,
  fetchCategories, updateCategory,
  fetchReviews, createReview, deleteReview,
  uploadImage, fetchProducts,
  fetchWebsiteConfig, updateWebsiteConfig
} from '../../src/api';
import { Product } from '../../types';

const AdminWebsite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'tags' | 'vibe' | 'fresh' | 'reviews' | 'coupons' | 'collections' | 'best_sellers'>('hero');
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Best Sellers Config
  const [bestSellersConfig, setBestSellersConfig] = useState<{productSkus: string[]}>({ productSkus: [] });
  const [bestSellersCount, setBestSellersCount] = useState(4);

  // Fresh Arrivals Config
  const [freshConfig, setFreshConfig] = useState<{tags: string[], productSkus: string[]}>({ tags: [], productSkus: [] });

  // Collections Config
  const [collectionsConfig, setCollectionsConfig] = useState<{tag: string, imageUrl: string}[]>([]);

  // Coupons Config
  const [couponConfig, setCouponConfig] = useState({
    coupon1Code: 'SOUL10',
    coupon1Text: 'Flat 10% OFF on all premium puff prints',
    coupon2Code: 'FIRST50',
    coupon2Text: 'Claim your first discount - ₹50 OFF'
  });

  // Forms
  const [newHeroSku, setNewHeroSku] = useState('');
  const [newHeroFile, setNewHeroFile] = useState<File | null>(null);
  const [newHeroPosition, setNewHeroPosition] = useState<number>(1);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  
  const [newTagName, setNewTagName] = useState('');

  const [newCollectionTag, setNewCollectionTag] = useState('');
  const [newCollectionFile, setNewCollectionFile] = useState<File | null>(null);

  const [vibeFiles, setVibeFiles] = useState<{[key: string]: File | null}>({});

  const [newReviewFile, setNewReviewFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 1. Fetch Products (Critical for Dropdown)
    try {
      const p = await fetchProducts();
      setProducts(p || []);
    } catch (e) {
      // console.error("Failed to load products", e);
      setProducts([]); 
    }

    // 2. Fetch Website Content
    try {
      const [h, t, c, r, fConfig, cConfig, colConfig, bsConfig] = await Promise.all([
        fetchHeroImages(),
        fetchTags(),
        fetchCategories(),
        fetchReviews(),
        fetchWebsiteConfig('fresh_arrivals'),
        fetchWebsiteConfig('coupons_section'),
        fetchWebsiteConfig('collections_section'),
        fetchWebsiteConfig('best_sellers')
      ]);
      setHeroImages(h);
      setTags(t);
      setCategories(c);
      setReviews(r);
      if (fConfig) setFreshConfig(fConfig);
      if (cConfig) setCouponConfig(cConfig);
      if (colConfig) setCollectionsConfig(colConfig);
      if (bsConfig) {
        setBestSellersConfig(bsConfig);
        setBestSellersCount(bsConfig.productSkus.length || 4);
      }
    } catch (e) {
      // console.error("Failed to load website configuration data", e);
    }
  };

  const handlePreUploadHero = () => {
    if (!newHeroFile || !newHeroSku) return;
    
    const existing = heroImages.find(h => h.position === newHeroPosition);
    if (existing) {
        setShowReplaceWarning(true);
    } else {
        handleUploadHero();
    }
  };

  const handleUploadHero = async () => {
    if (!newHeroFile || !newHeroSku) return;
    try {
      const url = await uploadImage(newHeroFile);
      await createHeroImage({ imageUrl: url, sku: newHeroSku, position: newHeroPosition });
      setNewHeroFile(null);
      setNewHeroSku('');
      setShowReplaceWarning(false);
      await loadData();
      alert("Hero image uploaded successfully!");
    } catch (e) {
      // console.error(e);
      alert("Failed to upload hero image.");
    }
  };

  const handleDeleteHero = async (id: string) => {
    await deleteHeroImage(id);
    loadData();
  };

  const handleAddTag = async () => {
    if (!newTagName) return;
    await createTag({ name: newTagName });
    setNewTagName('');
    loadData();
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm("Are you sure? This will remove the tag from filter lists but won't affect existing products.")) {
      await deleteTag(id);
      loadData();
    }
  };

  const handleAddCollection = async () => {
    if (!newCollectionTag || !newCollectionFile) return;
    try {
      const url = await uploadImage(newCollectionFile);
      const newCollection = { tag: newCollectionTag, imageUrl: url };
      const updatedCollections = [...collectionsConfig, newCollection];
      
      await updateWebsiteConfig('collections_section', updatedCollections);
      setCollectionsConfig(updatedCollections);
      setNewCollectionTag('');
      setNewCollectionFile(null);
      alert('Collection added successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to add collection.');
    }
  };

  const handleDeleteCollection = async (tagToRemove: string) => {
    if (window.confirm("Are you sure you want to remove this collection?")) {
      const updatedCollections = collectionsConfig.filter(c => c.tag !== tagToRemove);
      await updateWebsiteConfig('collections_section', updatedCollections);
      setCollectionsConfig(updatedCollections);
    }
  };

  const handleUpdateCategory = async (name: string) => {
    const file = vibeFiles[name];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      await updateCategory({ name, imageUrl: url });
      setVibeFiles(prev => ({ ...prev, [name]: null }));
      loadData();
    } catch (e) {
      // console.error(e);
    }
  };

  const handleUploadReview = async () => {
    if (!newReviewFile) return;
    try {
      const url = await uploadImage(newReviewFile);
      await createReview({ imageUrl: url });
      setNewReviewFile(null);
      loadData();
    } catch (e) {
      // console.error(e);
    }
  };

  const handleDeleteReview = async (id: string) => {
    await deleteReview(id);
    loadData();
  };

  const handleUpdateFreshConfig = async () => {
    await updateWebsiteConfig('fresh_arrivals', freshConfig);
    alert('Fresh Arrivals configuration saved!');
  };

  const handleSaveCoupons = async () => {
    await updateWebsiteConfig('coupons_section', couponConfig);
    alert('Coupons configuration saved!');
  };

  const handleSaveBestSellers = async () => {
    // Ensure array size matches count
    const skus = bestSellersConfig.productSkus.slice(0, bestSellersCount);
    // Fill remaining with empty strings if needed (though UI handles this)
    while (skus.length < bestSellersCount) {
        skus.push('');
    }
    const finalConfig = { productSkus: skus };
    setBestSellersConfig(finalConfig);
    await updateWebsiteConfig('best_sellers', finalConfig);
    alert('Best Sellers configuration saved!');
  };

  const updateBestSellerSlot = (index: number, sku: string) => {
    const newSkus = [...bestSellersConfig.productSkus];
    // Ensure array is long enough
    while (newSkus.length <= index) newSkus.push('');
    newSkus[index] = sku;
    setBestSellersConfig({ ...bestSellersConfig, productSkus: newSkus });
  };

  const toggleFreshTag = (tagName: string) => {
    setFreshConfig(prev => {
      const newTags = prev.tags.includes(tagName) 
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName];
      return { ...prev, tags: newTags };
    });
  };

  const toggleFreshProduct = (sku: string) => {
    setFreshConfig(prev => {
      if (prev.productSkus.includes(sku)) {
        return { ...prev, productSkus: prev.productSkus.filter(s => s !== sku) };
      }
      if (prev.productSkus.length >= 12) {
        alert("You can only select up to 12 products.");
        return prev;
      }
      return { ...prev, productSkus: [...prev.productSkus, sku] };
    });
  };

  const isSkuValid = products.some(p => p.sku === newHeroSku);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex space-x-4 border-b border-white/5 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('hero')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'hero' ? 'text-green-500' : 'text-zinc-500'}`}>Auto Scroll (Hero)</button>
        <button onClick={() => setActiveTab('fresh')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'fresh' ? 'text-green-500' : 'text-zinc-500'}`}>Fresh Arrivals</button>
        <button onClick={() => setActiveTab('best_sellers')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'best_sellers' ? 'text-green-500' : 'text-zinc-500'}`}>Best Sellers</button>
        <button onClick={() => setActiveTab('tags')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'tags' ? 'text-green-500' : 'text-zinc-500'}`}>Tags</button>
        <button onClick={() => setActiveTab('vibe')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'vibe' ? 'text-green-500' : 'text-zinc-500'}`}>Find Your Vibe</button>
        <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'reviews' ? 'text-green-500' : 'text-zinc-500'}`}>Reviews</button>
        <button onClick={() => setActiveTab('coupons')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'coupons' ? 'text-green-500' : 'text-zinc-500'}`}>Coupons</button>
        <button onClick={() => setActiveTab('collections')} className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest ${activeTab === 'collections' ? 'text-green-500' : 'text-zinc-500'}`}>Collection-Tag</button>
      </div>
      
      {activeTab === 'best_sellers' && (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold uppercase">Best Sellers Configuration</h3>
                <button onClick={handleSaveBestSellers} className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4"/> Save Config</button>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Number of Products to Show</label>
                    <input 
                        type="number" min="1" max="20"
                        value={bestSellersCount}
                        onChange={(e) => setBestSellersCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                        className="bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg text-sm text-white w-32 text-center font-bold"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: bestSellersCount }).map((_, index) => (
                        <div key={index} className="bg-zinc-900 border border-white/10 p-4 rounded-lg flex items-center gap-4">
                            <span className="text-2xl font-black text-zinc-700 w-8">{index + 1}</span>
                            <div className="flex-grow">
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Select Product</label>
                                <select 
                                    className="w-full bg-zinc-800 border border-white/5 px-3 py-2 rounded-lg text-xs text-white"
                                    value={bestSellersConfig.productSkus[index] || ''}
                                    onChange={(e) => updateBestSellerSlot(index, e.target.value)}
                                >
                                    <option value="">-- Select SKU --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.sku}>
                                            {p.sku} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold uppercase">Coupons Configuration</h3>
                <button onClick={handleSaveCoupons} className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4"/> Save Config</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coupon 1 */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
                    <h4 className="text-lg font-bold uppercase text-green-500">Coupon 1</h4>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Coupon Code</label>
                        <input 
                            type="text" 
                            value={couponConfig.coupon1Code}
                            onChange={(e) => setCouponConfig({...couponConfig, coupon1Code: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg text-sm font-bold focus:outline-none focus:border-green-500"
                            placeholder="e.g. SOUL10"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Description Text</label>
                        <input 
                            type="text" 
                            value={couponConfig.coupon1Text}
                            onChange={(e) => setCouponConfig({...couponConfig, coupon1Text: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-green-500"
                            placeholder="e.g. Flat 10% OFF..."
                        />
                    </div>
                </div>

                {/* Coupon 2 */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
                    <h4 className="text-lg font-bold uppercase text-green-500">Coupon 2</h4>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Coupon Code</label>
                        <input 
                            type="text" 
                            value={couponConfig.coupon2Code}
                            onChange={(e) => setCouponConfig({...couponConfig, coupon2Code: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg text-sm font-bold focus:outline-none focus:border-green-500"
                            placeholder="e.g. FIRST50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Description Text</label>
                        <input 
                            type="text" 
                            value={couponConfig.coupon2Text}
                            onChange={(e) => setCouponConfig({...couponConfig, coupon2Text: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-green-500"
                            placeholder="e.g. Claim your first..."
                        />
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="space-y-8">
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold uppercase">Add New Auto-Scroll Image</h3>
            <div className="flex gap-4 items-end flex-wrap">
              
              {/* Image Upload */}
              <div className="flex-grow min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Upload Image</label>
                <div className="relative">
                    <input 
                        type="file" 
                        onChange={e => setNewHeroFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-dashed transition-all ${newHeroFile ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-zinc-700 hover:border-white text-zinc-400'}`}>
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">{newHeroFile ? newHeroFile.name : 'Choose File'}</span>
                    </div>
                </div>
              </div>

              {/* Position Selector */}
              <div className="min-w-[100px]">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Position (1-9)</label>
                <select 
                    value={newHeroPosition} 
                    onChange={e => setNewHeroPosition(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-500"
                >
                    {[1,2,3,4,5,6,7,8,9].map(num => {
                        const isTaken = heroImages.some(h => Number(h.position) === num);
                        return (
                            <option key={num} value={num}>
                                {num} {isTaken ? '(Occupied)' : '(Empty)'}
                            </option>
                        );
                    })}
                </select>
              </div>

              {/* SKU Link */}
              <div className="flex-grow min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Link SKU</label>
                <select
                    value={newHeroSku}
                    onChange={e => setNewHeroSku(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-500"
                >
                    <option value="">Select Product</option>
                    {products.map(p => (
                        <option key={p.id} value={p.sku}>
                            {p.name} (SKU: {p.sku})
                        </option>
                    ))}
                </select>
              </div>

              <button 
                onClick={handlePreUploadHero} 
                disabled={!newHeroFile || !newHeroSku || !isSkuValid}
                className="bg-green-500 text-black px-6 py-2.5 rounded-lg font-bold uppercase text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>

            {/* Replacement Warning */}
            {showReplaceWarning && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-500 font-bold uppercase">Position {newHeroPosition} is already occupied. Replace it?</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowReplaceWarning(false)} className="px-4 py-2 text-xs font-bold uppercase hover:text-white">Cancel</button>
                        <button onClick={handleUploadHero} className="bg-yellow-500 text-black px-4 py-2 rounded text-xs font-bold uppercase hover:bg-yellow-400">Yes, Replace</button>
                    </div>
                </div>
            )}
          </div>

          {/* Existing Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6,7,8,9].map(pos => {
                const img = heroImages.find(h => Number(h.position) === pos);
                return (
                    <div key={pos} className={`relative group aspect-video rounded-lg overflow-hidden border ${img ? 'border-white/20 bg-zinc-900' : 'border-white/5 bg-black border-dashed flex items-center justify-center'}`}>
                        <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 z-10">
                            #{pos}
                        </div>
                        {img ? (
                            <>
                                <img src={img.imageUrl} className="w-full h-full object-cover" alt={`Hero ${pos}`} />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-zinc-400 uppercase">Linked SKU</p>
                                        <p className="text-sm font-black text-white uppercase">{img.sku}</p>
                                    </div>
                                    <button onClick={() => handleDeleteHero(img._id)} className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <span className="text-zinc-600 text-xs font-bold uppercase">Empty Slot</span>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      )}

      {activeTab === 'fresh' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold uppercase">Fresh Arrivals Configuration</h3>
             <button onClick={handleUpdateFreshConfig} className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4"/> Save Config</button>
           </div>
           
           <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-sm font-bold uppercase text-zinc-400">Select Filter Tags</h4>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                    <button 
                        key={tag._id} 
                        onClick={() => toggleFreshTag(tag.name)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase border ${freshConfig.tags.includes(tag.name) ? 'bg-green-500 text-black border-green-500' : 'bg-zinc-800 text-zinc-300 border-white/5'}`}
                    >
                        {tag.name} {freshConfig.tags.includes(tag.name) && <Check className="w-3 h-3 inline ml-1"/>}
                    </button>
                ))}
              </div>
           </div>

           <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-sm font-bold uppercase text-zinc-400">Select Products (Max 12)</h4>
              <p className="text-xs text-zinc-500">Selected: {freshConfig.productSkus.length} / 12</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 h-96 overflow-y-auto pr-2">
                {products.map(product => {
                    const isSelected = freshConfig.productSkus.includes(product.sku);
                    return (
                        <div 
                            key={product.id} 
                            onClick={() => toggleFreshProduct(product.sku)}
                            className={`cursor-pointer border rounded-lg p-2 relative ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-zinc-900'}`}
                        >
                            <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover rounded mb-2" />
                            <p className="text-[10px] font-bold uppercase truncate">{product.name}</p>
                            <p className="text-[10px] text-zinc-400">{product.sku}</p>
                            {isSelected && <div className="absolute top-2 right-2 bg-green-500 text-black p-1 rounded-full"><Check className="w-3 h-3"/></div>}
                        </div>
                    );
                })}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-8">
           <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold uppercase">Add New Collection Tag</h3>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Select Tag</label>
                <select 
                    value={newCollectionTag} 
                    onChange={e => setNewCollectionTag(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-500"
                >
                    <option value="">Choose a Tag</option>
                    {tags.map(tag => (
                        <option key={tag._id} value={tag.name} disabled={collectionsConfig.some(c => c.tag === tag.name)}>
                            {tag.name} {collectionsConfig.some(c => c.tag === tag.name) ? '(Already Added)' : ''}
                        </option>
                    ))}
                </select>
              </div>

              <div className="flex-grow min-w-[200px]">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Collection Image</label>
                <input type="file" onChange={e => setNewCollectionFile(e.target.files?.[0] || null)} className="text-xs text-zinc-400 w-full border border-white/10 p-2 rounded-lg" />
              </div>

              <button 
                onClick={handleAddCollection} 
                disabled={!newCollectionTag || !newCollectionFile}
                className="bg-green-500 text-black px-6 py-2.5 rounded-lg font-bold uppercase text-xs disabled:opacity-50"
              >
                Add Collection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collectionsConfig.map((col, i) => (
              <div key={i} className="relative group aspect-[4/5] bg-zinc-900 border border-white/5 rounded-lg overflow-hidden">
                <img src={col.imageUrl} className="w-full h-full object-cover" alt={col.tag} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                    <p className="text-center text-xs font-bold uppercase text-white">{col.tag}</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDeleteCollection(col.tag)} className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="space-y-8">
           <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold uppercase">Add New Filter Tag</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <input 
                  type="text" 
                  value={newTagName} 
                  onChange={e => setNewTagName(e.target.value)} 
                  className="w-full bg-zinc-900 border border-white/10 px-4 py-2 rounded-lg" 
                  placeholder="e.g. Oversized, Winter, Limited"
                />
              </div>
              <button onClick={handleAddTag} className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold uppercase text-xs">Add Tag</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag._id} className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-xs font-bold uppercase border border-white/5 flex items-center gap-2 group hover:border-red-500 hover:text-white transition-colors">
                {tag.name}
                <button onClick={() => handleDeleteTag(tag._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'vibe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['Men', 'Women', 'Unisex', 'Couple'].map(catName => {
            const current = categories.find(c => c.name === catName);
            return (
              <div key={catName} className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-xl font-bold uppercase">{catName} Image</h3>
                <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-white/5 relative">
                  <img 
                    src={current?.imageUrl || 'https://via.placeholder.com/400'} 
                    className="w-full h-full object-cover" 
                    alt={catName} 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="file" onChange={e => setVibeFiles({...vibeFiles, [catName]: e.target.files?.[0] || null})} className="text-xs text-zinc-400 w-full" />
                  <button onClick={() => handleUpdateCategory(catName)} className="bg-green-500 p-2 rounded-lg text-black hover:bg-white"><Save className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-8">
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold uppercase">Add New Review</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Upload Image</label>
                <input type="file" onChange={e => setNewReviewFile(e.target.files?.[0] || null)} className="text-xs text-zinc-400" />
              </div>
              <button onClick={handleUploadReview} className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold uppercase text-xs">Upload</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reviews.map(review => (
              <div key={review._id} className="relative group aspect-[3/4] bg-zinc-900 border border-white/5 rounded-lg overflow-hidden">
                <img src={review.imageUrl} className="w-full h-full object-cover" alt="Review" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDeleteReview(review._id)} className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebsite;

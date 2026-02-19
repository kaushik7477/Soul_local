
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">About SoulStich</h1>
            <div className="h-1 w-24 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-zinc-300 font-medium">
            <p>
              Welcome to <span className="text-white font-black italic">SoulStich</span>, where fashion meets self-expression. We believe that fashion is more than just clothing—it's a canvas to paint your individuality on, and a celebration of comfort.
            </p>
            
            <p>
              Founded in 2025, SoulStich is born from a shared passion to create stylish, comfortable and high-quality statement pieces that empower individuals to express their own unique identity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-black">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase italic">Curated Collection</h3>
                <p className="text-sm text-zinc-400">
                  We offer a curated collection of premium apparel, which we started with printed oversized t-shirts and aim to expand the collection soon, each design reflecting the statement that you determine to make.
                </p>
              </div>

              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase italic">Premium Quality</h3>
                <p className="text-sm text-zinc-400">
                  Every piece is crafted with careful precision, using high-quality fabrics to ensure durability and comfort to give a seamless experience in which your attire feels like your second skin.
                </p>
              </div>
            </div>

            <p>
              Our designs blend contemporary trends with timeless appeal, giving the aura of luxury for those who value both style and substance. We are a brand proudly <span className="text-white font-black italic underline decoration-green-500 underline-offset-4">MADE IN INDIA</span> who believe that fashion should be inclusive and accessible to all.
            </p>

            <p className="text-2xl md:text-3xl font-black text-white italic text-center py-12 border-y border-white/5">
              "Wear your soul on your sleeves."
            </p>

            <p className="text-center pt-8">
              Explore our ensemble today to find the perfect piece that resonates with soul.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;

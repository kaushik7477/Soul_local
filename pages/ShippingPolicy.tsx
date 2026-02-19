
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Mail, CreditCard } from 'lucide-react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Shipping Policy</h1>
            <div className="h-1 w-24 bg-green-500 rounded-full"></div>
          </div>

          <div className="space-y-12 text-zinc-300">
            <section className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-4 text-white">
                <MapPin className="text-green-500 w-6 h-6" />
                <h2 className="text-xl font-black uppercase italic">Pan India Shipping</h2>
              </div>
              <p className="text-lg leading-relaxed">
                We ship all over India and try to get the best rates for our customers. 
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase italic">Processing Time</h3>
                <p className="text-sm text-zinc-400 leading-relaxed uppercase tracking-widest font-bold">
                  Orders placed Monday through Saturday IST will be processed on the same or following business day and will be shipped within two business days of order placement.
                </p>
              </section>

              <section className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase italic">Delivery Timeline</h3>
                <p className="text-sm text-zinc-400 leading-relaxed uppercase tracking-widest font-bold">
                  Our product delivery timeline is <span className="text-white">4-9 days maximum</span> across India.
                </p>
              </section>
            </div>

            <section className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center gap-4 text-white">
                <CreditCard className="text-green-500 w-6 h-6" />
                <h2 className="text-xl font-black uppercase italic">Shipping Charges</h2>
              </div>
              <p className="text-sm leading-relaxed uppercase tracking-widest font-bold">
                Our shipping charges vary as per the order value and delivery location. Shipping charges for your order will be calculated and displayed at checkout.
              </p>
            </section>

            <section className="bg-zinc-900/80 p-8 rounded-3xl border border-green-500/20 text-center space-y-4">
              <h3 className="text-xl font-black uppercase italic">Have Questions?</h3>
              <p className="text-zinc-400">If you want to inquire about the delivery time of a product or have further questions, don't hesitate to contact us.</p>
              <div className="flex items-center justify-center gap-2 text-green-500 font-black tracking-widest uppercase">
                <Mail className="w-5 h-5" />
                <a href="mailto:soulstich.store@gmail.com" className="hover:underline">soulstich.store@gmail.com</a>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

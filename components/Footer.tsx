
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 font-heading">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter">SOUL STICH</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs uppercase tracking-tight font-medium">
              Pushing the boundaries of premium apparel through innovation and soul.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="mailto:soulstich.store@gmail.com" className="p-2 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"><Mail className="w-5 h-5" /></a>
              <a href="tel:+916289388029" className="p-2 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"><Phone className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300 mb-8 italic flex items-center gap-2">Contact Us <span className="text-[10px]"> </span></h4>
            <ul className="space-y-4 text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
              <li>
                <span className="text-zinc-300">Call:</span> 
                <a href="tel:+916289388029" className="hover:text-green-500 transition-colors ml-1">+91 - 6289388029</a>
              </li>
              <li>
                <span className="text-zinc-300">WhatsApp:</span> 
                <a href="https://wa.me/916289388029" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors ml-1">+91 - 6289388029</a>
              </li>
              <li>
                <span className="text-zinc-300">Support:</span> 
                <span className="ml-1 text-zinc-400">Mon-Sat, 11 AM to 6 PM</span>
              </li>
              <li>
                <span className="text-zinc-300">Email:</span> 
                <a href="mailto:soulstich.store@gmail.com" className="hover:text-green-500 transition-colors ml-1 lowercase">soulstich.store@gmail.com</a>
              </li>
              <li className="normal-case tracking-tight text-zinc-500 font-medium text-[11px]">
                <span className="text-zinc-300 uppercase tracking-widest font-bold block mb-1 text-xs">Address:</span>
                Fortune township, 49/2, jessore road, Kajipara, Barasat, kolkata - 700125, West Bengal, North 24 Parganas, 700125
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300 mb-8">Brand Soul</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
              <li><Link to="/about" className="hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link to="/profile" className="hover:text-green-500 transition-colors">My Profile</Link></li>
              <li><Link to="/cart" className="hover:text-green-500 transition-colors">Shopping Bag</Link></li>
              <li><Link to="/wishlist" className="hover:text-green-500 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300 mb-8">Legal Core</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
              <li><Link to="/privacy-policy" className="hover:text-green-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-green-500 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-green-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-green-500 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/contact-hub" className="hover:text-green-500 transition-colors">Contact Hub</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] space-y-4 md:space-y-0">
          <p>© 2025 SOUL STICH APPAREL CO. ALL RIGHTS RESERVED.</p>
          <p>ENGINEERED FOR EXCELLENCE.</p>
        </div>

        <div className="mt-4">
          <a
            href="https://mitelogix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-zinc-400 px-2 py-1 flex flex-row items-center justify-center gap-2 text-xs font-semibold tracking-wide"
          >
            <div className="flex items-center gap-2">
              <span className="uppercase text-[15px] text-white">Developed With</span>
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-50 animate-ping"></span>
                <Heart className="relative w-4 h-4 text-red-500" />
              </span>
              <span className="uppercase text-[15px] text-white">By</span>
            </div>
            <div className="flex items-center gap-3">
              {/* <span className="text-sm font-bold text-zinc-900">Mitelogix</span> */}
              <img
                src="public\assets\mytelogix.png"
                alt="Mitelogix"
                className="h-26 object-contain"
              />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

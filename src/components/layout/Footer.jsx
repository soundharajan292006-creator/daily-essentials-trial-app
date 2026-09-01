import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Smartphone, MessageCircle, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-bold text-2xl text-white tracking-tight block mb-4">TryIt<span className="text-primary">First</span></span>
            <p className="text-sm text-gray-400 mb-4">
              Discover sample-sized daily essentials, try what suits you, and buy full-size products with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Smartphone className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><MessageCircle className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Skincare" className="hover:text-primary">Skincare</Link></li>
              <li><Link to="/products?category=Personal Care" className="hover:text-primary">Personal Care</Link></li>
              <li><Link to="/products?category=Hair Care" className="hover:text-primary">Hair Care</Link></li>
              <li><Link to="/products?category=Food & Snacks" className="hover:text-primary">Food & Snacks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary">How it Works</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Subscribe</h3>
            <p className="text-sm text-gray-400 mb-4">Get the latest trial products directly in your inbox.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-3 py-2 text-gray-900 rounded-l-md focus:outline-none"
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-md transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} TryItFirst. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

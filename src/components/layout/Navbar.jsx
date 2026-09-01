import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { isUserAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-2xl text-primary tracking-tight">TryIt<span className="text-gray-800">First</span></span>
            </Link>
          </div>
          
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="Search for daily essentials..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="text-gray-600 hover:text-primary relative p-2">
              <Heart className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className="text-gray-600 hover:text-primary relative p-2">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isUserAuthenticated ? (
              <Link to="/dashboard" className="text-gray-600 hover:text-primary p-2">
                <User className="h-6 w-6" />
              </Link>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Sign Up</Link>
              </div>
            )}
            
            <div className="md:hidden flex items-center">
              <button className="text-gray-600 hover:text-primary p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

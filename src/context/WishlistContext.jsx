import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { isUserAuthenticated } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isUserAuthenticated) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);

      const res = await wishlistService.getWishlist();

      setWishlistItems(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isUserAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isUserAuthenticated) {
      alert('Please login to manage wishlist');
      return;
    }

    const productId = Number(
      product.product_id || product.id
    );

    if (!productId) {
      alert('Invalid product');
      return;
    }

    const exists = wishlistItems.some(
      item =>
        Number(item.product_id || item.id) === productId
    );

    try {
      if (exists) {
        await wishlistService.removeFromWishlist(productId);

        setWishlistItems(prev =>
          prev.filter(
            item =>
              Number(item.product_id || item.id) !== productId
          )
        );
      } else {
        await wishlistService.addToWishlist(productId);

        setWishlistItems(prev => [
          ...prev,
          {
            ...product,
            product_id: productId
          }
        ]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);

      alert(
        error.response?.data?.message ||
        'Error updating wishlist'
      );

      await fetchWishlist();
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(
      item =>
        Number(item.product_id || item.id) === Number(productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
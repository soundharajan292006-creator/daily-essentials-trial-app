import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isUserAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isUserAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);

      const res = await cartService.getCart();

      setCartItems(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isUserAuthenticated]);

  const addToCart = async (
    product,
    quantity = 1,
    isTrial = true
  ) => {
    if (!isUserAuthenticated) {
      alert('Please login to add to cart');
      return;
    }

    const productId = Number(
      product.product_id || product.id
    );

    if (!productId) {
      alert('Invalid product');
      console.error('Product ID missing:', product);
      return;
    }

    try {
      await cartService.addToCart({
        product_id: productId,
        item_type: isTrial ? 'trial' : 'full',
        quantity: Number(quantity)
      });

      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);

      alert(
        error.response?.data?.message ||
        'Error adding to cart'
      );
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.deleteCartItem(cartItemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (
    cartItemId,
    quantity
  ) => {
    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      await cartService.updateCartItem(
        cartItemId,
        newQuantity
      );

      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);

      alert(
        error.response?.data?.message ||
        'Error updating cart'
      );
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        Number(item.unit_price || 0) *
        Number(item.quantity || 0)
      );
    }, 0);
  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        cartCount,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    loading
  } = useCart();

  const { isUserAuthenticated } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const deliveryFee =
    subtotal > 0 && subtotal < 100 ? 20 : 0;

  const total = subtotal + deliveryFee;

  if (!isUserAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>

          <p className="text-gray-500 mb-8">
            You need to login to view and manage your cart.
          </p>

          <Link
            to="/login"
            className="block w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>

          <p className="text-gray-500 mb-8">
            Looks like you haven't added any trial products to your cart yet.
          </p>

          <Link
            to="/products"
            className="block w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Explore Trials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 hidden sm:grid grid-cols-12 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const price = Number(item.unit_price || 0);
                  const quantity = Number(item.quantity || 0);
                  const itemTotal = price * quantity;

                  return (
                    <li
                      key={item.cart_item_id}
                      className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-6 w-full flex items-center">
                        <Link
                          to={`/product/${item.product_id}`}
                          className="shrink-0 mr-4"
                        >
                          <img
                            src={
                              item.image_url ||
                              'https://via.placeholder.com/150'
                            }
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-xl bg-gray-50 border border-gray-100"
                          />
                        </Link>

                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            {item.item_type === 'trial' ? (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Trial Size
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Full Size
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/product/${item.product_id}`}
                            className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product_name}
                          </Link>

                          <p className="text-sm text-gray-500">
                            {item.brand}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 w-full sm:w-auto flex justify-between sm:block text-center mt-2 sm:mt-0">
                        <span className="sm:hidden text-sm text-gray-500">
                          Price:
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2 w-full sm:w-auto flex justify-between sm:justify-center items-center mt-2 sm:mt-0">
                        <span className="sm:hidden text-sm text-gray-500">
                          Quantity:
                        </span>

                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cart_item_id,
                                quantity - 1
                              )
                            }
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className="w-8 text-center text-sm font-semibold text-gray-900">
                            {quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cart_item_id,
                                quantity + 1
                              )
                            }
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 w-full flex items-center justify-between sm:justify-end mt-4 sm:mt-0">
                        <span className="sm:hidden text-sm font-bold text-gray-900">
                          Total: ₹{itemTotal.toFixed(2)}
                        </span>

                        <span className="hidden sm:inline font-bold text-gray-900">
                          ₹{itemTotal.toFixed(2)}
                        </span>

                        <button
                          onClick={() =>
                            removeFromCart(item.cart_item_id)
                          }
                          className="sm:ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({cartItems.length} items)
                  </span>

                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>

                  <span className="font-medium text-gray-900">
                    {deliveryFee === 0
                      ? 'Free'
                      : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-gray-900">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/products"
                  className="text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  CreditCard,
  Banknote,
  ShieldCheck
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const Checkout = () => {
  const {
    cartItems,
    getCartTotal,
    clearCart
  } = useCart();

  const {
    isUserAuthenticated,
    user
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');

  const items = Array.isArray(cartItems) ? cartItems : [];

  const subtotal = Number(getCartTotal() || 0);

  // Must match backend orderController.js
  const deliveryFee =
    subtotal > 0 && subtotal <= 500 ? 50 : 0;

  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate('/login', { replace: true });
    } else if (items.length === 0 && !orderComplete) {
      navigate('/cart', { replace: true });
    }
  }, [
    isUserAuthenticated,
    items.length,
    orderComplete,
    navigate
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setError('');
  };

  const handleSubmitAddress = (e) => {
    e.preventDefault();

    if (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.address.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.pincode.trim()
    ) {
      setStep(2);
      setError('');
    }
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    if (formData.paymentMethod !== 'cod') {
      setError(
        'Online payment is not connected yet. Please select Cash on Delivery for the demo.'
      );
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderData = {
        shipping_address:
          `${formData.address}, ${formData.city}, ` +
          `${formData.state} - ${formData.pincode}`,

        payment_method: 'cod',

        items: items.map(item => ({
          product_id: item.product_id || item.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price || 0),
          item_type: item.item_type || 'trial'
        }))
      };

      const res = await orderService.createOrder(orderData);

      const createdOrder = res?.data || {};

      setOrderId(
        createdOrder.order_id || createdOrder.id || null
      );

      setOrderComplete(true);

      await clearCart();

    } catch (err) {
      console.error('Error creating order:', err);

      setError(
        err.response?.data?.message ||
        'Failed to create order. Please try again.'
      );

    } finally {
      setIsProcessing(false);
    }
  };

  if (!isUserAuthenticated) {
    return null;
  }

  if (items.length === 0 && !orderComplete) {
    return null;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">

        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100">

          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Order Confirmed!
          </h2>

          <p className="text-gray-600 mb-4 text-lg">
            Thank you, {formData.name}. Your order has been
            saved successfully.
          </p>

          {orderId && (
            <p className="text-gray-700 font-semibold mb-4">
              Order ID: #{orderId}
            </p>
          )}

          <p className="text-sm text-gray-500 mb-8">
            Payment Status: Pending (Cash on Delivery).
            This is a demo project; actual delivery is not arranged.
          </p>

          <div className="flex flex-col gap-3">

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              View Order Status
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Back to Home
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center sm:text-left">
          Secure Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-2/3">

            {/* Checkout Steps */}
            <div className="flex items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">

              <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'
                }`}>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-200'
                  }`}>
                  1
                </div>

                <span className="font-semibold ml-2 hidden sm:inline">
                  Delivery
                </span>

              </div>

              <div className={`flex-1 h-1 mx-4 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-200'
                }`} />

              <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'
                }`}>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2
                  ? 'bg-primary text-white'
                  : 'bg-gray-200'
                  }`}>
                  2
                </div>

                <span className="font-semibold ml-2 hidden sm:inline">
                  Payment
                </span>

              </div>

            </div>

            {/* Address Form */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">

                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Contact & Delivery Information
                </h2>

                <form onSubmit={handleSubmitAddress}>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        placeholder="Full Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>

                      <input
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Address
                      </label>

                      <textarea
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                        placeholder="House/Flat No, Building, Street, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>

                      <input
                        type="text"
                        required
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>

                      <input
                        type="text"
                        required
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md"
                  >
                    Continue to Payment
                  </button>

                </form>

              </div>
            )}

            {/* Payment Methods */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">

                <div className="flex justify-between items-center mb-6">

                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-primary"
                  >
                    Edit Address
                  </button>

                </div>

                <div className="space-y-4 mb-8">

                  {/* UPI */}
                  <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === 'upi'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>

                    <div className="flex items-center">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                      />

                      <span className="ml-3 font-semibold text-gray-900">
                        UPI / QR (GPay, PhonePe, Paytm)
                      </span>

                    </div>

                    <p className="text-xs text-gray-500 ml-8 mt-2">
                      Coming soon — payment gateway not connected.
                    </p>

                  </label>

                  {/* Card */}
                  <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>

                    <div className="flex items-center">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                      />

                      <span className="ml-3 font-semibold text-gray-900 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                        Credit / Debit Card
                      </span>

                    </div>

                    <p className="text-xs text-gray-500 ml-8 mt-2">
                      Coming soon — payment gateway not connected.
                    </p>

                  </label>

                  {/* COD */}
                  <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === 'cod'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}>

                    <div className="flex items-center">

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300"
                      />

                      <span className="ml-3 font-semibold text-gray-900 flex items-center">
                        <Banknote className="h-5 w-5 mr-2 text-gray-500" />
                        Cash on Delivery
                      </span>

                    </div>

                    <p className="text-xs text-gray-500 ml-8 mt-2">
                      Demo order — no online payment collected.
                    </p>

                  </label>

                </div>

                <div className="bg-gray-50 p-4 rounded-xl flex items-start mb-6">

                  <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />

                  <p className="text-sm text-gray-600">
                    Online payments are not enabled yet.
                    Do not enter card or UPI credentials.
                    COD demo orders remain unpaid.
                  </p>

                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    isProcessing ||
                    formData.paymentMethod !== 'cod'
                  }
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing
                    ? 'Processing...'
                    : formData.paymentMethod === 'cod'
                      ? `Place COD Order — ${formatMoney(total)}`
                      : 'Online Payment Coming Soon'
                  }
                </button>

              </div>
            )}

          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">

              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">

                <ul className="divide-y divide-gray-100">

                  {items.map((item, index) => (
                    <li
                      key={item.cart_item_id || index}
                      className="py-3 flex justify-between"
                    >

                      <div className="flex-1 pr-4">

                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>

                      </div>

                      <span className="text-sm font-medium text-gray-900">
                        {formatMoney(
                          Number(item.unit_price || 0) *
                          Number(item.quantity || 0)
                        )}
                      </span>

                    </li>
                  ))}

                </ul>

              </div>

              <div className="space-y-3 text-sm mb-4 pt-4 border-t border-gray-100">

                <div className="flex justify-between text-gray-600">

                  <span>Subtotal</span>

                  <span className="font-medium text-gray-900">
                    {formatMoney(subtotal)}
                  </span>

                </div>

                <div className="flex justify-between text-gray-600">

                  <span>Delivery</span>

                  <span className="font-medium text-gray-900">
                    {deliveryFee === 0
                      ? 'Free'
                      : formatMoney(deliveryFee)
                    }
                  </span>

                </div>

              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">

                <span className="text-base font-bold text-gray-900">
                  Total Payable
                </span>

                <span className="text-2xl font-black text-primary">
                  {formatMoney(total)}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
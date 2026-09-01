import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Star,
  LogOut,
  Package
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { orderService } from '../services/orderService';

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  const [dashboardData, setDashboardData] = useState({
    trialRequests: 0,
    fullOrders: 0,
    reviews: 0
  });

  const [orders, setOrders] = useState([]);
  const [trials, setTrials] = useState([]);
  const [recentTrials, setRecentTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const ordersRes = await orderService.getMyOrders();

        const myOrders = ordersRes?.data || [];

        setOrders(myOrders);

        setTrials([]);
        setRecentTrials([]);

        setDashboardData({
          trialRequests: myOrders.length,
          fullOrders: myOrders.length,
          reviews: 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        setOrders([]);
        setTrials([]);
        setRecentTrials([]);

        setDashboardData({
          trialRequests: 0,
          fullOrders: 0,
          reviews: 0
        });

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:sticky md:top-24 h-fit">

      <div className="flex flex-col items-center p-4 border-b border-gray-100 mb-4">

        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl mb-3">
          {user?.full_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
        </div>

        <h3 className="font-bold text-gray-900">
          {user?.full_name || user?.name || 'User'}
        </h3>

        <p className="text-sm text-gray-500">
          {user?.email}
        </p>

      </div>

      <nav className="space-y-1">

        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'overview'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('trials')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'trials'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Package className="mr-3 h-5 w-5" />
          My Trial Requests
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <ShoppingBag className="mr-3 h-5 w-5" />
          Full Orders
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'wishlist'
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >

          <div className="flex items-center">
            <Heart className="mr-3 h-5 w-5" />
            Wishlist
          </div>

          {wishlistItems.length > 0 && (
            <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {wishlistItems.length}
            </span>
          )}

        </button>

        <div className="pt-4 mt-4 border-t border-gray-100">

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>

        </div>

      </nav>

    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row gap-8">

          <Sidebar />

          <div className="flex-1">

            {activeTab === 'overview' && (
              <div className="space-y-6">

                <h2 className="text-2xl font-bold text-gray-900">
                  Dashboard Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">

                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Trial Requests
                      </p>

                      <h4 className="text-2xl font-bold text-gray-900">
                        {dashboardData.trialRequests}
                      </h4>
                    </div>

                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">

                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                      <ShoppingBag className="h-6 w-6 text-green-500" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Full Orders
                      </p>

                      <h4 className="text-2xl font-bold text-gray-900">
                        {dashboardData.fullOrders}
                      </h4>
                    </div>

                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">

                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Wishlist
                      </p>

                      <h4 className="text-2xl font-bold text-gray-900">
                        {wishlistItems.length}
                      </h4>
                    </div>

                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">

                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
                      <Star className="h-6 w-6 text-amber-500" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Reviews
                      </p>

                      <h4 className="text-2xl font-bold text-gray-900">
                        {dashboardData.reviews}
                      </h4>
                    </div>

                  </div>

                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">

                    <h3 className="font-bold text-lg text-gray-900">
                      Recent Orders
                    </h3>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-sm text-primary font-medium hover:text-primary-dark"
                    >
                      View All
                    </button>

                  </div>

                  <div className="p-6">

                    {orders.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No recent orders.
                      </p>
                    ) : (

                      orders.slice(0, 3).map(order => (

                        <div
                          key={order.order_id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-xl mb-4 bg-gray-50/50"
                        >

                          <div>

                            <p className="font-bold text-gray-900">
                              Order #{order.order_id}
                            </p>

                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-gray-900">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </p>

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase">
                              {order.order_status || 'confirmed'}
                            </span>

                          </div>

                        </div>

                      ))

                    )}

                  </div>

                </div>

              </div>
            )}

            {activeTab === 'trials' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Trial Requests
                </h2>

                {trials.length === 0 ? (
                  <p className="text-gray-500">
                    No separate trial requests found.
                  </p>
                ) : (
                  <p className="text-gray-500">
                    Trial requests available.
                  </p>
                )}

              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Full Orders
                </h2>

                {orders.length === 0 ? (
                  <p className="text-gray-500">
                    You haven't made any orders yet.
                  </p>
                ) : (

                  <div className="space-y-4">

                    {orders.map(order => (

                      <div
                        key={order.order_id}
                        className="p-4 border border-gray-100 rounded-xl bg-gray-50/50"
                      >

                        <div className="flex justify-between items-center">

                          <div>

                            <p className="font-bold text-gray-900">
                              Order #{order.order_id}
                            </p>

                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-gray-900">
                              ${parseFloat(order.total_amount || 0).toFixed(2)}
                            </p>

                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase mt-1">
                              {order.order_status || 'confirmed'}
                            </span>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  My Wishlist
                </h2>

                {wishlistItems.length === 0 ? (

                  <div className="flex flex-col items-center justify-center text-center py-12">

                    <Heart className="h-12 w-12 text-gray-300 mb-4" />

                    <p className="text-gray-500">
                      Your wishlist is empty.
                    </p>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {wishlistItems.map((item, index) => (

                      <div
                        key={item.product_id || item.id || index}
                        className="flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50"
                      >

                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 mr-4 overflow-hidden">

                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}

                        </div>

                        <div className="flex-1">

                          <p className="font-bold text-gray-900 truncate">
                            {item.product_name || item.name}
                          </p>

                          <p className="text-sm font-medium text-primary">
                            ${item.price || item.full_price || 0}
                          </p>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
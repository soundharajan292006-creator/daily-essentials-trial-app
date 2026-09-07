import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Star,
  LogOut,
  TrendingUp,
  Tag,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const getArray = (response, key) => {
  if (Array.isArray(response)) return response;

  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.[key])) return data.data[key];

  return [];
};

const getId = (item, field) => item?.[field] ?? item?.id;

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatCount = (value) => {
  return Number(value || 0).toLocaleString('en-IN');
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN');
};

const EmptyRow = ({ colSpan, message = 'No records found.' }) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-10 text-center text-gray-500"
    >
      {message}
    </td>
  </tr>
);

const TableWrapper = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  </div>
);

const TableHead = ({ columns }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column) => (
        <th
          key={column}
          className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
        >
          {column}
        </th>
      ))}
    </tr>
  </thead>
);

const StatusBadge = ({ status }) => (
  <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
    {status || '—'}
  </span>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 ${color}`}
    >
      <Icon className="h-7 w-7" />
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h4 className="text-3xl font-black text-gray-900">
        {value}
      </h4>
    </div>
  </div>
);

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: Tag
  },
  {
    id: 'trials',
    label: 'Trial Requests',
    icon: ShoppingCart
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: TrendingUp
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star
  }
];

const Admin = () => {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalTrials: 0,
    totalReviews: 0
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trials, setTrials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'dashboard') {
        const res = await adminService.getDashboard();

        const data = res?.data ?? res ?? {};

        setStats({
          totalProducts: Number(
            data.total_products ??
            data.totalProducts ??
            0
          ),

          totalUsers: Number(
            data.total_users ??
            data.totalUsers ??
            0
          ),

          totalOrders: Number(
            data.total_orders ??
            data.totalOrders ??
            0
          ),

          totalRevenue: Number(
            data.total_revenue ??
            data.totalRevenue ??
            0
          ),

          totalTrials: Number(
            data.total_trial_requests ??
            data.totalTrials ??
            0
          ),

          totalReviews: Number(
            data.total_reviews ??
            data.totalReviews ??
            0
          )
        });
      }

      else if (activeTab === 'products') {
        const res = await productService.getProducts();

        setProducts(
          getArray(res, 'products')
        );
      }

      else if (activeTab === 'categories') {
        const res = await categoryService.getCategories();

        setCategories(
          getArray(res, 'categories')
        );
      }

      else if (activeTab === 'trials') {
        const res = await adminService.getTrials();

        setTrials(
          getArray(res, 'trials')
        );
      }

      else if (activeTab === 'orders') {
        const res = await adminService.getOrders();

        setOrders(
          getArray(res, 'orders')
        );
      }

      else if (activeTab === 'users') {
        const res = await adminService.getUsers();

        setUsers(
          getArray(res, 'users')
        );
      }

      else if (activeTab === 'reviews') {
        const res = await adminService.getReviews();

        setReviews(
          getArray(res, 'reviews')
        );
      }
    } catch (err) {
      console.error(
        `Error fetching ${activeTab} data:`,
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load data.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await adminService.updateOrderStatus(
        id,
        status
      );

      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to update order.'
      );
    }
  };

  const handleTrialStatus = async (id, status) => {
    try {
      await adminService.updateTrialStatus(
        id,
        status
      );

      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to update trial.'
      );
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    try {
      await adminService.deleteReview(id);

      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to delete review.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 min-h-screen p-4 flex flex-col">

        <div className="flex items-center p-4 border-b border-gray-800 mb-6">

          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-xl mr-3">
            A
          </div>

          <div>
            <h3 className="font-bold text-white leading-tight">
              Admin Portal
            </h3>

            <p className="text-xs text-gray-400 break-all">
              {admin?.email}
            </p>
          </div>

        </div>

        <nav className="flex-1 space-y-1">

          {navItems.map(
            ({ id, label, icon: Icon }) => (

              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Icon className="mr-3 h-5 w-5" />

                {label}
              </button>

            )
          )}

        </nav>

        <div className="pt-4 mt-4 border-t border-gray-800">

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />

            Logout
          </button>

        </div>

      </div>

      {/* Main */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />

          </div>
        )}

        {/* Dashboard */}
        {!loading && activeTab === 'dashboard' && (

          <div className="space-y-8">

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Admin Overview
              </h2>

              <p className="text-gray-500">
                Live data from PostgreSQL backend.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <StatCard
                title="Paid Revenue"
                value={formatMoney(stats.totalRevenue)}
                icon={TrendingUp}
                color="bg-indigo-50 text-indigo-500"
              />

              <StatCard
                title="Trial Requests"
                value={formatCount(stats.totalTrials)}
                icon={ShoppingCart}
                color="bg-blue-50 text-blue-500"
              />

              <StatCard
                title="Total Orders"
                value={formatCount(stats.totalOrders)}
                icon={Package}
                color="bg-green-50 text-green-500"
              />

              <StatCard
                title="Reviews"
                value={formatCount(stats.totalReviews)}
                icon={Star}
                color="bg-amber-50 text-amber-500"
              />

              <StatCard
                title="Total Products"
                value={formatCount(stats.totalProducts)}
                icon={Package}
                color="bg-purple-50 text-purple-500"
              />

              <StatCard
                title="Total Users"
                value={formatCount(stats.totalUsers)}
                icon={Users}
                color="bg-pink-50 text-pink-500"
              />

            </div>

            <p className="text-xs text-gray-400">
              Dashboard statistics are loaded from the live PostgreSQL database.
            </p>

          </div>

        )}

        {/* Products */}
        {!loading && activeTab === 'products' && (

          <div className="space-y-6">

            <div className="flex justify-between items-center">

              <h2 className="text-2xl font-bold text-gray-900">
                Products Management
              </h2>

              <button
                disabled
                className="bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center cursor-not-allowed"
              >
                <Plus className="h-5 w-5 mr-1" />

                Add Product
              </button>

            </div>

            <TableWrapper>

              <TableHead
                columns={[
                  'Product',
                  'Category',
                  'Price (Trial/Full)',
                  'Stock',
                  'Actions'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {products.map((product) => {

                  const id = getId(
                    product,
                    'product_id'
                  );

                  const name =
                    product.product_name ||
                    product.name ||
                    'Product';

                  const stock = Number(
                    product.stock ??
                    product.stock_quantity ??
                    0
                  );

                  return (

                    <tr
                      key={id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center">

                          {product.image_url ? (

                            <img
                              src={product.image_url}
                              className="w-10 h-10 rounded bg-gray-100 object-contain"
                              alt={name}
                            />

                          ) : (

                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">

                              <Package className="h-5 w-5 text-gray-400" />

                            </div>

                          )}

                          <div className="ml-4">

                            <div className="text-sm font-medium text-gray-900">
                              {name}
                            </div>

                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        {product.category_name ||
                          product.category_id ||
                          '—'}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">

                        {formatMoney(product.trial_price)}

                        {' / '}

                        {formatMoney(
                          product.price ??
                          product.full_price
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${stock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {stock} in stock
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm whitespace-nowrap">

                        <Link
                          to={`/product/${id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </Link>

                        <button
                          disabled
                          className="text-gray-300 mr-3 cursor-not-allowed"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>

                        <button
                          disabled
                          className="text-gray-300 cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>

                      </td>

                    </tr>

                  );
                })}

                {products.length === 0 && (
                  <EmptyRow
                    colSpan={5}
                    message="No products found."
                  />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

        {/* Categories */}
        {!loading && activeTab === 'categories' && (

          <div className="space-y-6">

            <div className="flex justify-between items-center">

              <h2 className="text-2xl font-bold text-gray-900">
                Categories Management
              </h2>

              <button
                disabled
                className="bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center cursor-not-allowed"
              >
                <Plus className="h-5 w-5 mr-1" />

                Add Category
              </button>

            </div>

            <TableWrapper>

              <TableHead
                columns={[
                  'ID',
                  'Name',
                  'Slug',
                  'Actions'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {categories.map((cat) => {

                  const id = getId(
                    cat,
                    'category_id'
                  );

                  return (

                    <tr key={id}>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {id}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">

                        {cat.category_name ||
                          cat.name}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {cat.slug || '—'}

                      </td>

                      <td className="px-6 py-4">

                        <button
                          disabled
                          className="text-gray-300 text-sm cursor-not-allowed"
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  );
                })}

                {categories.length === 0 && (
                  <EmptyRow colSpan={4} />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

        {/* Users */}
        {!loading && activeTab === 'users' && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Users Management
            </h2>

            <TableWrapper>

              <TableHead
                columns={[
                  'Name',
                  'Email',
                  'Phone',
                  'Role',
                  'Joined'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {users.map((user) => (

                  <tr key={user.id}>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.phone || '—'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 uppercase">
                      {user.role}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>

                  </tr>

                ))}

                {users.length === 0 && (
                  <EmptyRow colSpan={5} />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

        {/* Orders */}
        {!loading && activeTab === 'orders' && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Orders Management
            </h2>

            <TableWrapper>

              <TableHead
                columns={[
                  'Order ID',
                  'User',
                  'Total',
                  'Status',
                  'Date',
                  'Action'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {orders.map((order) => {

                  const id = getId(
                    order,
                    'order_id'
                  );

                  const status =
                    order.order_status ||
                    order.status ||
                    'confirmed';

                  return (

                    <tr key={id}>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {order.user_name ||
                          order.user_id ||
                          '—'}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">

                        {formatMoney(
                          order.total_amount
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <StatusBadge
                          status={status}
                        />

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {formatDate(
                          order.created_at
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <select
                          className="border border-gray-300 rounded text-sm px-2 py-1"
                          value={status}
                          onChange={(e) =>
                            handleOrderStatus(
                              id,
                              e.target.value
                            )
                          }
                        >
                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="packed">
                            Packed
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="out_for_delivery">
                            Out for Delivery
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>

                      </td>

                    </tr>

                  );
                })}

                {orders.length === 0 && (
                  <EmptyRow colSpan={6} />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

        {/* Trial Requests */}
        {!loading && activeTab === 'trials' && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Trial Requests Management
            </h2>

            <TableWrapper>

              <TableHead
                columns={[
                  'Request ID',
                  'Product',
                  'User',
                  'Status',
                  'Date',
                  'Action'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {trials.map((trial) => {

                  const id =
                    getId(
                      trial,
                      'trial_id'
                    ) ??
                    trial.request_id;

                  const status =
                    trial.request_status ||
                    trial.status ||
                    'pending';

                  return (

                    <tr key={id}>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {trial.product_name || '—'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {trial.user_name ||
                          trial.user_id ||
                          '—'}

                      </td>

                      <td className="px-6 py-4">

                        <StatusBadge
                          status={status}
                        />

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {formatDate(
                          trial.created_at
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <select
                          className="border border-gray-300 rounded text-sm px-2 py-1"
                          value={status}
                          onChange={(e) =>
                            handleTrialStatus(
                              id,
                              e.target.value
                            )
                          }
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="approved">
                            Approved
                          </option>

                          <option value="packed">
                            Packed
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="rejected">
                            Rejected
                          </option>

                        </select>

                      </td>

                    </tr>

                  );
                })}

                {trials.length === 0 && (
                  <EmptyRow colSpan={6} />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

        {/* Reviews */}
        {!loading && activeTab === 'reviews' && (

          <div className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Reviews Management
            </h2>

            <TableWrapper>

              <TableHead
                columns={[
                  'Product',
                  'User',
                  'Rating',
                  'Comment',
                  'Action'
                ]}
              />

              <tbody className="bg-white divide-y divide-gray-200">

                {reviews.map((review) => {

                  const id = getId(
                    review,
                    'review_id'
                  );

                  return (

                    <tr key={id}>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {review.product_name || '—'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">

                        {review.user_name ||
                          review.user_id ||
                          '—'}

                      </td>

                      <td className="px-6 py-4 text-sm text-yellow-500">

                        {'★'.repeat(
                          Math.min(
                            5,
                            Math.max(
                              0,
                              Number(
                                review.rating
                              ) || 0
                            )
                          )
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">

                        {review.comment || '—'}

                      </td>

                      <td className="px-6 py-4 text-sm">

                        <button
                          onClick={() =>
                            handleDeleteReview(id)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete review"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>

                      </td>

                    </tr>

                  );
                })}

                {reviews.length === 0 && (
                  <EmptyRow colSpan={5} />
                )}

              </tbody>

            </TableWrapper>

          </div>

        )}

      </div>

    </div>
  );
};

export default Admin;
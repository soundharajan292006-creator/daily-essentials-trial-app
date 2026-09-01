import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Star, 
  LogOut,
  TrendingUp,
  Tag,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const Admin = () => {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trials, setTrials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await adminService.getDashboard();
        setStats(res.data);
      } else if (activeTab === 'products') {
        const res = await productService.getProducts();
        setProducts(res.data);
      } else if (activeTab === 'categories') {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } else if (activeTab === 'trials') {
        const res = await adminService.getTrials();
        setTrials(res.data);
      } else if (activeTab === 'orders') {
        const res = await adminService.getOrders();
        setOrders(res.data);
      } else if (activeTab === 'users') {
        const res = await adminService.getUsers();
        setUsers(res.data);
      } else if (activeTab === 'reviews') {
        const res = await adminService.getReviews();
        setReviews(res.data);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <div className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 min-h-screen p-4 flex flex-col">
      <div className="flex items-center p-4 border-b border-gray-800 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-xl mr-3 shadow-lg shadow-primary/20">
          A
        </div>
        <div>
          <h3 className="font-bold text-white leading-tight">Admin Portal</h3>
          <p className="text-xs text-gray-400">{admin?.email}</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'products' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Package className="mr-3 h-5 w-5" /> Products
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Tag className="mr-3 h-5 w-5" /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('trials')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'trials' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <ShoppingCart className="mr-3 h-5 w-5" /> Trial Requests
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <TrendingUp className="mr-3 h-5 w-5" /> Orders
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Users className="mr-3 h-5 w-5" /> Users
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Star className="mr-3 h-5 w-5" /> Reviews
        </button>
      </nav>
      
      <div className="pt-4 mt-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto h-screen">
        
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
              <p className="text-gray-500">Live data from PostgreSQL backend.</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mr-5">
                  <TrendingUp className="h-7 w-7 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h4 className="text-3xl font-black text-gray-900">${parseFloat(stats?.totalRevenue || 0).toFixed(2)}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mr-5">
                  <ShoppingCart className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trial Requests</p>
                  <h4 className="text-3xl font-black text-gray-900">{stats?.totalTrials || 0}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mr-5">
                  <Package className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <h4 className="text-3xl font-black text-gray-900">{stats?.totalOrders || 0}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mr-5">
                  <Star className="h-7 w-7 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reviews</p>
                  <h4 className="text-3xl font-black text-gray-900">{stats?.totalReviews || 0}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mr-5">
                  <Package className="h-7 w-7 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <h4 className="text-3xl font-black text-gray-900">{stats?.totalProducts || 0}</h4>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mr-5">
                  <Users className="h-7 w-7 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h4 className="text-3xl font-black text-gray-900">{stats?.totalUsers || 0}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                <Plus className="h-5 w-5 mr-1" /> Add Product
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price (Trial/Full)</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                          <img src={product.image_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded bg-gray-100 object-cover" alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate w-48">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-gray-100 text-gray-800">
                            {product.category_name || product.category_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.trial_price} / ${product.full_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <Edit className="h-4 w-4 inline" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No products found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                <Plus className="h-5 w-5 mr-1" /> Add Category
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {categories.map(cat => (
                        <tr key={cat.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.id}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.slug}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {users.map(u => (
                        <tr key={u.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.full_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone || '-'}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{u.role}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {orders.map(o => (
                        <tr key={o.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id.substring(0,8)}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.user_name || o.user_id}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(o.total_amount).toFixed(2)}</td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">{o.status}</span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                             <select 
                               className="border border-gray-300 rounded text-sm px-2 py-1"
                               value={o.status}
                               onChange={(e) => {
                                 adminService.updateOrderStatus(o.id, e.target.value).then(fetchData);
                               }}
                             >
                               <option value="pending">Pending</option>
                               <option value="processing">Processing</option>
                               <option value="shipped">Shipped</option>
                               <option value="delivered">Delivered</option>
                               <option value="cancelled">Cancelled</option>
                             </select>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'trials' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Trial Requests Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {trials.map(t => (
                        <tr key={t.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{t.id.substring(0,8)}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.product_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.user_name || t.user_id}</td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">{t.status}</span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                             <select 
                               className="border border-gray-300 rounded text-sm px-2 py-1"
                               value={t.status}
                               onChange={(e) => {
                                 adminService.updateTrialStatus(t.id, e.target.value).then(fetchData);
                               }}
                             >
                               <option value="pending">Pending</option>
                               <option value="approved">Approved</option>
                               <option value="shipped">Shipped</option>
                               <option value="delivered">Delivered</option>
                               <option value="rejected">Rejected</option>
                             </select>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
        
        {!loading && activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {reviews.map(r => (
                        <tr key={r.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{r.product_name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.user_name || r.user_id}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{"★".repeat(r.rating)}</td>
                           <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{r.comment}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                             <button 
                               onClick={() => {
                                 if (window.confirm("Delete this review?")) {
                                   adminService.deleteReview(r.id).then(fetchData);
                                 }
                               }}
                               className="text-red-600 hover:text-red-900"
                             >
                               <Trash2 className="h-4 w-4 inline" />
                             </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;

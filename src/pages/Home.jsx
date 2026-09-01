import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/specific/ProductCard';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/products?category=${category.name}`} className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 group">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
      </div>
      <h3 className="font-semibold text-gray-900 text-center mb-1">{category.name}</h3>
      <p className="text-xs text-gray-500">{category.count || 0} Products</p>
    </Link>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories()
        ]);

        const fetchedProducts = prodRes || [];
        setProducts(fetchedProducts);

        // Count products per category
        const cats = catRes || [];
        const catCounts = cats.map(c => {
          const count = fetchedProducts.filter(p => p.category_id === c.id).length;
          return { ...c, count };
        });
        setCategories(catCounts);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredProducts = products.slice(0, 8);
  // Assume latest products based on created_at sorting from DB, taking top 4
  const newArrivals = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-4">
                  Welcome to TryItFirst
                </span>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6 leading-tight">
                  <span className="block">Try Before You</span>
                  <span className="block text-primary">Buy</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover sample-sized daily essentials, try what suits you, and buy full-size products with confidence. No more wasted money on products you don't love.
                </p>
                <div className="mt-8 sm:mt-12 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Link to="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-dark transition-colors md:py-4 md:text-lg md:px-10 shadow-lg shadow-primary/30">
                    Explore Trials <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/how-it-works" className="mt-3 w-full flex items-center justify-center px-8 py-3 border-2 border-gray-200 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors md:py-4 md:text-lg md:px-10 sm:mt-0">
                    How It Works
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1615397323136-231a4cc26e3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Various cosmetic and daily essential products"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:hidden"></div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Brands</h3>
              <p className="text-sm text-gray-500">Access to top-quality daily essentials.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Authentic</h3>
              <p className="text-sm text-gray-500">All products are sourced directly from brands.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-500">Get your trial packs delivered in 2-3 days.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <RefreshCcw className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Buy What You Love</h3>
              <p className="text-sm text-gray-500">Easily upgrade to full sizes if you like the trial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-2 text-gray-500">Find exactly what you're looking for</p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Trials</h2>
              <p className="mt-2 text-gray-500">Most requested trial products this week</p>
            </div>
            <Link to="/products" className="hidden sm:flex text-primary hover:text-primary-dark font-medium items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="mt-8 sm:hidden text-center">
            <Link to="/products" className="inline-flex text-primary hover:text-primary-dark font-medium items-center">
              View All Products <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
          <p className="mt-2 text-gray-500">Be the first to try our latest additions</p>
        </div>
        {loading ? (
          <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

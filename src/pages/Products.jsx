import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/specific/ProductCard';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const firstResponse = await productService.getProducts({
          page: 1
        });

        const firstProducts =
          firstResponse?.data?.products ||
          firstResponse?.products ||
          [];

        const totalPages =
          firstResponse?.data?.pages ||
          firstResponse?.pages ||
          1;

        let allProducts = [...firstProducts];

        if (totalPages > 1) {
          const requests = [];

          for (let page = 2; page <= totalPages; page++) {
            requests.push(
              productService.getProducts({
                page
              })
            );
          }

          const responses = await Promise.all(requests);

          responses.forEach((response) => {
            const pageProducts =
              response?.data?.products ||
              response?.products ||
              [];

            allProducts = [
              ...allProducts,
              ...pageProducts
            ];
          });
        }

        setProducts(allProducts);

        const catResponse =
          await categoryService.getCategories();

        const cats =
          Array.isArray(catResponse?.data)
            ? catResponse.data
            : Array.isArray(catResponse)
              ? catResponse
              : catResponse?.data?.categories ||
              catResponse?.categories ||
              [];

        const catCounts = cats.map((cat) => {
          const count = allProducts.filter(
            (product) =>
              Number(product.category_id) ===
              Number(cat.category_id)
          ).length;

          return {
            ...cat,
            count
          };
        });

        setCategories(catCounts);

      } catch (error) {
        console.error(
          'Error fetching products data:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const brands = useMemo(() => {
    const allBrands = products
      .map((product) => product.brand)
      .filter(Boolean);

    return [...new Set(allBrands)];
  }, [products]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();

      result = result.filter((product) =>
        (
          product.product_name &&
          product.product_name
            .toLowerCase()
            .includes(lowerQuery)
        ) ||
        (
          product.brand &&
          product.brand
            .toLowerCase()
            .includes(lowerQuery)
        ) ||
        (
          product.description &&
          product.description
            .toLowerCase()
            .includes(lowerQuery)
        )
      );
    }

    if (selectedCategory !== 'All') {
      const categoryObj = categories.find(
        (category) =>
          category.category_name === selectedCategory
      );

      if (categoryObj) {
        result = result.filter(
          (product) =>
            Number(product.category_id) ===
            Number(categoryObj.category_id)
        );
      }
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    result = result.filter((product) => {
      const trialPrice = Number(
        product.trial_price || 0
      );

      return (
        trialPrice >= priceRange[0] &&
        trialPrice <= priceRange[1]
      );
    });

    switch (sortBy) {
      case 'price-low':
        result.sort(
          (a, b) =>
            Number(a.trial_price || 0) -
            Number(b.trial_price || 0)
        );
        break;

      case 'price-high':
        result.sort(
          (a, b) =>
            Number(b.trial_price || 0) -
            Number(a.trial_price || 0)
        );
        break;

      case 'rating':
        result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );
        break;

      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );
        break;

      case 'popular':
      default:
        result.sort(
          (a, b) =>
            Number(b.review_count || 0) -
            Number(a.review_count || 0)
        );
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrands,
    priceRange,
    sortBy,
    categories
  ]);

  const FilterSidebar = ({ className = '' }) => (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-primary" />
          Filters
        </h3>

        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-primary transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Categories
        </label>

        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'All'}
              onChange={() =>
                setSelectedCategory('All')
              }
              className="text-primary focus:ring-primary h-4 w-4 rounded-full border-gray-300"
            />

            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
              All Categories
            </span>

            <span className="ml-auto text-xs text-gray-400">
              ({products.length})
            </span>
          </label>

          {categories.map((cat) => (
            <label
              key={cat.category_id}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={
                  selectedCategory ===
                  cat.category_name
                }
                onChange={() =>
                  setSelectedCategory(
                    cat.category_name
                  )
                }
                className="text-primary focus:ring-primary h-4 w-4 rounded-full border-gray-300"
              />

              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                {cat.category_name}
              </span>

              <span className="ml-auto text-xs text-gray-400">
                ({cat.count || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Trial Price Range
        </label>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            ₹{priceRange[0]}
          </span>

          <span className="text-sm text-gray-600">
            ₹{priceRange[1]}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([
              priceRange[0],
              parseInt(e.target.value)
            ])
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Brands
        </label>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(
                  brand
                )}
                onChange={() =>
                  toggleBrand(brand)
                }
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />

              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Explore Trial Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredProducts.length} results
              {selectedCategory !== 'All'
                ? ` for ${selectedCategory}`
                : ''}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center justify-between gap-4">

            <button
              className="md:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700"
              onClick={() =>
                setIsMobileFiltersOpen(true)
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <div className="flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-lg"
              >
                <option value="popular">
                  Most Popular
                </option>

                <option value="newest">
                  Newest Arrivals
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">

              <div
                className="fixed inset-0 bg-black/50"
                onClick={() =>
                  setIsMobileFiltersOpen(false)
                }
              />

              <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-xl">

                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    Filters
                  </h2>

                  <button
                    onClick={() =>
                      setIsMobileFiltersOpen(false)
                    }
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <FilterSidebar className="border-0 shadow-none p-0" />
                </div>

                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setIsMobileFiltersOpen(false)
                    }
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>

              </div>
            </div>
          )}

          <div className="flex-1">

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                  />
                ))}

              </div>

            ) : (

              <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100 h-full flex flex-col items-center justify-center">

                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Filter className="h-8 w-8" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No products found
                </h3>

                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  We couldn't find any products matching your current filters.
                </p>

                <button
                  onClick={clearFilters}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Products;
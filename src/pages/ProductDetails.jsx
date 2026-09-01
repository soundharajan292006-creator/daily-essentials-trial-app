import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Info,
  Sparkles
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    average_rating: 0,
    total_reviews: 0
  });

  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Product fetch
        const prodRes = await productService.getProductById(id);

        setProduct(prodRes?.data || null);

        // Review fetch should NOT stop product page
        try {
          const reviewsRes = await reviewService.getProductReviews(id);

          setProductReviews(
            reviewsRes?.data?.reviews || []
          );

          setReviewSummary({
            average_rating:
              reviewsRes?.data?.summary?.average_rating || 0,

            total_reviews:
              reviewsRes?.data?.summary?.total_reviews || 0
          });

        } catch (reviewError) {
          console.error('Review fetch error:', reviewError);

          setProductReviews([]);

          setReviewSummary({
            average_rating: 0,
            total_reviews: 0
          });
        }

      } catch (error) {
        console.error('Product fetch error:', error);
        setProduct(null);

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>

          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>

          <button
            onClick={() => navigate('/products')}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productId = product.product_id || product.id;

  const inWishlist = isInWishlist(productId);

  const productName =
    product.product_name || product.name || 'Product';

  const trialPrice = Number(product.trial_price || 0);

  const originalPrice = Number(
    product.mrp || product.price || 0
  );

  const rating = Number(
    reviewSummary.average_rating ||
    product.rating ||
    0
  );

  const totalReviews = Number(
    reviewSummary.total_reviews ||
    product.review_count ||
    0
  );

  const handleAddToCart = (isTrial) => {
    addToCart(product, quantity, isTrial);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleTryNow = () => {
    addToCart(product, quantity, true);
    navigate('/cart');
  };

  const getArray = (field) => {
    if (!field) return [];

    if (Array.isArray(field)) {
      return field;
    }

    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);

        return Array.isArray(parsed)
          ? parsed
          : [field];

      } catch {
        return field
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const benefits = getArray(product.benefits);
  const ingredients = getArray(product.ingredients);

  return (
    <div className="bg-gray-50 min-h-screen py-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-50">

            <ShoppingBag className="h-5 w-5 mr-3 text-primary" />

            <div>
              <p className="font-medium">
                Added to cart successfully!
              </p>

              <p className="text-sm text-gray-300">
                {quantity}x {productName}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">

          <div className="flex flex-col md:flex-row">

            {/* PRODUCT IMAGE */}

            <div className="md:w-1/2 p-8 lg:p-12 bg-gray-50/50 flex items-center justify-center relative">

              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={productName}
                  className="w-full max-w-md h-[420px] object-contain rounded-xl"
                />
              ) : (
                <div className="w-full max-w-md h-[420px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  Image coming soon
                </div>
              )}

              <div className="absolute top-6 left-6">
                <span className="bg-gray-900 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm uppercase">
                  {product.size || 'TRIAL SIZE'}
                </span>
              </div>

            </div>

            {/* PRODUCT INFORMATION */}

            <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">

              <div className="mb-2">
                <span className="text-sm font-bold tracking-wider text-primary uppercase">
                  {product.brand}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                {productName}
              </h1>

              {/* RATING */}

              <div className="flex items-center mb-6">

                <div className="flex items-center text-amber-400">

                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(rating)
                        ? 'fill-current'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}

                </div>

                <span className="text-gray-700 font-bold ml-2">
                  {rating.toFixed(1)}
                </span>

                <span className="text-gray-500 ml-2">
                  ({totalReviews} reviews)
                </span>

              </div>

              {/* PRICE */}

              <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">

                  <div>

                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Trial Price
                    </p>

                    <div className="flex items-end">

                      <span className="text-4xl font-black text-gray-900">
                        ₹{trialPrice.toFixed(2)}
                      </span>

                      {originalPrice > 0 && (
                        <span className="text-lg text-gray-400 line-through ml-3 mb-1">
                          ₹{originalPrice.toFixed(2)}
                        </span>
                      )}

                    </div>

                    {originalPrice > trialPrice && (
                      <p className="text-xs text-primary font-medium mt-1">
                        Save ₹
                        {(originalPrice - trialPrice).toFixed(2)} by trying first!
                      </p>
                    )}

                  </div>

                  {/* QUANTITY */}

                  <div>

                    <p className="text-sm text-gray-500 font-medium mb-2">
                      Quantity
                    </p>

                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">

                      <button
                        onClick={() =>
                          setQuantity(
                            Math.max(1, quantity - 1)
                          )
                        }
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-12 text-center font-semibold">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          setQuantity(quantity + 1)
                        }
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">

                <button
                  onClick={handleTryNow}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Try Now
                </button>

                <button
                  onClick={() =>
                    toggleWishlist({
                      ...product,
                      product_id: productId
                    })
                  }
                  className={`px-6 py-4 rounded-xl border-2 font-bold flex items-center justify-center ${inWishlist
                    ? 'border-red-100 bg-red-50 text-red-500'
                    : 'border-gray-200 bg-white text-gray-700'
                    }`}
                >
                  <Heart
                    className={`h-6 w-6 ${inWishlist ? 'fill-current' : ''
                      }`}
                  />
                </button>

              </div>

              {/* FEATURES */}

              <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-6">

                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  100% Authentic
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-primary mr-2" />
                  Trial Delivery
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <RefreshCcw className="h-5 w-5 text-primary mr-2" />
                  Easy upgrades
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Info className="h-5 w-5 text-primary mr-2" />

                  {Number(product.trial_stock || 0) > 0
                    ? 'In Stock'
                    : 'Out of Stock'}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* DETAILS */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="flex border-b border-gray-200 overflow-x-auto">

            {[
              'description',
              'ingredients',
              'how-to-use',
              'reviews'
            ].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-5 px-6 text-sm font-bold uppercase tracking-wider whitespace-nowrap ${activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.replace('-', ' ')}

                {tab === 'reviews' &&
                  ` (${totalReviews})`}
              </button>

            ))}

          </div>

          <div className="p-8 lg:p-12 min-h-[300px]">

            {/* DESCRIPTION */}

            {activeTab === 'description' && (

              <div className="text-gray-600">

                <p className="text-lg leading-relaxed mb-6">
                  {product.description ||
                    'Product description coming soon.'}
                </p>

                {benefits.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Benefits
                    </h3>

                    <ul className="space-y-2">

                      {benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-center"
                        >
                          <div className="h-2 w-2 bg-primary rounded-full mr-3"></div>
                          {benefit}
                        </li>
                      ))}

                    </ul>
                  </>
                )}

              </div>

            )}

            {/* INGREDIENTS */}

            {activeTab === 'ingredients' && (

              <div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Key Ingredients
                </h3>

                {ingredients.length > 0 ? (

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    {ingredients.map((ingredient, index) => (

                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center"
                      >
                        <Sparkles className="h-5 w-5 text-primary mr-3" />

                        <span className="font-medium text-gray-800">
                          {ingredient}
                        </span>
                      </div>

                    ))}

                  </div>

                ) : (

                  <p className="text-gray-500">
                    Ingredient information coming soon.
                  </p>

                )}

              </div>

            )}

            {/* HOW TO USE */}

            {activeTab === 'how-to-use' && (

              <div className="max-w-2xl">

                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Directions for Use
                </h3>

                <div className="flex bg-gray-50 p-6 rounded-2xl border border-gray-100">

                  <div className="flex-shrink-0 mr-6">

                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                      1
                    </div>

                  </div>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    {product.how_to_use ||
                      'Usage instructions coming soon.'}
                  </p>

                </div>

              </div>

            )}

            {/* REVIEWS */}

            {activeTab === 'reviews' && (

              <div>

                <div className="flex items-center justify-between mb-8">

                  <h3 className="text-2xl font-bold text-gray-900">
                    Customer Reviews
                  </h3>

                  <button className="text-primary font-medium">
                    Write a Review
                  </button>

                </div>

                {productReviews.length > 0 ? (

                  <div className="space-y-6">

                    {productReviews.map((review) => (

                      <div
                        key={review.id || review.review_id}
                        className="border-b border-gray-100 pb-6"
                      >

                        <div className="flex items-center justify-between mb-2">

                          <div>

                            <p className="font-bold text-gray-900">
                              {review.user_name || 'User'}
                            </p>

                            <p className="text-xs text-gray-500">
                              {review.created_at
                                ? new Date(
                                  review.created_at
                                ).toLocaleDateString()
                                : ''}
                            </p>

                          </div>

                          <div className="flex text-amber-400">

                            {[...Array(5)].map((_, i) => (

                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Number(review.rating || 0)
                                  ? 'fill-current'
                                  : 'text-gray-200'
                                  }`}
                              />

                            ))}

                          </div>

                        </div>

                        {review.title && (
                          <p className="font-semibold text-gray-800 mt-2">
                            {review.title}
                          </p>
                        )}

                        <p className="text-gray-600 mt-2">
                          {review.review_text ||
                            review.comment}
                        </p>

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="text-center py-12 bg-gray-50 rounded-xl">

                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />

                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      No reviews yet
                    </h4>

                    <p className="text-gray-500">
                      Be the first to review this trial product.
                    </p>

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

export default ProductDetails;
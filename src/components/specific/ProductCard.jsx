import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const productId = product.product_id || product.id;

  const inWishlist = isInWishlist(productId);

  const isNew = () => {
    if (!product.created_at) return false;

    const diffTime = Math.abs(
      new Date() - new Date(product.created_at)
    );

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays <= 14;
  };

  const trialPrice = Number(product.trial_price || 0);

  const originalPrice = Number(
    product.mrp || product.price || 0
  );

  const handleWishlist = () => {
    toggleWishlist({
      ...product,
      product_id: productId
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group">

      <div className="relative pt-[100%] overflow-hidden bg-gray-50">

        <Link
          to={`/product/${productId}`}
          className="absolute inset-0"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="absolute inset-0 w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Image coming soon
            </div>
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-2">

          {isNew() && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
              NEW
            </span>
          )}

          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100">
            {product.size || '10ml'} Trial
          </span>

        </div>

        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${inWishlist
            ? 'bg-red-50 text-red-500'
            : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
          title="Wishlist"
        >
          <Heart
            className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''
              }`}
          />
        </button>

      </div>

      <div className="p-4 flex flex-col flex-grow">

        <div className="text-xs text-gray-500 mb-1 font-medium">
          {product.brand}
        </div>

        <Link to={`/product/${productId}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.product_name}
          </h3>
        </Link>

        <div className="flex items-center mb-3 mt-auto pt-2">

          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 fill-current" />

            <span className="text-sm font-semibold ml-1 text-gray-700">
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </div>

          <span className="text-xs text-gray-400 ml-2">
            ({product.review_count || 0})
          </span>

        </div>

        <div className="flex items-end justify-between mt-1">

          <div>
            <div className="text-xs text-gray-500 mb-0.5">
              Trial Price
            </div>

            <div className="flex items-center">
              <span className="font-bold text-lg text-gray-900">
                ₹{trialPrice}
              </span>

              {originalPrice > 0 && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1, true)}
            className="bg-gray-900 hover:bg-primary text-white p-2 rounded-xl transition-colors shadow-sm flex items-center justify-center group-hover:scale-105 duration-200"
            title="Add Trial to Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>

        </div>

      </div>

    </div>
  );
};

export default ProductCard;
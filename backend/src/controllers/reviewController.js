const db = require('../config/db');

const makeError = (message, status = 400) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

const getPositiveId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw makeError('Invalid ID');
  }

  return id;
};

const validateRating = (value) => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw makeError('Please provide a valid rating between 1 and 5');
  }

  return rating;
};

const addReviewAliases = (review) => ({
  ...review,
  id: review.review_id,
  comment: review.review_text
});

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const productId = getPositiveId(req.params.productId);

    const result = await db.query(
      `SELECT
         r.review_id,
         r.user_id,
         r.product_id,
         r.rating,
         r.review_text,
         r.created_at,
         u.full_name AS user_name
       FROM reviews r
       LEFT JOIN users u
         ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC, r.review_id DESC`,
      [productId]
    );

    const avgResult = await db.query(
      `SELECT
         COALESCE(AVG(rating), 0) AS avg_rating,
         COUNT(*)::int AS total_reviews
       FROM reviews
       WHERE product_id = $1`,
      [productId]
    );

    const summary = avgResult.rows[0];

    res.json({
      success: true,
      data: {
        reviews: result.rows.map(addReviewAliases),
        summary: {
          average_rating: Number(summary.avg_rating).toFixed(1),
          total_reviews: summary.total_reviews
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const productId = getPositiveId(req.params.productId);
    const rating = validateRating(req.body.rating);

    const reviewText = req.body.review_text ?? req.body.comment ?? '';

    if (typeof reviewText !== 'string') {
      throw makeError('Review text must be a string');
    }

    const productResult = await db.query(
      'SELECT product_id FROM products WHERE product_id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw makeError('Product not found', 404);
    }

    const alreadyReviewed = await db.query(
      `SELECT review_id
       FROM reviews
       WHERE product_id = $1 AND user_id = $2`,
      [productId, req.user.id]
    );

    if (alreadyReviewed.rows.length > 0) {
      throw makeError('Product already reviewed');
    }

    const result = await db.query(
      `INSERT INTO reviews
         (user_id, product_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.user.id,
        productId,
        rating,
        reviewText.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: addReviewAliases(result.rows[0])
    });
  } catch (error) {
    if (error.code === '23505') {
      return next(makeError('Product already reviewed'));
    }

    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const reviewId = getPositiveId(req.params.id);

    const hasRating = req.body.rating !== undefined;
    const hasText =
      req.body.review_text !== undefined ||
      req.body.comment !== undefined;

    if (!hasRating && !hasText) {
      throw makeError('Please provide rating or review text to update');
    }

    let rating = null;
    let reviewText = null;

    if (hasRating) {
      rating = validateRating(req.body.rating);
    }

    if (hasText) {
      reviewText = req.body.review_text ?? req.body.comment;

      if (typeof reviewText !== 'string') {
        throw makeError('Review text must be a string');
      }

      reviewText = reviewText.trim();
    }

    const result = await db.query(
      `UPDATE reviews
       SET
         rating = COALESCE($1, rating),
         review_text = COALESCE($2, review_text)
       WHERE review_id = $3 AND user_id = $4
       RETURNING *`,
      [rating, reviewText, reviewId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw makeError('Review not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: addReviewAliases(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (User)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const reviewId = getPositiveId(req.params.id);

    const result = await db.query(
      `DELETE FROM reviews
       WHERE review_id = $1 AND user_id = $2
       RETURNING review_id`,
      [reviewId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw makeError('Review not found or unauthorized', 404);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         r.review_id,
         r.user_id,
         r.product_id,
         r.rating,
         r.review_text,
         r.created_at,
         u.full_name AS user_name,
         u.email AS user_email,
         p.product_name
       FROM reviews r
       LEFT JOIN users u
         ON u.id = r.user_id
       LEFT JOIN products p
         ON p.product_id = r.product_id
       ORDER BY r.created_at DESC, r.review_id DESC`
    );

    res.json({
      success: true,
      data: result.rows.map(addReviewAliases)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReviewAdmin = async (req, res, next) => {
  try {
    const reviewId = getPositiveId(req.params.id);

    const result = await db.query(
      `DELETE FROM reviews
       WHERE review_id = $1
       RETURNING review_id`,
      [reviewId]
    );

    if (result.rows.length === 0) {
      throw makeError('Review not found', 404);
    }

    res.json({
      success: true,
      message: 'Review deleted by admin'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  deleteReviewAdmin
};
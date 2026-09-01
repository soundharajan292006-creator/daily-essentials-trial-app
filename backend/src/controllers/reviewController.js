const db = require('../config/db');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await db.query(
      `SELECT r.*, u.full_name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    // Calculate average rating
    const avgResult = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews FROM reviews WHERE product_id = $1`,
      [productId]
    );

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        summary: {
          average_rating: parseFloat(avgResult.rows[0].avg_rating).toFixed(1) || 0,
          total_reviews: parseInt(avgResult.rows[0].total_reviews) || 0
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
    const { productId } = req.params;
    const { rating, title, review_text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Please provide a valid rating between 1 and 5');
    }

    // Check if user already reviewed
    const alreadyReviewed = await db.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2',
      [productId, req.user.id]
    );

    if (alreadyReviewed.rows.length > 0) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const result = await db.query(
      `INSERT INTO reviews (user_id, product_id, rating, title, review_text) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, productId, rating, title, review_text]
    );

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, title, review_text } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400);
      throw new Error('Please provide a valid rating between 1 and 5');
    }

    const checkReview = await db.query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if(checkReview.rows.length === 0) {
        res.status(404);
        throw new Error('Review not found or unauthorized');
    }

    const result = await db.query(
      `UPDATE reviews SET rating = COALESCE($1, rating), title = COALESCE($2, title), review_text = COALESCE($3, review_text) WHERE id = $4 RETURNING *`,
      [rating, title, review_text, req.params.id]
    );

    res.json({
      success: true,
      message: 'Review updated',
      data: result.rows[0]
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
    const checkReview = await db.query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if(checkReview.rows.length === 0) {
        res.status(404);
        throw new Error('Review not found or unauthorized');
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Review deleted'
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
    const result = await db.query(`SELECT r.*, u.email as user_email, p.name as product_name FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC`);
    res.json({
        success: true,
        data: result.rows
    });
  } catch(error) {
      next(error);
  }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReviewAdmin = async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [req.params.id]);
    if(result.rows.length === 0) {
        res.status(404);
        throw new Error('Review not found');
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

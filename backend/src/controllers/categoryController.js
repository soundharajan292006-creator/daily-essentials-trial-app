const db = require('../config/db');

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY category_name ASC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image_url, active } = req.body;

    const result = await db.query(
      `INSERT INTO categories (name, slug, description, image_url, active) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, slug, description, image_url, active]
    );

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image_url, active } = req.body;

    const checkCat = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (checkCat.rows.length === 0) {
      res.status(404);
      throw new Error('Category not found');
    }

    const result = await db.query(
      `UPDATE categories SET name = $1, slug = $2, description = $3, image_url = $4, active = $5 WHERE id = $6 RETURNING *`,
      [name, slug, description, image_url, active, req.params.id]
    );

    res.json({
      success: true,
      message: 'Category updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const checkCat = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (checkCat.rows.length === 0) {
      res.status(404);
      throw new Error('Category not found');
    }

    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Category removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

const db = require('../config/db');

// GET ALL PRODUCTS
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let query = `
      SELECT *
      FROM products
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*)
      FROM products
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search
    if (search) {
      query += `
        AND (
          product_name ILIKE $${paramIndex}
          OR brand ILIKE $${paramIndex}
        )
      `;

      countQuery += `
        AND (
          product_name ILIKE $${paramIndex}
          OR brand ILIKE $${paramIndex}
        )
      `;

      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category
    if (category) {
      query += `
        AND category_id = $${paramIndex}
      `;

      countQuery += `
        AND category_id = $${paramIndex}
      `;

      params.push(Number(category));
      paramIndex++;
    }

    // Sorting
    if (sort === 'price_asc') {
      query += ` ORDER BY trial_price ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY trial_price DESC`;
    } else if (sort === 'rating') {
      query += ` ORDER BY rating DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY created_at DESC`;
    } else {
      query += ` ORDER BY product_id ASC`;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const offset =
      (pageNumber - 1) * limitNumber;

    query += `
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    const dataParams = [
      ...params,
      limitNumber,
      offset
    ];

    const result = await db.query(
      query,
      dataParams
    );

    const countResult = await db.query(
      countQuery,
      params
    );

    const total = Number(
      countResult.rows[0].count
    );

    const pages = Math.ceil(
      total / limitNumber
    );

    res.json({
      success: true,
      message: 'Products fetched successfully',
      data: {
        products: result.rows,
        page: pageNumber,
        pages,
        total
      }
    });

  } catch (error) {
    next(error);
  }
};


// GET SINGLE PRODUCT
const getProductById = async (
  req,
  res,
  next
) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM products
      WHERE product_id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


// CREATE PRODUCT
const createProduct = async (
  req,
  res,
  next
) => {
  try {
    const {
      category_id,
      product_name,
      brand,
      description,
      price,
      trial_price,
      stock,
      trial_stock,
      image_url,
      is_trial_available,
      size,
      mrp,
      rating,
      review_count
    } = req.body;

    const result = await db.query(
      `
      INSERT INTO products (
        category_id,
        product_name,
        brand,
        description,
        price,
        trial_price,
        stock,
        trial_stock,
        image_url,
        is_trial_available,
        size,
        mrp,
        rating,
        review_count
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14
      )
      RETURNING *
      `,
      [
        category_id,
        product_name,
        brand,
        description,
        price,
        trial_price,
        stock,
        trial_stock,
        image_url,
        is_trial_available,
        size,
        mrp,
        rating || 0,
        review_count || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE PRODUCT
const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const {
      category_id,
      product_name,
      brand,
      description,
      price,
      trial_price,
      stock,
      trial_stock,
      image_url,
      is_trial_available,
      size,
      mrp,
      rating,
      review_count
    } = req.body;

    const result = await db.query(
      `
      UPDATE products
      SET
        category_id = $1,
        product_name = $2,
        brand = $3,
        description = $4,
        price = $5,
        trial_price = $6,
        stock = $7,
        trial_stock = $8,
        image_url = $9,
        is_trial_available = $10,
        size = $11,
        mrp = $12,
        rating = $13,
        review_count = $14
      WHERE product_id = $15
      RETURNING *
      `,
      [
        category_id,
        product_name,
        brand,
        description,
        price,
        trial_price,
        stock,
        trial_stock,
        image_url,
        is_trial_available,
        size,
        mrp,
        rating,
        review_count,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated',
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


// DELETE PRODUCT
const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const result = await db.query(
      `
      DELETE FROM products
      WHERE product_id = $1
      RETURNING product_id
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed'
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
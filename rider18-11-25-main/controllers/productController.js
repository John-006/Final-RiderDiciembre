import { executeQuery } from '../services/dbService.js';

// Obtener todos los productos
export const getProducts = async (req, res, next) => {
  try {
    const products = await executeQuery(`SELECT * FROM products`);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos'
      });
    }

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en getProducts:', error);
    next(error);
  }
};

// Buscar producto por ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await executeQuery(`SELECT * FROM products WHERE id = ?`, [id]);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: products[0]
    });

  } catch (error) {
    console.error('Error en getProductById:', error);
    next(error);
  }
};

// Buscar productos por nombre
export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    const products = await executeQuery(
      `SELECT * FROM products WHERE nombre LIKE ?`,
      [`%${q}%`]
    );

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en searchProducts:', error);
    next(error);
  }
};

// Crear nuevo producto
export const createProduct = async (req, res, next) => {
  try {
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y precio son requeridos'
      });
    }

    const result = await executeQuery(
      `INSERT INTO products (nombre, precio, stock) VALUES (?, ?, ?)`,
      [nombre, precio, stock || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        id: result.insertId,
        nombre,
        precio,
        stock: stock || 0
      }
    });

  } catch (error) {
    console.error('Error en createProduct:', error);
    next(error);
  }
};

// Actualizar producto
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y precio son requeridos'
      });
    }

    const result = await executeQuery(
      `UPDATE products SET nombre = ?, precio = ?, stock = ? WHERE id = ?`,
      [nombre, precio, stock || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { id: parseInt(id), nombre, precio, stock }
    });

  } catch (error) {
    console.error('Error en updateProduct:', error);
    next(error);
  }
};

// Eliminar producto
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(`DELETE FROM products WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteProduct:', error);
    next(error);
  }
};


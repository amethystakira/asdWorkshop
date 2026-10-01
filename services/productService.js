const productDb = require('../database/productDb');

const productService = {
  async getAllProducts() {
    return await productDb.getAll();
  },

  async getProductById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }
    return await productDb.getById(numericId);
  },

  async createProduct(productData) {
    if (!productData || !productData.name) {
      const err = new Error('Product name is required');
      err.status = 400;
      throw err;
    }
    return await productDb.create(productData);
  },

  async updateProduct(id, productData) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }
    if (!productData || !productData.name) {
      const err = new Error('Product name is required');
      err.status = 400;
      throw err;
    }
    return await productDb.update(numericId, productData);
  },

  async patchProduct(id, partialData) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }
    return await productDb.patch(numericId, partialData);
  },

  async deleteProduct(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }
    return await productDb.delete(numericId);
  }
};

module.exports = productService;

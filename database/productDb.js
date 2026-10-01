const fs = require('fs/promises');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

async function readFileWithDelay() {
  const delay = process.env.DB_DELAY_MS !== undefined ? Number(process.env.DB_DELAY_MS) : 1500;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return await readDb();
}

const productDb = {
  async getAll() {
    return await readFileWithDelay();
  },

  async getById(id) {
    const products = await readFileWithDelay();
    return products.find((item) => item.id === id) || null;
  },

  async create(productData) {
    const products = await readDb();
    const maxId = products.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newProduct = {
      id: maxId + 1,
      ...productData
    };
    products.push(newProduct);
    await writeDb(products);
    return newProduct;
  },

  async update(id, productData) {
    const products = await readDb();
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const updatedProduct = {
      id,
      ...productData
    };
    products[index] = updatedProduct;
    await writeDb(products);
    return updatedProduct;
  },

  async patch(id, partialData) {
    const products = await readDb();
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const updatedProduct = {
      ...products[index],
      ...partialData,
      id // preserve original id
    };
    products[index] = updatedProduct;
    await writeDb(products);
    return updatedProduct;
  },

  async delete(id) {
    const products = await readDb();
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const [deletedProduct] = products.splice(index, 1);
    await writeDb(products);
    return deletedProduct;
  }
};

module.exports = productDb;

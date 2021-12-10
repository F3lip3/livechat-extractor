import Product from '../schemas/Product.js';
import ProductsRepository from '../repositories/products.js';
import { log } from '../utils.js';

export const add = async product => {
  log(`adding product ${product.name}`);

  const existingProduct = await find(product.name);
  if (existingProduct) {
    log(`product already exists`);
    return existingProduct;
  }

  const { product_id, account_product_id } =
    await ProductsRepository.findOrInsert(product);

  const newProduct = await Product.create({
    name: product.name,
    product_id,
    account_product_id
  });

  log('product created', 'success');
  return newProduct;
};

const find = async name => {
  const existingProduct = await Product.findOne({ name });

  return existingProduct;
};

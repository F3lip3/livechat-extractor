import Product from '../schemas/Product.js';
import ProductsRepository from '../repositories/products.js';
import { log } from '../utils.js';

export default class ProductsService {
  _productsRepository;

  constructor(_productsRepository) {
    this._productsRepository = _productsRepository;
  }

  add = async product => {
    log(`adding product ${product.name}`);

    const existingProduct = await this._find(product.name);
    if (existingProduct) {
      log(`product already exists`);
      return existingProduct;
    }

    const { product_id, account_product_id } =
      await this._productsRepository.findOrInsert(product);

    const newProduct = await Product.create({
      name: product.name,
      product_id,
      account_product_id
    });

    log('product created');
    return newProduct;
  };

  _find = async name => {
    const existingProduct = await Product.findOne({ name });

    return existingProduct;
  };
}

import Product from '../schemas/Product.js';
import ProductsRepository from '../repositories/products.js';
import { log } from '../utils.js';

export default class ProductsService {
  constructor(private productsRepository) {}

  public add = async product => {
    log(`adding product ${product.name}`);

    const existingProduct = await this.find(product.name);
    if (existingProduct) {
      log(`product already exists`);
      return existingProduct;
    }

    const { product_id, account_product_id } =
      await this.productsRepository.findOrInsert(product);

    const newProduct = await Product.create({
      name: product.name,
      product_id,
      account_product_id
    });

    log('product created', 'success');
    return newProduct;
  };

  private find = async name => {
    const existingProduct = await Product.findOne({ name });

    return existingProduct;
  };
}

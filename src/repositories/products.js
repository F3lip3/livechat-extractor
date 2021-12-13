export default class ProductsRepository {
  findOrInsert = async product => {
    const existingProduct = await query(
      `
      SELECT [product].id,
             [accountProduct].id as [accountProductId]
      FROM [product] WITH(NOLOCK)
      LEFT JOIN [accountProduct]
        ON [product].id = [accountProduct].productId
       AND [accountProduct].accountId = 6
      WHERE name = @name`,
      { name: product.name }
    );

    if (existingProduct) {
      let { id: product_id, accountProductId: account_product_id } =
        existingProduct;
      if (!account_product_id) {
        const accountProduct = await this._linkProductToAccount(product_id);
        account_product_id = accountProduct.id;
      }

      return {
        product_id,
        account_product_id
      };
    }

    const newProduct = await query(
      `
      INSERT INTO [product] ([name], [createdAt], [updatedAt])
      OUTPUT inserted.id
      VALUES (@name, GETDATE(), GETDATE())
    `,
      { name: product.name }
    );

    const accountProduct = await this._linkProductToAccount(newProduct.id);

    return {
      product_id: newProduct.id,
      account_product_id: accountProduct.id
    };
  };

  _linkProductToAccount = async productId => {
    const newAccountProduct = await query(
      `
      INSERT INTO [accountProduct]([accountId], [productId], [externalId], [createdAt])
      OUTPUT inserted.id
      VALUES (6, @productId, NEWID(), GETDATE())`,
      { productId }
    );

    return newAccountProduct;
  };
}

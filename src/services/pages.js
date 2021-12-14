import Page from '../schemas/Page.js';

export default class PagesService {
  add = async ({ object, next_page_id }) => {
    await Page.create({
      object,
      next_page_id
    });
  };

  find = async object => {
    const page = await Page.findOne(
      { object },
      {},
      { sort: { createdAt: -1 } }
    );

    return page;
  };
}

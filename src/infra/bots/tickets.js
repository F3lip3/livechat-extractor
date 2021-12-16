import chalk from 'chalk';
import fetch from 'node-fetch';

import CommentsRepository from '../../repositories/comments.js';
import TicketsRepository from '../../repositories/tickets.js';
import UsersRepository from '../../repositories/users.js';
import CommentsService from '../../services/comments.js';
import PagesService from '../../services/pages.js';
import TicketsService from '../../services/tickets.js';
import { execute, getArgument, log, info } from '../../utils.js';

const init = async () => {
  const token = getArgument('token');
  if (!token) {
    log('no token provided. Use --token argument.', 'error');
    process.exit(1);
  }

  const pagesService = new PagesService();
  const nextPage = await pagesService.find('ticket');

  let page = 1;
  if (nextPage) {
    page = nextPage.next_page;
  }

  const command = `curl --request GET \
    --url 'https://api.helpdesk.com/v1/tickets?sortBy=updatedAt&order=desc&page=${page}&pageSize=100' \
    --header 'Authorization: Bearer ${token}'`;

  execute(command, async (err, tickets) => {
    if (!!err) {
      log(JSON.stringify(err), 'error');
      process.exit(1);
    }

    if (tickets.error) {
      log(JSON.stringify(response.error), 'error');
      process.exit(1);
    }

    if (!tickets.length) {
      log('process finished', 'info');
      process.exit();
    }

    const usersRepository = new UsersRepository();
    const commentsRepository = new CommentsRepository();
    const ticketsRepository = new TicketsRepository();

    const commentsService = new CommentsService(
      commentsRepository,
      usersRepository
    );

    const ticketsService = new TicketsService(
      ticketsRepository,
      usersRepository
    );

    if (!info.total) info.total = 60646;
    if (!info.processed) {
      info.processed = await ticketsRepository.getTotalTickets();
    }

    log(`found ${tickets.length} tickets`, 'info');
    const result = await Promise.all(
      tickets.map(async ticket => {
        const mappedTicket = await ticketsService.add(ticket);
        if (mappedTicket) {
          if (!ticket.events?.length) {
            log('ticket without events. Moving to next', 'info');
            return false;
          } else {
            log('adding comments');
            const commentsResult = await commentsService.add({
              ticketId: ticket['ID'],
              comments: ticket.events
            });

            return commentsResult;
          }

          return true;
        }

        return false;
      })
    );

    const addedTickets = result.filter(x => !!x);

    info.processed += addedTickets.length;

    log(
      `added ${addedTickets.length} tickets`,
      addedTickets.length ? 'success' : 'warn'
    );

    await pagesService.add({
      object: 'ticket',
      next_page: page + 1,
      next_page_id: undefined
    });

    await init();
  });
};

await init();

import { v4 as uuid } from 'uuid';

import Ticket from '../schemas/Ticket.js';
import Team from '../schemas/Team.js';
import UsersService from '../services/users.js';
import { log } from '../utils.js';

export default class TicketsService {
  _allTeams = [];
  _ticketsRepository;
  _usersService;

  constructor(_ticketsRepository, _usersRepository) {
    this._ticketsRepository = _ticketsRepository;
    this._usersService = new UsersService(_usersRepository);
  }

  add = async ticket => {
    if (!ticket.shortID) {
      log('invalid ticket', 'error', ticket);
      return undefined;
    }

    if (!ticket.requester) {
      log('ticket without requester', 'error');
      return undefined;
    }

    if (!ticket.requester.email) {
      log('ticket without requester email', 'error');
      return undefined;
    }

    const existingTicket = await this._find({ id: ticket['ID'] });
    if (existingTicket) {
      log(`ticket ${ticket.shortID} already exists`);
      return existingTicket;
    }

    log('adding or finding requester');
    const userData = {
      id: uuid(),
      email: ticket.requester.email,
      name: ticket.requester.name || ticket.requester.email,
      type: 'customer'
    };

    const user = await this._addUser(userData);
    if (!user) {
      log(
        `failed to add ticket ${ticket.shortID} requester`,
        'error',
        userData
      );
      return undefined;
    }

    log('setting team');
    const team = ticket.assignment?.team?.ID
      ? await this._findTeam(ticket.assignment?.team?.ID)
      : undefined;

    const ticketData = {
      externalId: ticket.shortID,
      userId: user.account_user_id,
      groupId: team?.account_group_id,
      subject: this._formatSubject(ticket.subject),
      createdAt: new Date(ticket.createdAt),
      solvedAt: new Date(ticket.updatedAt)
    };

    log('adding ticket to database', 'trace', ticketData);
    const { id: ticket_id } = await this._ticketsRepository.findOrInsert(
      ticketData
    );

    log('saving ticket');
    const newTicket = await Ticket.create({
      id: ticket['ID'],
      short_id: ticket.shortID,
      ticket_id
    });

    log(`ticket ${ticket.shortID} created`, 'success');
    return newTicket;
  };

  _addUser = async user => {
    const newUser = await this._usersService.add(user);

    return newUser;
  };

  _find = async ({ id }) => {
    const existingTicket = await Ticket.findOne({ id });

    return existingTicket;
  };

  _findTeam = async teamId => {
    if (!this._allTeams.length) {
      this._allTeams = await Team.find({});
    }

    return this._allTeams.find(team => team.id === teamId);
  };

  _formatSubject = async subject => {
    if (!subject) return '';
    if (subject.length >= 300) {
      return subject.substring(0, 295) + '...';
    }

    return subject;
  };
}

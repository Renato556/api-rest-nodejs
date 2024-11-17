import { FastifyInstance } from 'fastify';
import { checkSessionId } from '../middlewares/check-session-id';

import { booksService } from '../services/booksService';
import { setSessionId } from '../middlewares/set-session-id';

// http

// controller
// service
// repository

// SOLID

// unit
// integration
// e2e

export async function booksRouter(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      return { books: await booksService.getAll(sessionId!) };
    },
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      return { book: await booksService.getOne(request, sessionId!) };
    },
  );

  app.post(
    '/',
    {
      preHandler: [setSessionId],
    },
    async (request, reply) => {
    const { sessionId } = request.cookies;
    await booksService.createBook(request, sessionId!);

    return reply.status(201).send();
  });

  app.put(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      try {
        await booksService.updateBook(request, sessionId!);
        return reply.status(204).send();
      } catch (e) {
        return reply.status(404).send((e as Error).message);
      }
    },
  );

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      try {
        await booksService.deleteBook(request, sessionId!);
        return reply.status(204).send();
      } catch (e) {
        return reply.status(404).send((e as Error).message);
      }
    },
  );
}

import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
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
      return booksService.getAll(sessionId!);
    },
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      return booksService.getOne(request, sessionId!);
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
    async () => {
      // Implement PUT route for updating a book
    },
  );

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async () => {
      // Implement DELETE route for deleting a book
    },
  );
}

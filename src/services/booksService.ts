import { FastifyRequest } from 'fastify';
import { knex } from '../db';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const booksService = {
  async getAll(sessionId: string) {
    return knex('books').where('session_id', sessionId).select();
  },

  async getOne(request: FastifyRequest, sessionId: string) {
    const getBookParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getBookParamsSchema.parse(request.params);

    return knex('books')
      .where({
        id,
        session_id: sessionId,
      })
      .first();
  },

  async createBook(request: FastifyRequest, sessionId: string) {
    const createBookBodySchema = z.object({
      title: z.string(),
      genre: z.string(),
      author: z.string(),
    });

    const { title, author, genre } = createBookBodySchema.parse(request.body);

    await knex('books').insert({
      id: randomUUID(),
      title,
      author,
      genre,
      session_id: sessionId as string,
    });
  },

  async updateBook(request: FastifyRequest, sessionId: string) {
    const book = await this.getOne(request, sessionId);
    if (!book) {
      throw new Error('Book not found');
    }

    const updateBookBodySchema = z.object({
      title: z.string().optional(),
      genre: z.string().optional(),
      author: z.string().optional(),
    });

    const { title, genre, author } = updateBookBodySchema.parse(request.body);

    await knex('books')
      .update({ title, genre, author })
      .where(book);
  },

  async deleteBook(request: FastifyRequest, sessionId: string) {
    const book = await this.getOne(request, sessionId);
    if (!book) {
      throw new Error('Book not found');
    }

    await knex('books')
      .where(book)
      .del();
  },
};

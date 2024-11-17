import { it, expect, describe, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { app } from '../src/app';

async function addBook(book: { title: string, genre: string, author: string }) {
  const createBookResponse = await request(app.server)
    .post('/books')
    .send(book);

  const cookies = createBookResponse.get('Set-Cookie') ?? [];

  const listBooksResponse = await request(app.server)
    .get('/books')
    .set('Cookie', cookies)
    .expect(200);

  return {
    bookId: listBooksResponse.body.books[0].id,
    cookies,
  };
}

describe('Books routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npx knex -- migrate:rollback --all');
    execSync('npx knex -- migrate:latest');
  });

  it('should be able to create a new book', async () => {
    const response = await request(app.server).post('/books').send({
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Test Genre',
    });

    expect(response.status).toBe(201);
  });

  describe('GET/books', () => {
    it('should be able to list all books', async () => {
      const book = {
        title: 'Test Book 2',
        author: 'Test Author 2',
        genre: 'Test Genre 2',
      };

      const { cookies } = await addBook(book);

      const listBooksResponse = await request(app.server)
        .get('/books')
        .set('Cookie', cookies)
        .expect(200);

      expect(listBooksResponse.body.books).toEqual([
        expect.objectContaining(book),
      ]);
    });

    it('should return status 401 when there is not cookies', async () => {
      const listBooksResponse = await request(app.server).get('/books');

      expect(listBooksResponse.status).toBe(401);
    });
  });

  describe('PUT/books', () => {
    it('should be able to edit a specific book', async () => {
      const book = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
      };

      const { bookId, cookies } = await addBook(book);

      const editedBook = {
        genre: 'Coding',
      }

      await request(app.server)
        .put(`/books/${bookId}`)
        .set('Cookie', cookies)
        .send(editedBook)
        .expect(204);

      const getBookResponse = await request(app.server)
        .get(`/books/${bookId}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(getBookResponse.body.book).toEqual(expect.objectContaining({
        ...book,
        ...editedBook,
      }));
    });

    it('should return status 404 when book does not exist', async () => {
      const book = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
      };

      const { bookId, cookies } = await addBook(book);

      const editedBook = {
        genre: 'Coding',
      }

      // delete book
      await request(app.server)
        .delete(`/books/${bookId}`)
        .set('Cookie', cookies)
        .expect(204);

      const updateBookResponse = await request(app.server)
        .put(`/books/${bookId}`)
        .set('Cookie', cookies)
        .send(editedBook);

      expect(updateBookResponse.status).toBe(404);
    });
  });

  describe('DELETE/books', () => {
    it('should be able to delete a specific book', async () => {
      const book = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
      };

      const { bookId, cookies } = await addBook(book);

      await request(app.server)
        .delete(`/books/${bookId}`)
        .set('Cookie', cookies)
        .expect(204);

      const getBookResponse = await request(app.server)
        .get(`/books/${bookId}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(getBookResponse.body).toEqual({});
    });

    it('should return status 404 when book does not exist', async () => {
      const book = {
        title: 'Test Book',
        author: 'Test Author',
        genre: 'Test Genre',
      };

      const { bookId, cookies } = await addBook(book);

      // delete book
      await request(app.server)
        .delete(`/books/${bookId}`)
        .set('Cookie', cookies)
        .expect(204);

      const deleteBookResponse = await request(app.server)
        .delete(`/books/${bookId}`)
        .set('Cookie', cookies);

      expect(deleteBookResponse.status).toBe(404);
    });
  })
});

import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';

export async function setSessionId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    request.cookies.sessionId = randomUUID();
    reply.cookie('sessionId', request.cookies.sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, //7 days
    });
  }
}

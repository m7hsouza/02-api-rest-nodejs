import crypto from 'node:crypto'

import { type FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .select('*')
        .where({ id })
        .first()

      if (!transaction) {
        return await reply.status(404).send()
      }

      return { transaction }
    },
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.coerce.number().positive(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    await knex('transactions')
      .insert({
        id: crypto.randomUUID(),
        title,
        amount: type === 'debit' ? -amount : amount,
        session_id: sessionId,
      })
      .returning('*')

    return await reply.status(201).send()
  })
}

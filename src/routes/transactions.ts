import crypto from 'node:crypto'

import { type FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function transactionsRoutes (app: FastifyInstance): Promise<void> {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')

    return { transactions }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.coerce.number().positive(),
      type: z.enum(['credit', 'debit'])
    })

    const { title, amount, type } = createTransactionBodySchema.parse(request.body)

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'debit' ? -amount : amount
    }).returning('*')

    return await reply.status(201).send()
  })
}

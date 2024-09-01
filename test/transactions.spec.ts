import { execSync } from 'node:child_process'
import request from 'supertest'
import {
  it,
  beforeAll,
  afterAll,
  describe,
  expect,
  beforeEach,
  afterEach,
} from 'vitest'

import { app } from '../src/app'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(() => {
    execSync('npm run knex migrate:rollback')
  })

  it('should be able to crete a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 1000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to get all transcactions', async () => {
    const server = request(app.server)
    const createTransactionResponse = await server.post('/transactions').send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })

    const cookie = createTransactionResponse.headers['set-cookie']

    const listTransactionsResponse = await server
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    expect(listTransactionsResponse.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: 'New transaction',
          amount: 1000,
        }),
      ],
    })
  })

  it('should be able to get a transaction by id', async () => {
    const server = request(app.server)
    const createTransactionResponse = await server.post('/transactions').send({
      title: 'New transaction',
      amount: 1000,
      type: 'credit',
    })

    const cookie = createTransactionResponse.headers['set-cookie']

    const listTransactionsResponse = await server
      .get('/transactions')
      .set('Cookie', cookie)

    const createdTransaction = listTransactionsResponse.body.transactions[0]

    const getTransactionResponse = await server
      .get(`/transactions/${createdTransaction.id}`)
      .set('Cookie', cookie)
      .expect(200)
    expect(getTransactionResponse.body).toEqual({
      transaction: createdTransaction,
    })
  })

  it('should be able get a summary of all transactions', async () => {
    const server = request(app.server)
    const createTransactionResponse = await server.post('/transactions').send({
      title: 'Transaction 1',
      amount: 1549.84,
      type: 'credit',
    })

    const cookie = createTransactionResponse.headers['set-cookie']

    await server.post('/transactions').set('Cookie', cookie).send({
      title: 'Transaction 2',
      amount: 156.41,
      type: 'debit',
    })

    const summaryResponse = await server
      .get('/transactions/summary')
      .set('Cookie', cookie)
      .expect(200)

    expect(summaryResponse.body).toEqual({
      summary: {
        amount: 1549.84 - 156.41,
      },
    })
  })
})

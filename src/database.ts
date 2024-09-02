import { knex as setupKnex, type Knex } from 'knex'
import { env } from './env'

let connection
if (env.DATABASE_CLIENT === 'pg') {
  connection = env.DATABASE_CLIENT
} else {
  connection = {
    filename: env.DATABASE_URL,
  }
}

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
}

export const knex = setupKnex(config)

// Update with your config settings.
import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.LMRD_DB_HOST || '127.0.0.1',
      port: Number(process.env.LMRD_DB_PORT) || 3306,
      user: process.env.LMRD_DB_USER,
      password: process.env.LMRD_DB_PASS,
      database: process.env.LMRD_DB_NAME,
    },
    migrations: {
      directory: __dirname + '/database/knex_migrations',
    },
  },

  production: {
    client: 'mysql',
    connection: {
      host: process.env.LMRD_DB_HOST || '127.0.0.1',
      port: Number(process.env.LMRD_DB_PORT) || 3306,
      user: process.env.LMRD_DB_USER,
      password: process.env.LMRD_DB_PASS,
      database: process.env.LMRD_DB_NAME,
    },
    pool: {
      min: 2,
      max: 20,
    },
    acquireConnectionTimeout: 120000, // default 60000
    migrations: {
      directory: __dirname + '/database/knex_migrations',
    },
  },
};

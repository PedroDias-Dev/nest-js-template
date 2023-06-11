// eslint-disable-next-line @typescript-eslint/no-require-imports
const knex = require('knex');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../knexfile');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const objection = require('objection');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const conn = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  charset: 'utf8'
};

const createDatabase = async () => {
  const connection = knex({ client: 'postgres', connection: conn });

  connection
    .raw(
      `
      CREATE DATABASE ${process.env.DATABASE_DB} 
      WITH OWNER = "postgres" 
      ENCODING = 'UTF8' 
      CONNECTION LIMIT = -1;
      `
    )
    .then(function() {
      connection.destroy();
      console.log('DATABASE RESETED');
    })
    .catch(() => {
      console.log('DATABASE ALREADY EXISTS');
    });
};

const resetDatabase = async () => {
  await createDatabase();

  const environment = process.env.NODE_ENV || 'development';
  const connection = knex(config[environment]);

  objection.Model.knex(connection);

  await connection.migrate.rollback(undefined, true);

  await connection.migrate.latest();
  await connection.seed.run();

  await connection.destroy();

  console.log('DATABASE RESETED');
};

resetDatabase();

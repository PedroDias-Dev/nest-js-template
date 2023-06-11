const faker = require('faker/locale/pt_BR');

exports.seed = async function(knex) {
  const users = await knex
    .count()
    .from('users')
    .first();

  if (Number(users.count) !== 2) return;

  for (let x = 0; x < 100; x++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    const user = {
      firstName,
      lastName,
      email: faker.internet.email(`${lastName}_${x}`, firstName).toLowerCase(),
      password: '$2b$11$Ht0vFtWZHNh0nOlFr1iLUu2/.p//LlghbIxzckI1bmFjVNDn78tKm', //senha@123
      roles: 'user',
      createdDate: new Date(),
      updatedDate: new Date()
    };

    await knex.insert(user).into('users');
  }
};

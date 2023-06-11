exports.seed = async function(knex) {
  const users = [
    {
      firstName: 'ADMIN',
      lastName: 'Admin',
      email: 'admin@admin.com',
      password: '$2b$11$Ht0vFtWZHNh0nOlFr1iLUu2/.p//LlghbIxzckI1bmFjVNDn78tKm', //senha@123
      roles: 'sysAdmin',
      createdDate: new Date(),
      updatedDate: new Date()
    },
    {
      firstName: 'Teste',
      lastName: 'User',
      email: 'teste@email.com',
      password: '$2b$11$Ht0vFtWZHNh0nOlFr1iLUu2/.p//LlghbIxzckI1bmFjVNDn78tKm', //senha@123
      roles: 'user',
      createdDate: new Date(),
      updatedDate: new Date()
    }
  ];

  await knex('users').insert(users);
};

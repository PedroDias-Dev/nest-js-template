exports.up = async function(knex) {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('firstName', 50).notNullable();
    table.string('lastName', 50).nullable();
    table
      .string('email', 150)
      .notNullable()
      .unique();
    table.string('password', 72).notNullable();
    table.string('roles', 1000).notNullable();
    table.dateTime('createdDate').notNullable();
    table.dateTime('updatedDate').notNullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
};

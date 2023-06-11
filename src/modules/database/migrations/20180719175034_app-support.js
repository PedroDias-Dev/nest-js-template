exports.up = async function(knex) {
  await knex.schema.createTable('devices', table => {
    table
      .string('id', 150)
      .notNullable()
      .primary();

    table
      .integer('userId')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('name', 150).notNullable();
    table.uuid('currentToken').notNullable();
    table.string('notificationToken', 250).nullable();
    table.dateTime('createdDate').notNullable();
    table.dateTime('updatedDate').notNullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('devices');
};


exports.up = function(knex) {
    return knex.schema.createTable("organizador", function (table) {
        table.string("email").primary().notNullable();
        table.string("nome").notNullable();
        table.string("cnpj").notNullable();
        table.string("telefone").notNullable();
        table.string("whatsapp").notNullable();
        table.string("senha").notNullable();
      });
};

exports.down = function(knex) {
  return knex.schema.dropTable("organizador");
};

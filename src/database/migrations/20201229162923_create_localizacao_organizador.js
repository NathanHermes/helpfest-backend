
exports.up = function(knex) {
    return knex.schema.createTable("localizacao_organizador", function (table) {
        table.string("rua").notNullable();
        table.integer("numero").notNullable();
        table.string("cidade").notNullable();
        table.string("uf", 2).notNullable();
        table.string("email_organizador").notNullable().primary();
    
        table
          .foreign("email_organizador")
          .references("email")
          .inTable("organizador");
      });
};

exports.down = function(knex) {
  return knex.schema.dropTable("localizacao_organizador");
};

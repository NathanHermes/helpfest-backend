/**
 * Exportando a função que cria a tabela no banco de dados
 */
exports.up = function (knex) {
  /**
   * Retornando a query que cria a tabela festa
   */
  return knex.schema.createTable("localizacao_festa", function (table) {
    table.string("rua").notNullable();
    table.string("numero").notNullable();
    table.string("cidade").notNullable();
    table.string("uf", 2).notNullable();

    table.integer("festa_id").primary().notNullable();
    table.foreign("festa_id").references("id").inTable("festa");
  });
};

/**
 * Exportando a função que deleta a tabela do banco de dados
 */
exports.down = function (knex) {
  /**
   * Retornando a query que deleta a tabela organizador
   */
  return knex.schema.dropTable("localizacao_festa");
};

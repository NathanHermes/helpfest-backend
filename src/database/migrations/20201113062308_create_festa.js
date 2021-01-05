/**
 * Exportando a função que cria a tabela no banco de dados
 */
exports.up = function (knex) {
  /**
   * Retornando a query que cria a tabela festa
   */
  return knex.schema.createTable("festa", function (table) {
    table.increments("id").primary();

    table.string("nome_festa").notNullable();
    table.date("data_festa").notNullable();
    table.string("horario_inicio").notNullable();
    table.string("horario_fim").notNullable();
    table.string("telefone").notNullable();
    table.string("whatsapp").notNullable();
    table.string("convidados").notNullable();
    table.string("outros").notNullable();

    table.string("email_organizador").notNullable();
    table
      .foreign("email_organizador")
      .references("email")
      .inTable("organizador");
  });
};

/**
 * Exportando a função que deleta a tabela do banco de dados
 */
exports.down = function (knex) {
  /**
   * Retornando a query que deleta a tabela organizador
   */
  return knex.schema.dropTable("festa");
};

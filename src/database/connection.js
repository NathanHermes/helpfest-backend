/**
 * Importando a biblioteca do knex para manipulação do banco de dados.
 *
 * Importando arquivo de configurações de acesso ao banco de dados.
 */
const knex = require("knex");
const configuration = require("../../knexfile");

/**
 * Definindo a configuração de acesso ao banco de dados como desenvolvedor
 */
const connection = knex(configuration.development);

/**
 * Exportando a função de conexão com o banco de dados para ser acessada por outros arquivos.
 */
module.exports = connection;

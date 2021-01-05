/**
 * Importando a conexão com o banco
 */
const connection = require("../database/connection");

/**
 * Exportando as funções do controller para ser acessada por outros arquivos
 */
module.exports = {
  /**
   * Função que busca festas específicas de cada organizador
   */
  async index(request, response) {
    /**
     * Busca do header o email do organizador
     */
    const email_organizador = request.headers.authorization;
    const { page = 1 } = request.query;

    /**
     * Query que busca no tabela festa todas as festas com email_organizador igual ao retornado do header
     */
    const festas = await connection("festa")
      .join("files_festa", "festa.id", "files_festa.festa_id")
      .limit(5)
      .offset((page - 1) * 5)
      .where("email_organizador", email_organizador)
      .select(["festa.*", "files_festa.*"]);

    /**
     * Retorna as festas como resposta
     */
    return response.json(festas);
  },

  async search(request, response) {
    const { id } = request.params;

    const festa = await connection("festa")
      .join("localizacao_festa", "festa.id", "localizacao_festa.festa_id")
      .where("id", id)
      .select([
        "festa.*",
        "localizacao_festa.rua",
        "localizacao_festa.numero",
        "localizacao_festa.cidade",
        "localizacao_festa.uf",
      ])
      .join("files_festa", "festa.id", "files_festa.festa_id")
      .where("id", id)
      .select(["festa.*", "files_festa.*"]);

    return response.json(festa);
  },
};

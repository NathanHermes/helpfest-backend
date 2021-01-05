/**
 * Importando a conexão com o banco de dados
 */
const connection = require("../database/connection");
const bcrypt = require("bcryptjs");

/**
 * Exportando as funções do controller para ser acessado por outros arquivos
 */
module.exports = {
  /**
   * Função que cria uma nova sessão na página -> será usada para fazer login
   */
  async create(request, response) {
    /**
     * Busca no front-end o email do organizador
     */
    const { email, senha } = request.body;

    /**
     * Query que busca na tabela organizador, por meio do email retorado do front-end, o nome do organizador
     */
    const organizador = await connection("organizador")
      .where("email", email)
      .select("nome", 'senha')
      .first();

    /**
     * Verificando se esse organizador realmente existe
     */
    if (!organizador) {
      return response
        .status(400)
        .json({ error: "Não existe um organizador com esse email" });
    }

    const verificarSenha = bcrypt.compareSync(senha, organizador.senha);
    
    if(verificarSenha === false){
      return response
        .status(404)
        .json({ error: "Verifique a senha e tente novamente." });
    }

    /**
     * Retornando o nome do organizador para o front-end
     */
    return response.json(organizador.nome);
  },
};

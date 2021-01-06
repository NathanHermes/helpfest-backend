/**
 * Importando a conexão com o banco de dados
 */
const connection = require("../database/connection");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

/**
 * Exportando as funções do controller para que outros arquivos possam acessar
 */
module.exports = {
  /**
   * Função que busca no banco de dados todas as festas
   */
  async index(request, response) {
    /**
     * Query da URL que define a paginação do app
     */
    const { page = 1 } = request.query;

    const [count] = await connection("festa").count();

    /**
     * Query que busca as festas na tabela festa e faz um join com
     * suas respectivas linhas na tabela localizacao_festa de acordo com a paginação
     */
    const festas = await connection("festa")
      .join("localizacao_festa", "festa.id", "localizacao_festa.festa_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        "festa.*",
        "localizacao_festa.rua",
        "localizacao_festa.numero",
        "localizacao_festa.cidade",
        "localizacao_festa.uf",
      ])
      .join("files_festa", "festa.id", "files_festa.festa_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select(["festa.*", "files_festa.*"]);

    response.header("X-Total-Count", count["count(*)"]);

    return response.json(festas);
  },

  /**
   * Função que busca os dados do front-end e adiciona esse conteudo
   * no banco de dados;
   */
  async create(request, response) {
    /**
     *  Buscando as informações inseridas no front-end
     */
    const { originalname: nome, size, filename: key } = request.file;

    const {
      nome_festa,
      data_festa,
      horario_inicio,
      horario_fim,
      convidados,
      outros,
      rua,
      numero,
      cidade,
      uf,
      imgurURL,
    } = request.body;

    console.log(request.body);

    /**
     * Buscando o email do organizador que está criando a festa por meio do cabeçalho
     */
    const email_organizador = request.headers.authorization;

    /**
     * Query buscando na tabela organizador o telefone e o whatsapp para que essas informações não precisem ser digitadas
     * todas as vezes
     */
    const resposta = await connection("organizador")
      .select("telefone", "whatsapp")
      .where("email", email_organizador)
      .first();

    /**
     * Define a partir da query acima os valores dentro das variaveis
     */
    const telefone = resposta.telefone;
    const whatsapp = resposta.whatsapp;

    /**
     * Inserindo as informações na tabela festa
     */
    const [id] = await connection("festa").insert({
      nome_festa,
      data_festa,
      horario_inicio,
      horario_fim,
      telefone,
      whatsapp,
      convidados,
      outros,
      email_organizador,
    });

    /**
     * Informando que a variavel festa_id possui o mesmo valor da variavel id
     */
    const festa_id = id;

    /**
     * Inserindo as informações da localização da festa na tabela localizacao_festa
     */
    await connection("localizacao_festa").insert({
      rua,
      numero,
      cidade,
      uf,
      festa_id,
    });

    var url = imgurURL;

    if (imgurURL === "undefined") {
      url = `http://26.134.180.105:3333/files/${key}`;
    }

    await connection("files_festa").insert({
      nome,
      size,
      url,
      festa_id,
      key,
    });

    /**
     * Retornando como resposta o id da festa criada
     */
    return response.json({ id });
  },

  /**
   * Funçao que alterar as informações das festa no banco de dados
   */
  async update(request, response) {
    /**
     * Buscando na URL o id da festa
     */
    const { id } = request.params;

    /**
     * Buscando no front-end as informações a serem alteradas
     */
    const {
      nome_festa,
      data_festa,
      horario_inicio,
      horario_fim,
      convidados,
      outros,
      rua,
      numero,
      cidade,
      uf,
    } = request.body;

    /**
     * Buscando o email do organizador pelo header do pagina
     */
    const email_organizador = request.headers.authorization;

    /**
     * Query buscando na tabela festa o email_organizador
     */
    const festa = await connection("festa")
      .where("id", id)
      .select("email_organizador")
      .first();

    /**
     * Verificando para saber se o email_organizador é o mesmo que vem do header
     */
    if (festa.email_organizador !== email_organizador) {
      /**
       * Retornando uma resposta caso o email que queira alterar não seja o mesmo que criou
       */
      return response.status(401).json({ error: "Operação não autorizada" });
    }

    /**
     * Alterando as informações da tabela festa pelas novas
     */
    await connection("festa")
      .update({
        nome_festa,
        data_festa,
        horario_inicio,
        horario_fim,
        convidados,
        outros,
      })
      .where("email_organizador", email_organizador);

    /**
     * Alterando as informações tabela localizacao_festa pelas novas
     */
    await connection("localizacao_festa")
      .update({
        rua,
        numero,
        cidade,
        uf,
      })
      .where("festa_id", id);

    if (request.file !== undefined) {
      const { originalname: nome, size, filename: key } = request.file;

      const file = await connection("files_festa")
        .where("festa_id", id)
        .select("key")
        .first();

      await promisify(fs.unlink)(
        path.resolve(__dirname, "..", "..", "temp", "uploads", file.key)
      );

      if (nome !== "undefined") {
        const url = `http://26.134.180.105:3333/files/${key}`;

        await connection("files_festa")
          .update({
            nome,
            size,
            url,
            key,
          })
          .where("festa_id", id);
      }
    }

    /**
     * Retornando uma resposta de sucesso
     */
    return response.status(200).send();
  },

  /**
   * Função que deleta informações da festa do banco de dados
   */
  async delete(request, response) {
    /**
     * Buscando na URL o id da festa a ser deletada
     */
    const { id } = request.params;

    /**
     * Buscando no header o email do organizador que quer deletar a festa
     */
    const email = request.headers.authorization;

    /**
     * Query buscando na tabela festao email_organizador da festa que tenha o id da URL
     */
    const festa = await connection("festa")
      .where("id", id)
      .select("email_organizador")
      .first();

    const file = await connection("files_festa")
      .where("festa_id", id)
      .select("key")
      .first();

    /**
     * Verificando se o email retirado do header correnponde ao email_organizador da tabela festa
     */
    if (festa.email_organizador !== email) {
      /**
       * Retornando uma reposta de erro caso o email do header não seja igual ao email_organizador da tabela festa
       */
      return response.status(401).json({ error: "Operação não permitida!" });
    }

    /**
     * Deletando da tabela localizacao_festa a linha que o festa_id for igual ao id da URL
     */
    await connection("localizacao_festa").where("festa_id", id).delete();
    /**
     * Deletando da tabela festa a linha que tenha o id igual ao id da URL
     */
    await connection("files_festa").where("key", file.key).delete();

    await promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "temp", "uploads", file.key)
    );

    await connection("festa").where("id", id).delete();
    /**
     * Retornando uma reposta de sucesso
     */
    return response.status(200).send();
  },
};

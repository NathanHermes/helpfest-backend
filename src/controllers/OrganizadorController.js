/**
 * Import das ferramentas/funções necessárias
 */
const connection = require("../database/connection");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

/**   Função que esporta as funções do CRUD   */
module.exports = {
  /**   Index: responsavel por pesquisar as informações de todos os organizadores.    */
  async index(request, response) {
    /**   organizadores: responsavel por armazenar as irformações dos organizadores    */
    const organizadores = await connection("organizador")
      .join(
        "localizacao_organizador",
        "organizador.email",
        "localizacao_organizador.email_organizador"
      )
      .select([
        "organizador.*",
        "localizacao_organizador.rua",
        "localizacao_organizador.numero",
        "localizacao_organizador.cidade",
        "localizacao_organizador.uf",
      ]);

    /**   retornando a variavel organizadores   */
    return response.json(organizadores);
  },

  /**   Search: responsavel por pesquisar as informações de um organizador específico  */
  async search(request, response) {
    /**   email: reponsavel por armazenar o email enviado pelo header da requisição HTTP   */
    const email = request.headers.authorization;

    /**   organizador: responsavel por armazenar as informações do organizador pesquisado   */
    const organizador = await connection("organizador")
      .join(
        "localizacao_organizador",
        "organizador.email",
        "localizacao_organizador.email_organizador"
      )
      .where("email", email)
      .select([
        "organizador.*",
        "localizacao_organizador.rua",
        "localizacao_organizador.numero",
        "localizacao_organizador.cidade",
        "localizacao_organizador.uf",
      ]);

    /**   files_organizador: responsavel por armazenar as informações da imagem do perfil do organizador pesquisado   */
    const files_organizador = await connection("files_organizador")
      .where("email_organizador", email)
      .select("*");

    /**   retorna um orbjeto que contém as variaveis organizador e files_organizador    */
    return response.json({
      organizador: organizador,
      files_organizador: files_organizador,
    });
  },

  /**   Create: responsavel por inserir no banco um novo organizador   */
  async create(request, response) {
    /**   desconstrução do objeto enviado pelo body da requisição HTTP   */
    const {
      nome,
      cnpj,
      email,
      telefone,
      whatsapp,
      rua,
      numero,
      cidade,
      uf,
      password,
    } = request.body;

    /**   organizador: responsavel por armazenar o email do organizador pesquisado  */
    const organizador = await connection("organizador")
      .where("email", email)
      .select("*")
      .first();

    /**   verifica se a variavel organizador tem alguem valor   */
    if (organizador) {
      /**   retorna um status 400 e uma mensagem de erro    */
      return response.status(400).json({
        error:
          "Esse email está sendo utilizado por outra instituição\n Tente novamente com um email diferente.",
      });
    }

    /**   salt: responsavel por armazanar o segredo da criptografia
     *    senha: reponsavel por armazanar a senha criptografada   */
    const salt = bcrypt.genSaltSync(10);
    const senha = bcrypt.hashSync(password, salt);

    /**   função assincrona responsavel por inserir as informações do organizador na tabela organizadores    */
    await connection("organizador").insert({
      email,
      nome,
      cnpj,
      telefone,
      whatsapp,
      senha,
    });

    /**   função assincrona responsavel por inserir as informações da localizacao do organizador na tabela
     *    localizacao_organizadores    */
    await connection("localizacao_organizador").insert({
      rua,
      numero,
      cidade,
      uf,
      email_organizador: email,
    });

    /**   função assincrona responsavel por inserir as informações de uma foto genérica na tabela files_organizador   */
    await connection("files_organizador").insert({
      nome: "user-icon",
      size: "3,12KB",
      url: "https://i.imgur.com/WU6GE9a.png",
      email_organizador: email,
      key: "user-icon",
    });

    /**   retorna um status 200 e uma mensagem de sucesso   */
    return response.status(200).json("Cadastro realizado com sucesso!");
  },

  /**   Update: responsavel por modificar um organizador   */
  async update(request, response) {
    /**   desconstrução do objeto enviado pelo body da requisição HTTP   */
    const {
      nome,
      cnpj,
      telefone,
      whatsapp,
      senha,
      rua,
      numero,
      cidade,
      uf,
      imgurURL
    } = request.body;

    /**   email: reponsavel por armazenar o email enviado pelo header da requisição HTTP   */
    const email = request.headers.authorization;

    /**   função assincrona responsavel por modificar informações na tabela organizador   */
    await connection("organizador")
      .update({
        nome,
        cnpj,
        telefone,
        whatsapp,
        senha,
      })
      .where("email", email);

    /**   CASO O TELEFONE E/OU O WHATSAPP SEJA ALTERADO
     *    função assincrona responsavel por modificar o telefone e/ou o whatsapp na tabela festa    */
    await connection("festa")
      .update({
        telefone,
        whatsapp,
      })
      .where("email_organizador", email);

    /**   função assincrona responsavel por modificar as informações da tabela localizacao_organizador  */
    await connection("localizacao_organizador")
      .update({
        rua,
        numero,
        cidade,
        uf,
      })
      .where("email_organizador", email);

    /**   verifica se existe algum file sendo enviado pela requisição HTTP   */
    if (request.file !== undefined) {
      /**   desconstrução do objeto enviado pelo file da requisição HTTP   */
      const { originalname: nome, size, filename: key } = request.file;

      /**   url: responsavel por concatenar a variavel key a url e armazanar essa url da imagem/file   */
      var url = imgurURL;

      if(imgurURL === "undefined") {  
        url = `http://26.134.180.105:3333/files/${key}`;
      }

      /**   file_organizador: responsavel por armazenar a key pesquisada     */
      const file_organizador = await connection("files_organizador")
        .where("email_organizador", email)
        .select("key");

      /**   verifica se a key é diferente de user-icon   */
      if (file_organizador[0].key !== "user-icon") {
        /**   função assincrona que deleta da pasta backend/temp/uploads o arquivo que possui a key   */
        await promisify(fs.unlink)(
          path.resolve(
            __dirname,
            "..",
            "..",
            "temp",
            "uploads",
            file_organizador[0].key
          )
        );
      }
      /**   função assincrona responsavel por modificar as informações da tabela files_organizador    */
      await connection("files_organizador")
        .update({
          nome,
          size,
          url,
          key,
        })
        .where("email_organizador", email);
    }

    /**   retorna um status 200 e uma mensagem de sucesso    */
    return response.status(200).json("Edição realizada com sucesso!");
  },

  /**     */
  async delete(request, response) {
    /**   email: reponsavel por armazenar o email enviado pelo header da requisição HTTP   */
    const email = request.headers.authorization;

    /**
     * Deletando as informações da tabela localizacao_organizador que tem o email como Foreign Key
     */
    await connection("localizacao_organizador")
      .where("email_organizador", email)
      .delete();

    const festas = await connection("festa")
      .where("email_organizador", email)
      .select("id");

    for (var [id_key, id] of Object.entries(festas)) {
      await connection("localizacao_festa").where("festa_id", id.id).delete();

      const files_festa = await connection("files_festa")
        .where("festa_id", id.id)
        .select("key");

      for (var [key, value] of Object.entries(files_festa)) {
        await promisify(fs.unlink)(
          path.resolve(__dirname, "..", "..", "temp", "uploads", value.key)
        );
      }

      await connection("files_festa").where("festa_id", id.id).delete();

      await connection("festa").where("id", id.id).delete();
    }

    const file_organizador = await connection("files_organizador")
      .where("email_organizador", email)
      .select("key");

    if (file_organizador[0].key !== "user-icon") {
      await promisify(fs.unlink)(
        path.resolve(
          __dirname,
          "..",
          "..",
          "temp",
          "uploads",
          file_organizador[0].key
        )
      );
    }

    await connection("files_organizador")
      .where("email_organizador", email)
      .delete();
    /**
     * Deletando as informações do organizador da tabela organizador que possui o email como Primary Key
     */
    await connection("organizador").where("email", email).delete();

    /**
     * Retornando resposta de sucesso
     */
    return response.status(200).send();
  },
};

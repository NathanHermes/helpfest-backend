/**
 * Importando a biblioteca do express.
 *
 * Importando o controller de orgainazador
 * Importando o controller de festa
 *
 * Importando o controller de festas específicas para um organizador
 * Importando o controller de sessão
 */
const express = require("express");
const OrganizadorController = require("./controllers/OrganizadorController");
const FestaController = require("./controllers/FestaController");
const ProfileController = require("./controllers/ProfileController");
const SessionController = require("./controllers/SessionController");
const multer = require("multer");
const multerConfig = require("./config/multer");

/**
 * Iniciando o arquivo de rotas com express
 */
const routes = express.Router();

/**
 * Criando uma sessão na página
 */
routes.post("/session/create", SessionController.create);

/**
 * CRUD do organizador
 */
routes.get("/organizador/index", OrganizadorController.index);
routes.get("/organizador/search", OrganizadorController.search);
routes.post("/organizador/create", OrganizadorController.create);
routes.put("/organizador/update", multer(multerConfig).single("file"),  OrganizadorController.update);
routes.delete("/organizador/delete", OrganizadorController.delete);

/**
 * Listando as festas específicas de cada organizador
 */
routes.get("/festas/index", ProfileController.index);
routes.get("/festas/search/:id", ProfileController.search);
/**
 * Crud das festas
 */
routes.get("/festa/index", FestaController.index);
routes.post("/festa/create", multer(multerConfig).single("file"), FestaController.create);
routes.put("/festa/update/:id", multer(multerConfig).single("file"),  FestaController.update);
routes.delete("/festa/delete/:id", FestaController.delete);

/**
 * Exportando a fonção de rotas para ser acessada por outros arquivos
 */
module.exports = routes;

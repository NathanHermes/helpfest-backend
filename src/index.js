/**
 * Importando o modulo do express
 */
const express = require('express');

const morgan = require('morgan');
const path = require('path');

/**
 * Importanto o pacote do cors
 */
const cors = require('cors');

/**
 * Importando as rotas do arquivo de rotas
 */
const routes = require('./routes');

/**
 * Iniciando a aplicação com o express
 */
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/files', express.static(path.resolve(__dirname, '..', 'temp', 'uploads')));

app.use(routes);

/**
 * App ouvindo a porta do servidor que será aberta
 */
app.listen(3333);

/**
 * Entidades
 * 
 *  => organizer / company 
 *  => party
 *  => cliente
 * 
 * Funcionalidade
 * 
 *  => Login (empresa & cliente)
 *  => Lougout (empresa & cliente)
 *  => Cadastro (empresa & cliente)
 *  => Alterar info da empresa e do cliente
 * 
 *  => Cadastro de festas (empresa)
 *  => Deletar festas (empresa)
 *  => Listar festas especificas de uma empresa
 *  => Listar todos as festas
 */
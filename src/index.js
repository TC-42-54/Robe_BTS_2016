module.exports = function(dir) {
  require('./lib')();
  require('./modules')(dir);
  require('../extends')();
  require('../db')();
  this.app = require('./app');
  this.server = http.Server(this.app);
  this.WebSocketServer = require('ws').Server;
  //NOUS PRÉPARONS LA BASE DE DONNÉES
  this.db = mysql.createConnection(dbParams);
  this.db.query = bBPromises.promisify(this.db.query);
  //ET LES TABLES ('composants', 'actions')
  this.Components = {};
  this.Actions = {};
}

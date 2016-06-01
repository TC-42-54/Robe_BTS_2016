module.exports = function() {
  require("./Object")();
  require("./String")();
  this.Table = require("./Table")();
  this.Content = require("./Content")();
  this.Msg = require('./Message')();
}

//LOADING ALL
module.exports = function(dirname) {
	this.http = require('http');
	this.bBPromises = require('bluebird');
	this.fs = require('fs-extra');
	this.util = require('util');
  this.promise = require('promise');
  this.express = require('express');
	//module SQL
	this.mysql = require('mysql');
	//
	this.appPath = dirname;
  this.compPath = this.appPath + "/public/python/";
  this.synthPath = this.appPath + "/public/python/Synthese.py";
	this.uId = process.getuid();
	this.chariot = { reg : /\n/g, by : '<br />' };
}

//EXEMPLE D'UTILISATION DE LA METHODE "FIND"
/*Components.find({}).then(result => {
  if (result) {
    log(result);
  }
}).catch(err => {
  log(err);
});*/

//CONVERSION D'UNE QUERY SQL VERS LA METHODE "ADDNEWROW"
/*INSERT INTO `robe`.`composants`
(`id`, `nom`, `gpio`, `io`, `type`, `init_reg`, `init_val`, `read_reg`, `formule`, `unite`)
VALUES ('1', 'ruban led', '18', 'out', 'tor', '', '', '', '', '')*/

function Table(name, sentDB) {
  var name = name;
  var DB = sentDB;
  //FONCTION QUI RENVOIE NOTRE BASE DE DONNÉES
  this.getDB = () => {
    return (DB);
  };
  //FONCTION QUI RENVOIE NOTRE NOM DE TABLE
  this.getName = () => {
    return (name);
  }
}

//FONCTION QUI RETOURNE LES RESULTATS D'UNE RECHERCHE SOUS FORME DE PROMESSE
Table.prototype.find = function(args) {
  var query = "SELECT * FROM " + this.getName();
  var multiple = false;
  var _ = this;
  return (new Promise((res, rej) => {
    if (_.isConnected()) {
      if ((typeof args === "object") && (args.count() > 0)) {
        query += " WHERE";
        for (attr in args) {
          if (!multiple) {
            if (typeof args[attr] === "string") {
              query += " " + attr + "=" + "'" + args[attr].replace("\'", "\\\'") + "'";
            } else {
              query += " " + attr + "=" + "'" + args[attr] + "'";
            }
          } else {
            if (typeof args[attr] === "string") {
              query += " AND " + attr + "=" + "'" + args[attr].replace("\'", "\\\'") + "'";
            } else {
              query += " AND " + attr + "=" + "'" + args[attr] + "'";
            }
          }
          multiple = true;
        }
        log(query);
      } else if ((typeof args !== "undefined") && (typeof args !== "object")) {
        log("Les arguments envoyés doivent être contenus dans un objet");
        rej("Les arguments doivent être contenus dans un objet");
      }
      _.getDB().query(query)
      .then(results => {
        if ((typeof results !== "undefined") && (results.length > 0)) {
          if (results.length == 1) {
            res(results);
          } else {
            res(results);
          }
        } else {
          log("Aucun resultat n'a été trouvé.");
          res(false);
        }
      }).catch(err => {
        if (typeof err !== "undefined") {
          log("Erreur lors de la requête.");
          log(err);
          rej(err);
        }
      });
    }
  }));
}

//METHODE QUI AJOUTE UN ELEMENT NOUVEAU A UNE TABLE SOUS FORME DE PROMESSE
Table.prototype.addNewRow = function(args, showQuery) {
  var query = "INSERT INTO " + this.getName() + " (";
  var values = " VALUES ("
  var _ = this;
  var ctr = 0;
  return (new Promise((res, rej) => {
    if (_.isConnected()) {
      if (typeof args === "object") {
        _.getFields()
        .then(fields => {
          if (fields) {
            fields.map(field => {
              query += field;
              if (typeof args[field] !== "undefined") {
                if (typeof args[field] === "string") {
                  values += "\'" + args[field].replace("\'", "\\\'") + "\'";
                } else {
                  values += "\'" + args[field] + "\'";
                }
              } else {
                values += "\'\'";
              }
              ctr++;
              if (typeof fields[ctr] === "undefined") {
                query += ") ";
                values += ") ";
                query += values;
              } else {
                query += ", ";
                values += ", ";
              }
            });
            if ((typeof showQuery === "boolean") && (showQuery)) {
              log(query);
            }
            _.getDB().query(query)
            .then(results => {
              if (typeof results !== "undefined") {
                log(typeof results);
                res(results);
              }
            }).catch(err => {
              if (typeof err !== "undefined")
                rej(err);
            });
          } else {
            rej("Aucun champs n'a été retourné.");
          }
        }).catch(err => {
          rej(err);
        });
      }
    } else {
      rej("Non connecté à une base de données.");
    }
  }));
};

//FONCTION QUI RETOURNE LES CHAMPS DE LA TABLE SOUS FORME DE PROMESSE
Table.prototype.getFields = function() {
  var fields;
  var _ = this;
  return (new Promise((res, rej) => {
    if (_.isConnected()) {
      _.getDB().query("SHOW COLUMNS FROM " + _.getName())
      .then(results => {
        if ((typeof results !== "undefined") && (results.length > 0)) {
          fields = results.map(e => {
            return (e.Field);
          });
          res(fields);
        } else {
          res(false);
        }
      }).catch(err => {
        if (typeof err !== "undefined") {
          rej(err);
        }
      });
    } else {
      rej("Non connecté à une base de données.");
    }
  }));
}

//Cette méthode sert à supprimer un/des élément(s)
Table.prototype.deleteRow = function(args) {
  var _ = this;
  var query = "DELETE FROM " + _.getName() + " WHERE ";
  var count = 0;
  return (new Promise((res, rej) => {
    if (_.isConnected()) {
      if ((typeof args === "object") && (args.count() > 0)) {
        _.getFields()
        .then(fields => {
          if (fields) {
            fields.map(field => {
              if (typeof args[field] !== "undefined") {
                if (count > 0) {
                  query += " AND ";
                }
                if (typeof args[field] === "string") {
                  query += field + "='" + args[field].replace("\'", "\\\'") + "'";
                } else {
                  query += field + "='" + args[field] + "'";
                }
                count++;
              }
            });
            log(query);
            _.getDB().query(query)
            .then(results => {
              if (results) {
                res((results.affectedRows > 0));
              } else {
                res(false);
              }
            }).catch(err => {
              rej(err);
            });
          }
        }).catch(err => {
          if (err) {
            log(err);
          }
        });
      } else {
        rej("Pas d'arguments envoyés.");
      }
    } else {
      rej("Vous n'êtes pas connecté à une base de données.");
    }
  }));
}

//Cette methode sert à savoir si vous êtes bien connecté à une base de données
Table.prototype.isConnected = function() {
  var DB = this.getDB();
  if ((DB) && (typeof DB !== "undefined")) {
    if (DB.state === "authenticated") {
      return (true);
    } else {
      return (false);
    }
  } else {
    return (false);
  }
}

module.exports = function () {
  return (Table);
}



/*
//comment utiliser les différentes méthodes :
var votreTableSQL = new Table("table_name", votreDB);

//exemple avec find (tout récupérer) :
votreTableSQL.find()
.then(results => { //si pas d'erreur lors de la requete...
  //et que la requete est effectuée
  if (results) { //on verifie que l'on a un/des resultat(s)
    log(results); // on affiche le resultat
  } else { //sinon on affiche sur le serveur que la requete n'a rien renvoyé
    log("Pas de resultats lors de la requete");
  }
}).catch(err => { // si il y a des erreurs
  if (err) { // on vérifie que la variable d'erreur envoyée n'est pas vide
    log(err); //si elle ne l'est pas...
    //nous l'affichons afin de savoir la nature de l'erreur
  }
});

//exemple avec find (on cherche un element dont l'id est égal à '1') :
votreTableSQL.find({ id : 1})
.then(results => { //si pas d'erreur lors de la requete...
  //et que la requete est effectuée
  if (results) { //on verifie que l'on a un resultat
    log(results); // on affiche le resultat
  } else { //sinon on affiche sur le serveur que la requete n'a rien renvoyé
    log("Pas de resultats lors de la requete");
  }
}).catch(err => { // si il y a des erreurs
  if (err) { // on vérifie que la variable d'erreur envoyée n'est pas vide
    log(err); //si elle ne l'est pas...
    //nous l'affichons afin de savoir la nature de l'erreur
  }
});


//exemple avec "deleteRow" (on supprime un element dont l'id est égal à '1') :
votreTableSQL.deleteRow({ id : 1 })
.then(res => {
  if (res) {
    log("res");
    log(res);
  } else {
    log("Aucun element supprimé");
  }
}).catch(err => {
  if (err) {
    log(err);
  }
});

//exemple avec "addNewRow" :
//SYNTAXE A UTILISER POUR AJOUTER UN ELEMENT A UNE TABLE
Components.addNewRow({nom : "ruban led", gpio : "18", io : "out", type : "tor" })
.then(results => { //si pas d'erreur lors de la requete...
  //et que la requete est effectuée
  if (results) { //on verifie que l'on a bien ajouté l'élément
    log(results); // on affiche la réponse
  } else { //sinon on affiche qu'aucun element n'a été ajouté
    log("Pas de resultats lors de la requete");
  }
}).catch(err => {
  log(err);
})
*/

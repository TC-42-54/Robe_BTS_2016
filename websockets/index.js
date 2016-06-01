module.exports = function(server) {
  var ws = new WebSocketServer({ server : server });
  var compError = "Erreur lors de la recherche dans la table composants";
  var Signals = {};

  ws.on('connection', function(s) {
    log("new connected client");
    s.on('message', function(sent) {
      var sent = sent.toJSON();
      Signals[sent.signal](s, sent.data);
    });
  });

  Signals.compName = (s, name) => {
    Components.find({ nom : name })
    .then(results => {
      if (results) {
        var data = Msg("compNameResp", { b : false, name : name });
      } else {
        var data = Msg("compNameResp", { b : true, name : name });
      }
      s.send(data);
    }).catch(err => {
      var data = Msg("compNameResp", { b : false,
        name : name,
        error : compError });
      s.send(data);
    });
  };

  Signals.addrUsed = (s, addr) => {
    var data;
    if (typeof addr === "object") {
      if (updating) {
        Components.find(addr)
        .then(results => {
          if ((results) && (results.length == 1)) {
            if (results[0].nom === addr.nom) {
              data = Msg("addrResp", { b : true, addr : addr });
            } else {
              data = Msg("addrResp", { b : false, addr : addr });
            }
          } else if (!results) {
            data = Msg("addrResp", { b : true, addr : addr });
          } else if ((results) && (results.length > 1)) {
            data = Msg("addrResp", { b : false, addr : addr });
          }
          s.send(data);
        }).catch(err => {
          if (err) {
            data = Msg("addrResp", { b : false, addr : addr, error : compError });
            s.send(data);
          }
        });
      }
    } else {
      Components.find({ gpio : addr })
      .then(results => {
        if (results) {
          data = Msg("addrResp", { b : false, addr : addr });
        } else {
          data = Msg("addrResp", { b : true, addr : addr });
        }
        s.send(data);
      }).catch(err => {
        if (err) {
          data = Msg("addrResp", { b : false, addr : addr, error : compError });
          s.send(data);
        }
      });
    }
  };

  Signals.compBeforeSave = (s, toTest) => {
    var resp = {};
    if (toTest.updating) {
      Components.find({ gpio : toTest.gpio })
      .then(results => {
        resp.updating = true;
        if (results) {
          resp.vAddr = false;
        } else {
          resp.vAddr = true;
        }
        s.send(Msg("saveComp", resp));
      });
    } else {
      var tab = [Components.find({ nom : toTest.nom }), Components.find({ gpio : toTest.gpio })];
      bBPromises.all(tab).then(results => {
        if (results) {
          log(results);
          if (results[0]) {
            resp.vName = false;
          } else {
            resp.vName = true;
          }
          if (results[1]) {
            resp.vAddr = false;
          } else {
            resp.vAddr = true;
          }
          resp.updating = false;
          s.send(Msg("saveComp", resp));
        }
      });
    }
  };

  Signals.saveComp = (s, save) => {
    Components.addNewRow(save)
    .then(results => {
      if (results.affectedRows == 1) {
        log(results.affectedRows);
        Components.find({ nom : save.nom, gpio : save.gpio })
        .then(found => {
          if ((found) && (found.length == 1)) {
            Components.createClass()
            .then((finished) => {
              if (finished) {
                s.send(Msg("compSaved", { name : save.nom, id : found[0].id, saved : true }));
              } else {
                Components.deleteRow(found[0])
                .then(results => {
                  if (results) {
                    log(results);
                    s.send(Msg("compSaved", { name : save.nom, saved : false }));
                  }
                }).catch(err => {
                  log(err);
                  s.send(Msg("compSaved", { name : save.nom, saved : false }));
                });
              }
            }).catch(err => {
              if (err) {
                log(err);
                Components.deleteRow(found[0])
                .then(results => {
                  if (results) {
                    log(results);
                    s.send(Msg("compSaved", { name : save.nom, saved : false }));
                  }
                }).catch(err => {
                  log(err);
                  s.send(Msg("compSaved", { name : save.nom, saved : false }));
                });
              }
            });
          }
        });
      } else if (results.affectedRows == 0) {
        s.send(Msg("compSaved", { name : save.nom, saved : false }));
      }
    });
  };

  Signals.updateComp = (s, update) => {
    Components.addNewRow(update, true)
    .then(results => {
      if (results) {
        log(results);
        s.send(Msg("compSaved"), { name : save.nom, saved : true });
      } else {
        s.send(Msg("compSaved"), { name : save.nom, saved : false });
      }
    });
  };

  Signals.loadComp = (s, toLoad) => {
    Components.find(toLoad)
    .then(results => {
      if ((results) && (results.length == 1)) {
        results[0].loaded = true;
        s.send(Msg("loadedComp", results[0]));
      }
    }).catch(err => {
      if (err) {
        toLoad.loaded = false;
        s.send(Msg("loadedComp", toLoad));
      }
    })
  };

  Signals.deleteComp = (s, data) => {
    if ((data.id) && (!isNaN(data.id))) {
      Components.deleteRow({ id : data.id })
      .then(returned => {
        if (returned) {
            s.send(Msg("deletedComp", { name : data.name,  deleted : true }));
        }
      }).catch(err => {
        log(err);
        s.send(Msg("deletedComp", { name : data.name, deleted : false }));
      });
    }
  };

  Signals.deleteSynthese = (s, data) => {
    log(data);
    if ((data.id) && (!isNaN(data.id))) {
      Actions.deleteRow({ id : data.id, type : "synthese" })
      .then(returned => {
        if (returned) {
            s.send(Msg("deletedSynthese", { name : data.name,  deleted : true }));
        }
      }).catch(err => {
        log(err);
        s.send(Msg("deletedSynthese", { name : data.name, deleted : false }));
      });
    }
  };

  Signals.actionName = (s, name) => {
    Actions.find({ nomAction : name })
    .then(results => {
      if (results) {
        s.send(Msg("freeActionName", { vName : false, nomAction : name }));
      } else {
        s.send(Msg("freeActionName", { vName : true, nomAction : name }));
      }
    }).catch(err => {
      if (err) {
        log(err);
        s.send(Msg("freeActionName", { vName : false, nomAction : name }));
      }
    });
  };

  Signals.saveSynthese = (s, data) => {
    data.type = "synthese";
    log(data);
    Actions.addNewRow(data, true)
    .then(returned => {
      if (returned.affectedRows == 1) {
        Actions.find(data)
        .then(results => {
          if ((results) && (results.length == 1)) {
            s.send(Msg("addedSynthese", { saved : true, nomAction : data.nomAction, id : results[0].id }));
          } else {
            s.send(Msg("addedSynthese", { saved : false, nomAction : data.nomAction }));
          }
        }).catch(err => {
          if (err) {
            log(err);
            Actions.deleteRow(data)
            .then(results => {
              if (results.affectedRows == 1) {
                s.send(Msg("addedSynthese", { saved : false, nomAction : data.nomAction }));
              }
            }).catch(err => {
              if (err) {
                s.send(Msg("addedSynthese", { saved : false, nomAction : data.nomAction }));
              }
            });
          }
        });
      } else {
        s.send(Msg("addedSynthese", { saved : false, nomAction : data.nomAction }));
      }
    }).catch(err => {
      if (err) {
        log(err);
        s.send(Msg("addedSynthese", { saved : false, nomAction : data.nomAction }));
      }
    });
  };
}

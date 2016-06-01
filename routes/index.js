module.exports = function(app) {
  app.get('/', (req, res) => {
    var content = new Content("home", { title : "Accueil" });
    loadTemplate(req, res, content);
  });
  app.get('/composants', (req, res) => {
    var content = new Content("addComponents", { title : "Ajouter des composants" });
    Components.find()
    .then(components => {
      if (components) {
        content.data.components = components.map(e => {
          return ({
            id : e.id,
            nom : e.nom
          });
        });
      }
      loadTemplate(req, res, content);
    }).catch(err => {
      if (err) {
        log(err);
        content.block = "home";
        content.data.title = "Accueil";
        loadTemplate(req, res, content, { action : "errorMessage", message : err });
      }
    });
  });

  app.get('/synthese', (req, res) => {
    var content = new Content("addSynthese", { title : "Ajouter Synthèses vocales" });
    Actions.find({ type : "synthese" })
    .then(results => {
      if (results) {
        content.data.synthese = results.map(e => {
          return ({
            id : e.id,
            nom : e.nomAction
          });
        });
      }
      loadTemplate(req, res, content);
    }).catch(err => {
      if (err) {
        log(err);
        content.block = "home";
        content.data.title = "Accueil";
        loadTemplate(req, res, content, { action : "errorMessage", message : err });
      }
    });
  });
}

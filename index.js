require('./src')(__dirname);
require('./routes')(app);

if (getOS() !== "windows") {
	if (uId != 0) {
		log("Vous avez lancé cette application sans privilèges");
	} else if (uId == 0) {
		log("Vous avez lancé cette application en tant que root");
	}
}
db.connect(function(err) {
  if (err) {
    log(err);
    switch(err.code) {
      case 'ECONNREFUSED':
        log("La connexion à la base de donnée à été refusée.");
        break;
      default:
        log(err);
        break;
    }
    process.exit(-1);
  } else {
    var date = new Date();
    var hr = date.getHours();
    var min = date.getMinutes();
    if (hr < 10) {
      hr = '0' + hr;
    }
    if (min < 10) {
      min = '0' + min;
    }
    var time = hr + ":" + min;
    Components = new Table("composants", db);
    Components.createClass = createComponentClass;
    Actions = new Table("actions", db);
    log("/----------------------------\\");
    log("| Connecté au serveur MYSQL !|");
    log("|                            |");
    log("|           " + time + "            |");
    log("|                            |");
    log("\\----------------------------/");
    server.listen(app.get('port'), () => {
      log("LE SERVEUR ÉCOUTE SUR LE PORT " + app.get('port'));
      require('./websockets')(server);
    });
  }
});

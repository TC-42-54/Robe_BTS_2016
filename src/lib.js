module.exports = function() {
  this.getOS = () => {
    var os = process.platform;
    log("PLATFORM OS : " + os);
    if ((os === "linux2") || (os === "linux"))
      return ("linux");
    else if (os === "darwin")
      return ("mac");
    else {
      return ("windows");
    }
  };
  this.log = (msg) => {
    console.log(msg);
  };
  this.loadTemplate = (req, res, content, addData) => {
    if ((addData) && (typeof addData === "object")) {
      content.data.additionnalData = addData;
    } else if ((typeof addData !== "object") && addData) {
	     log("your additional data must be an object with a field \"action\" and \"message\".");
     }
     res.layout('layout', { title : content.data.title }, { content : content });
  };
  this.createComponentFile = () => {
    var newClass = "import smbus, time\nimport RPI.GPIO as GPIO\n\n";
    return (new Promise((res, rej) => {
      Components.find()
      .then(results => {
        if (results) {
          results.map(result => {
            var adrComp = "self.adr" + result.nom.substring(0, 3).toLowerCase();
            newClass += fs.readFileSync(compPath + "/tmp/C_" + adrComp + ".tmp").toString();
          });
          try{
            fs.writeFileSync(compPath + "Composants.py", newClass, { encoding : 'utf8', flag : 'a' });
          } catch(e) {
            if (e) {
              rej(e);
            }
          }
          res(true);
        } else {
          res(false);
        }
      }).catch(err => {
        rej(err);
      });
    }));
  }
  this.createComponentClass = () => {
    var newClass = "import smbus, time\nimport RPI.GPIO as GPIO\n\n";
    return (new Promise((res, rej) => {
      // on renvoie une promesse dont le contenu sera le résultat de la création
      // des classes pour tous les composants
      try { //suppression du fichier contenant les classes des composants
        fs.unlinkSync(compPath + "Composants.py");
      } catch(e) { // une erreur peut survenir si le fichier n'existe pas
        log("Erreur lors de la suppression du fichier Composant.py : " + e);
      }
      Components.find() // nous récupérons tous les composant dans la table
      .then(results => {
        if (results) {
          results.map(obj => {
            //création d'une classe personalisée pour chaque composant
            var newClass;
            var adrComp = "self.adr" + obj.nom.substring(0, 3).toLowerCase();
            try { //suppression du fichier contenant les classes des composants
              fs.unlinkSync(compPath + "/tmp/C_" + adrComp + ".tmp");
            } catch(e) { // une erreur peut survenir si le fichier n'existe pas
              log("Erreur lors de la suppression du fichier  : " + e);
            }
            if (obj.gpio.indexOf("0x") == -1) { //si le composant n'est pas un I2C
              newClass = "class C_" + obj.nom.replace(" ", "_") + "():\n"; //nom de classe
              newClass += "  def __init__(self, addr):\n"; //initialisation de l'objet
              newClass += "    GPIO.setmode(GPIO.BOARD)\n";
              newClass += "    " + adrComp + " = addr\n";
              newClass += "    GPIO.setup(adrComp, GPIO." + obj.io.toUpperCase() + ", initial=GPIO.LOW)\n";
              newClass += "  def setState(self):\n";
              newClass += "    GPIO.output(" + adrComp + ", not GPIO.input(" + adrComp + "))\n";
              newClass += "  def getState(self):\n";
              newClass += "    return(GPIO.input(" + adrComp + "))\n\n";
            } else { //sinon...
              newClass = "class C_" + obj.nom.replace(" ", "_") + "():\n";
              newClass += "  def __init__(self, addr, bus):\n";
              newClass += "    nbus = bus\n";
              newClass += "    " + adrComp + " = addr\n";
              newClass += "    self.bus = smbus.SMBus(nbus)\n";
              if ((typeof obj.init_val !== "undefined") && (obj.init_val != "")) { // valeur d'initialisation
                newClass += "    self.init_val = " + obj.init_val + "\n";
              }
              if ((typeof obj.init_reg !== "undefined") && (obj.init_reg != "")) { // registre d'initialisation
                newClass += "  def setCompos(self):\n";
                newClass += "    self.bus.write_byte_data(" + adrComp + ", " + obj.init_reg + ", self.init_val)\n";
              }
              if ((typeof obj.read_reg !== "undefined") && (obj.read_reg != "")) { // registre de lecture
                newClass += "  def getValeurs(self):\n";
                newClass += "    self.setCompos()\n";
                newClass += "    dst = self.bus.read_word_data(" + adrComp + ", " + obj.read_reg + ")";
                if ((obj.formule) && (obj.formule != "")) {
                  newClass += " " + obj.formule;
                }
                newClass += "\n    return(dst)\n\n";
              }
            }
            fs.writeFile(compPath + "/tmp/C_" + adrComp + ".tmp", newClass, { encoding : 'utf8', flag : 'wx' }, (err) => {
              if (err) {
                log(err);
                rej(false);
              }
            });
          });
          createComponentFile()
          .then(ret => {
            if (ret) {
              res(true);
            } else {
              res(false);
            }
          }).catch(err => {
            if (err) {
              rej(err);
            }
          });
        } else {
          res(false);
        }
      }).catch(err => {
        if (err) {
          log(err);
          rej(err);
        }
      });
    }));
  };
  this.createSynthesisClass = () => {
    var newClass = "import os\n\n";
    try { //suppression du fichier contenant les classes des composants
      fs.unlinkSync(synthPath);
    } catch(e) { // une erreur peut survenir si le fichier n'existe pas
      log("Erreur lors de la suppression du fichier Composant.py : " + e);
    }
    return (new Promise((res, rej) => {
      Actions.find({ type : "synthese" })
      .then(results => {
        if (results) {
          results.map(synth => {
            newClass += "class S_" + synth.nomAction.toLowerCase() + "():\n"
            newClass += "  def __init__(self):\n";
            newClass += "    self.phrase = " + "\"" + synth.synthese_texte + "\"" + "\n";
            newClass += "    self.commande = \"espeak -vfr -tts\"\n";
            newClass += "  def getCommande(self):\n";
            newClass += "    return(self.commande)\n";
            newClass += "  def getPhrase(self):\n";
            newClass += "    return(self.phrase)\n";
            newClass += "  def play(self):\n";
            newClass += "    os.system(self.getCommande() + self.getPhrase())\n\n";
          });
          fs.writeFile(synthPath, newClass, { encoding : 'utf8', flag : 'wx' }, (err) => {
            if (err) {
              log(err);
              rej(false);
            } else {
              res(true);
            }
          });
        } else {
          res(false);
        }
      }).catch(err => {
        if (err) {
          rej(err);
        }
      });
    }));
  }
  this.isAlpha = (char) => {
    if (char.length != 1)
      return;
    var isAlpha = /^\[a-zA-Z]+$/;
    return (isAlpha.test(char));
  };
  this.isSpecialChar = (char) => {
    if (char.length != 1)
      return;
    return ((!isNaN(char)) && (!isAlpha));
  };
  this.replaceSpecialchars = (elem) => {
    if (typeof elem === "string") {
      var len = elem.length;
      for (var i = 0; i < len; i++) {
        if (isSpecialChar(elem[i])) {
          elem[i] = "\\" + elem[i];
        }
      }
      return (elem);
    } else {
      return (elem);
    }
  };
}

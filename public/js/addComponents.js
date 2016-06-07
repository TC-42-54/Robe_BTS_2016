var main = document.getElementById('main');
var jumbotron = document.getElementById('jumbotron');
var button = document.getElementById('but'); //le bouton qui va permettre
//d'envoyer les informations du formulaire
var updating = false; // cette variable sert à savoir si l'on met à jour un composant
var isI2C = false; // cette variable sert à savoir si notre composant est de type I2C
var isIn = false; //cette variable sert à savoir si notre composant est un récépteur
var vName = false; //cette variable sert à savoir si le nom de composant est libre
var vAddr = false; //cette variable sert à savoir si l'adresse de composant est libre
var create = document.getElementById("create"); //l'élément input pour créer un nouveau composant
var update = document.getElementById("update"); //L'élément select pour mettre à jour un composant
var address = document.getElementById("gpio"); //L'élément input où l'on insère l'adresse du pin ou i2c
var io = document.getElementById("io"); //L'élément select pour choisir le type de composant
var type = document.getElementById("type");
var i2c = document.getElementById("i2c");
var forIn = document.getElementById("forInput");
var init_reg = document.getElementById("init_reg");
var init_val = document.getElementById("init_val");
var read_reg = document.getElementById("read_reg");
var formule = document.getElementById("formule");
var unite = document.getElementById("unite");
var del = document.getElementById("delete");

var display = c => {
  compTab.getElementsByClassName(c).map(e => {
    var style = window.getComputedStyle(e).display;
    if (style === 'none') {
      e.style.display = "block";
    } else {
      e.style.display = "none";
    }
  });
};

var notIn = (slct, str) => {
  var ret = true;
  slct.options.map(e => {
    if (e.innerHTML === str) {
      ret = false;
    }
  });
  return (ret);
};


var verifyAddress = (evt, ret) => {
  var tmp = address.value;
  if (!address.checkLen(2, main)) {
    i2c.addClass("hide");
    isI2C = false;
    return;
  } else if (tmp.length == 4) {
    if (tmp.indexOf("0x") == -1) {
      isI2C = false;
      i2c.addClass("hide");
      main.errorMessage("Un composant dont l'adresse est égale à 4 caractère doit contenir en début d'addresse les caractères \"0x\".");
    } else {
      isI2C = true;
      i2c.removeClass("hide");
      if (typeof ret === "undefined") {
        var data = Msg("addrUsed", tmp);
        ws.send(data);
      } else {
        return (true);
      }
    }
  } else if (tmp.length == 2) {
    isI2C = false;
    i2c.addClass("hide");
    if (!isNaN(tmp)) {
      vAddr = true;
      if (typeof ret !== "undefined") {
        return (true);
      }
    } else {
      main.errorMessage("Si votre adresse ne contient que 2 caractères, elle ne doit contenir que des chiffres.");
    }
  } else {
    isI2C = false;
    i2c.addClass("hide");
    main.errorMessage("L'adresse de votre composant doit contenir soit 2 caractères soit 4 caractères.");
  }
  return (false);
};

var verifyName = (evt, ret) => {
  var tmp = create.value;
  if (create.checkLen(4, main)) {
    if (notIn(update, tmp)) {
      if (typeof ret === "undefined") {
        console.log("emitting");
        var data = Msg('compName', tmp);
        ws.send(data);
      } else {
        return (true);
      }
    } else {
      main.errorMessage("Un composant s'appelant " + tmp + " est déjà existant.");
    }
  }
  return (false);
};

var verifyIO = () => {
  tmp = io.value;
  tmp2 = type.value;
  if ((tmp === "in") && (tmp2 === "val")) {
    isIn = true;
    forIn.removeClass("hide");
  } else {
    isIn = false;
    forIn.addClass("hide");
  }
};

io.addEventListener("change", verifyIO);
type.addEventListener("change", verifyIO);

create.addEventListener("input", verifyName);

address.addEventListener("input", verifyAddress);



button.addEventListener("click", () => {
  var toTest = {};
  vName = verifyName(null, true);
  toTest.nom = create.value;
  if (updating) {
    toTest.nom = update.options[update.selectedIndex].innerHTML;
  }
  toTest.updating = updating;
  toTest.gpio = address.value;
  console.log(toTest);
  if (vName && vAddr) {
    ws.send(Msg("compBeforeSave", toTest));
  } else if (!updating) {
    verifyAddress();
    verifyName();
  } else if (updating) {
    if (verifyAddress(null, true)) {
      var data = Msg("updateComp", { gpio : address.value, nom : update.options[update.selectedIndex].innerHTML, updating : true });
      ws.send(data);
    }
  }
});

del.addEventListener("click", () => {
  if (update.value !== "") {
    ws.send(Msg("deleteComp", { id : update.value, name : update.options[update.selectedIndex].innerHTML }));
  } else {
    main.errorMessage("Veuillez sélectionner un composant pour le supprimer.");
  }
});

update.addEventListener("change", () => {
  if (update.value != "") {
    var selectedOption = update.options[update.selectedIndex];
    var toLoad = { _id : selectedOption.value, nom : selectedOption.innerHTML };
    console.log(toLoad);
    ws.send(Msg("loadComp", toLoad));
  }
});

document.getElementsByClassName("i2c").map(e => {
  if (e.nodeName === "INPUT") {
    if (e.addEventListener) {
      e.addEventListener("input", () => {
        e.checkLen(4, main, "0x");
      });
    }
  }
});


Signals.compNameResp = (socket, data) => {
  vName = true;
  if (data.b) {
    main.successMessage("Le nom de composant " + data.name + " est libre.");
  } else if ((!data.b) && (data.error)) {
    main.errorMessage(data.error)
  } else {
    main.errorMessage("Le nom de composant " + data.name + " est déjà utilisé.");
  }
};

Signals.addrResp = (socket, data) => {
  vAddr = data.b;
  if (data.b) {
    main.successMessage("L'adresse de composant " + data.addr + " est libre.");
  } else if ((!data.b) && (data.error)) {
    main.errorMessage(data.error)
  } else {
    main.errorMessage("L'adresse de composant " + data.addr + " est déjà utilisée.");
  }
}

Signals.saveComp = (socket, data) => {
  var toSave;
  updating = data.updating;
  vName = data.vName;
  vaddr = data.vaddr;
  console.log(data);
  if ((!updating) && (!vName)) {
    main.errorMessage("Votre nom de composant semble être déjà utilisé.");
    return;
  }
  if ((!vAddr) && (!updating)) {
    main.errorMessage("Votre addresse de composant n'est pas disponible.");
    return;
  }
  toSave = { nom : create.value, gpio : address.value, io : io.value, type : type.value };
  if (isI2C) {
    toSave["init_reg"] = init_reg.value;
    toSave["init_val"] = init_val.value;
    toSave["read_reg"] = read_reg.value;
  }
  if (isIn) {
    toSave.formule = formule.value;
    if (unite.value != "") {
      toSave.unite = unite.value;
    }
  }
  if (updating) {
    toSave.id = update.value;
    toSave.nom = update.options[update.selectedIndex];
    ws.send(Msg("updateComp", toSave));
  } else {
    ws.send(Msg("saveComp", toSave));
  }
};

Signals.compSaved = (s, data) => {
  console.log(data);
  if (data.saved) {
    var newOption = document.createElement("OPTION");
    newOption.value = data._id;
    newOption.innerHTML = data.name;
    update.add(newOption);
    main.successMessage("Le composant " + data.name + " à bien été enregistré.");
  } else {
    main.errorMessage("Le composant " + data.name + " n'as pas été enregistré.");
  }
}

Signals.loadedComp = (s, loadedData) => {
  if (!loadedData.loaded)
    return;
  updating = true;
  for (attr in loadedData) {
    var ctr = 0;
    var there = false;
    if ((attr !== "nom") && (attr !== "loaded") && (attr !== "_id")) {
      var elem = document.getElementById(attr);
      if (elem.nodeName === "INPUT") {
        elem.value = loadedData[attr];
      } else if (elem.nodeName === "SELECT") {
        elem.options.map(opt => {
          if (opt.value == loadedData[attr]) {
            elem.selectedIndex = ctr;
            there = true;
          }
          if (!there) {
              ctr++;
          }
        })
      }
    }
  }
  verifyIO();
  verifyAddress(null, true);
};

Signals.deletedComp = (s, data) => {
  updating = false;
  if (data.deleted) {
    main.successMessage("Votre Composant " + data.name + " à bien été supprimé.");
    update.remove(update.selectedIndex);
  } else {
    main.errorMessage("Votre composants " + data.name + " n'a pas été supprimé de la table.");
  }
}

window.addEventListener("load", function() {
  document.getElementById('jumbotron').style.height = (document.getElementById('form').scrollHeight + 150) + "px";
  document.getElementById('form').style.width = getComputedStyle(document.getElementById('form').parentElement).width;
});

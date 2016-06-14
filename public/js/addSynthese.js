var main = document.getElementById("main");
var jumb = document.getElementById("jumbotron");
var form = document.getElementById("form");
var alEx = document.getElementById("alreadyExisting");
var nomAction = document.getElementById("nomAction");
var synthese_texte = document.getElementById("synthese_texte");
var add = document.getElementById("add");
var del = document.getElementById("delete");
var vName = false;
var vSynth = false;

nomAction.addEventListener("input", () => {
  if (nomAction.checkLen(4, main)) {
    ws.send(Msg("actionName", nomAction.value));
  }
});

synthese_texte.addEventListener("input", () => {
  vSynth = synthese_texte.checkLen(4, main);
});

add.addEventListener("click", () => {
  if ((vName) && (vSynth)) {
    ws.send(Msg("saveSynthese",
    { nomAction : nomAction.value,
      synthese_texte : synthese_texte.value
    }));
  }
});

del.addEventListener("click", () => {
  if (alEx.value != "") {
    ws.send(Msg("deleteSynthese", { _id : alEx.value, name : alEx.options[alEx.selectedIndex].innerHTML }));
  } else {
    main.errorMessage("Veuillez sélectionner un composant pour le supprimer.");
  }
});

Signals.freeActionName = (s, data) => {
  vName = data.vName;
  if (data.vName) {
    main.successMessage("Le nom de synthèse vocale " + data.nomAction + " est libre.");
  } else {
    main.errorMessage("Le nom de synthèse vocale " + data.nomAction + " n'est pas libre.");
  }
};

Signals.addedSynthese = (s, data) => {
  if (data.saved) {
    var newOption = document.createElement("OPTION");
    newOption.value = data._id;
    newOption.innerHTML = data.nomAction;
    alEx.add(newOption);
    main.successMessage("La synthèse " + data.nomAction + " à bien été ajoutée.");
  } else {
    main.errorMessage("La Synthèse " + data.nomAction + " n'as pas été ajoutée.");
  }
};

Signals.deletedSynthese = (s, data) => {
  if (data.deleted) {
    main.successMessage("Votre synthèse vocale " + data.name + " à bien été supprimé.");
    alEx.remove(alEx.selectedIndex);
  } else {
    main.errorMessage("Votre synthèse vocale " + data.name + " n'a pas été supprimé de la table.");
  }
}

window.addEventListener("load", function() {
  document.getElementById('jumbotron').style.height = (document.getElementById('form').scrollHeight + 150) + "px";
  document.getElementById('form').style.width = getComputedStyle(document.getElementById('form').parentElement).width;
});

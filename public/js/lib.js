HTMLElement.prototype.addClass = function(a) {
	if (!(this.classList.contains(a)))
		this.classList.add(a);
};

HTMLElement.prototype.removeClass = function(r) {
	if (this.classList.contains(r))
		this.classList.remove(r);
};

HTMLElement.prototype.containClass = function(c) {
	if (this.classList.contains(c))
		return (true);
	else
		return (false);
};

HTMLElement.prototype.errorMessage = function(m) {
  var already = this.getElementsByClassName("alert-danger").map(e => {
    if (e.innerHTML.indexOf(m) > -1)
      return (true);
  });
  if (!already) {
    var div = document.createElement("DIV");
    this.removeErrorMessages();
    this.removeSuccessMessages();
    div.className = "alert alert-danger fade in";
    div.innerHTML = "<a href=\"#\" onclick=\"this.parentElement.remove()\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>";
    div.innerHTML += "<strong>Erreur !</strong> <span>" + m + "</span>";
    this.insertBefore(div, this.firstChild);
  }
};

HTMLElement.prototype.removeErrorMessages = function() {
  this.getElementsByClassName("alert alert-danger fade in").map(e => {
    if (e.nodeName === "DIV")
      e.remove();
  });
}

HTMLElement.prototype.removeSuccessMessages = function() {
  this.getElementsByClassName("alert alert-success fade in").map(e => {
    if (e.nodeName === "DIV")
      e.remove();
  });
}

HTMLElement.prototype.successMessage = function(m) {
  var already = this.getElementsByClassName("alert-success").map(e => {
    if (e.innerHTML.indexOf(m) > -1)
      return (true);
  });
  if (!already) {
    this.removeSuccessMessages();
    this.removeErrorMessages();
    var div = document.createElement("DIV");
	  div.className = "alert alert-success fade in";
	  div.innerHTML = "<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\" >&times;</a>";
	  div.innerHTML += "<strong>Succès !</strong> <span>" + m + "</span>";
	  this.insertBefore(div, this.firstChild);
  }
};

HTMLElement.prototype.getFromChildrenByClassName = function(c) {
	var ret = [];
	if (!c)
		return (null);
	var elemChildren = this.getElementsByClassName(c);
	ret = elemChildren.map(e => {
		var result = {
			id : e.id,
			value : e.value
		};
		if (e.type === "checkbox") {
			result.value = e.checked;
		}
		if (e.localName === "select") {
			result.HTML = { HTMLType : e.localName };
		} else if (e.localName === "input"){
			result.HTML = { HTMLType : e.localName, inputType : e.type };
		}
		return (result);
	});
	return (ret);
};


HTMLInputElement.prototype.getLabel = function() {
  var labels = document.getElementsByTagName('LABEL');
  var len = labels.length;
  var ret;
  ret = labels.map(label => {
    if (label.htmlFor === this.id) {
      return (label.innerHTML.replace(":", ""));
    }
  });
  if (typeof ret !== "undefined") {
    return (ret);
  }
  return (null);
};

HTMLInputElement.prototype.wipeInputValue = function(replaceBy) {
  if ((this.id) && (this.id !== "")) {
    document.getElementById(this.id).value = replaceBy;
    return (document.getElementById(this.id).value == replaceBy);
  } else {
    this.value = replaceBy;
    return (this.value === replaceBy)
  }
};

HTMLInputElement.prototype.checkLen = function(length, div, contain) {
  var name;
  var isContaining = false;
  var _ = this;
  if ((this.id) && (this.id != "")) {
    if (this.getLabel()) {
      name = this.getLabel();
    } else {
      name = this.id;
    }
  } else if ((this.name) && (this.name != "")) {
    name = this.name;
  } else if ((this.placeholder) && (this.placeholder != "")){
    name = this.placeholder;
  }
  if (contain) {
    isContaining = (this.value.indexOf(contain) == 0);
  }
  if (this.value.length >= length) {
    div.removeErrorMessages();
    if (typeof contain === "undefined") {
      div.successMessage("Votre champ " + name + " contient bien " + length + " caractères minimum.");
      return (true);
    } else if (contain) {
      if (!isContaining) {
        div.errorMessage("Votre champ " + name + " contient bien " + 4 + " caractères minimum mais ne contient pas les caractères " + contain + " en premiers.")
        return (false);
      } else {
        div.successMessage("Votre champ " + name + " contient bien " + length + " caractères minimum et contient les caractères " + contain + " en premiers.");
        return (true);
      }
    }
  } else {
    if (typeof contain === "undefined") {
      div.errorMessage("Votre champ " + name + " doit contenir au moins " + length + " caractères.");
    } else if (contain) {
      if (!isContaining) {
        div.errorMessage("Votre champ " + name + " doit contenir " + length + " caractères minimum et les caractères " + contain + " en premiers.");
      } else {
        div.errorMessage("Votre champ " + name + " doit contenir " + length + " caractères minimum mais contient bien les caractères " + contain + " en premiers.");
      }
    }
    return (false);
  }
}

HTMLCollection.prototype.map = function(cb) {
	var i = 0;
	var ret = [];
	var tmp;
	while (i < this.length) {
	tmp = cb(this[i]);
	if (typeof tmp !== "undefined")
		ret.push(tmp);
	i++;
  }
	if (ret.length == 1)
		return (ret[0]);
	else if (ret.length == 0)
		return;
  return (ret);
};

String.prototype.toJSON = function() {
  var parsedString;
  if ((this.toString() !== "") && (this.toString() !== null)) {
    try {
      parsedString = JSON.parse(this.toString());
      while (typeof parsedString !== "object")
        parsedString = JSON.parse(parsedString);
      return (parsedString);
    } catch(err) {
      console.log("ERROR HAPPENED WHEN PARSING : " + err);
      return (null);
    }
  }
}

String.prototype.removeBlankChars = function() {
  var ret = this.toString();
  return (ret.replace(/\ /g, ""));
};

Object.defineProperty(Object.prototype, "freshDisplay", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function(html) {
	var ret, _, BTL;
	BTL = (html) ? "<br/>" : "\n";
	_ = this;
	ret = BTL;
	for (attr in _) {
	  ret += attr + " : " + _[attr] + BTL;
	}
	return (ret);
  }
});

var setStatus = function(div, toAdd, toRemove) {
	div.removeClass(toRemove);
	div.addClass(toAdd);
};


window.addEventListener("load", function() {
  document.getElementsByTagName("INPUT").map(e => {
    if (e.attributes.nospace) {
      if (e.addEventListener) {
        e.addEventListener("input", function() {
          var previous = this.value;
          this.wipeInputValue(previous.removeBlankChars());
        }, false);
      }
    }
    if (e.attributes.wipe) {
        e.value = "";
    }
    if (e.attributes.loadedValue) {
      e.value = e.attributes.loadedValue.value;
    }
  });
  document.getElementsByTagName("SELECT").map(e => {
    if ((e.attributes.selected) && (!isNaN(e.attributes.selected.value))) {
      var index = parseInt(e.attributes.selected.value);
      if (e.selectedIndex != index) {
        e.selectedIndex = index;
      }
    }
  });
});

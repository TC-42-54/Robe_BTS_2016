//THIS CLASS REPRESENT THE DATA YOU SEND TO YOUR CLIENT PAGE (TITLE,...)
function Content(block, data) {
  this.block = block;
  if ((typeof data === "object") && (data.count() > 0)) {
    this.data = data;
  } else {
    log("l'argument envoyé doit être un objet.");
  }
}

module.exports = function() {
  return (Content);
}

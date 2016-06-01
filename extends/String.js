module.exports = function() {
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
}

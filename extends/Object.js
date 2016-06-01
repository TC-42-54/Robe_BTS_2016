module.exports = function() {
  Object.defineProperty(Object.prototype, "freshDisplay", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(html) {
      var ret, _, BTL;
      BTL = (html) ? "<br/>" : "\n";
      _ = this;
      ret = "";
      for (attr in _) {
        ret += attr + " : " + _[attr] + BTL;
      }
      return (ret);
    }
  });
  Object.defineProperty(Object.prototype, "count", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function() {
      var _ = this;
      var ct = 0;
      for (attr in _) {
        ct++;
      }
      return (ct);
    }
  });
}

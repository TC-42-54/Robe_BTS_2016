var ws = new WebSocket(window.location.origin.replace("http", "ws"));
var Signals = {};
ws.connected = false;

ws.addEventListener('open', function() {
  console.log("connecté");
  this.connected = true;
});

ws.addEventListener('message', function(sent) {
  var sent = sent.data.toString();
  sent = sent.toJSON();
  Signals[sent.signal](ws, sent.data);
});

var actionsMenu = document.getElementById('actionsMenu');
/*var layContainer = document.getElementById('layContainer');

socket.on('socketError', errMsg => {
    layContainer.children[3].errorMessage(errMsg);
});*/

window.addEventListener('beforeunload', function() {
  ws.close();
});

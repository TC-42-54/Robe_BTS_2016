function Msg (signal, data) {
  var obj = { signal : signal, data : data };
  return (JSON.stringify(obj).toString());
}

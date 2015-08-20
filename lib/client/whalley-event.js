var whalley = whalley || {};
whalley.event = function() {
  var listeners = [];
  return {
    fire: function (subject) {
      listeners.forEach(function (listener) {
        listener(subject);
      })
    },
    listen: function (listener) {
      listeners.push(listener);
    }
  }
}

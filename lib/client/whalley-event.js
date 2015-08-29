var whalley = whalley || {};
whalley.event = function() {
  var listeners = [];
  return {
    fire: function (subject, target) {
      listeners.forEach(function (listener) {
        listener(subject, target);
      })
    },
    listen: function (listener) {
      listeners.push(listener);
    }
  }
}

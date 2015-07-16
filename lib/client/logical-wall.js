var whalley = whalley || {};
whalley.LogicalWall = function () {
  var self = this;

  function event() {
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

  self.events = {
    card_moving: event(),
    card_moved: event(),
    card_added: event()
  };
}
var whalley = whalley || {};
whalley.LogicalCardDefaults = {
  left: 0,
  top: 0,
  width: 100,
  height: 60,
  type: 'text'
}
whalley.LogicalCard = function (cardlike) {
  var self = this;
  var notification = cardlike['notification'] || null;
  var text = cardlike['text'] || null;
  var left = cardlike['left'] || 0;
  var top = cardlike['top'] || 0;
  var width = cardlike['width'] || 100;
  var height = cardlike['height'] || 60;

  function add_get_fn(property, fn) {
    self.__defineGetter__(property, fn)
  }
  var data = {}
  for (var field in whalley.LogicalCardDefaults) {
    data[field] = whalley.LogicalCardDefaults[field]
  }
  for (field in cardlike) {
    data[field] = cardlike[field]
  }
  for (field in data) {
    add_get_fn(field, function() { return data[field] })
  }

  add_get_fn('width', function() { return width })
  add_get_fn('height', function() { return height })
  add_get_fn('half_width', function() { return width / 2 })
  add_get_fn('half_height', function() { return height / 2 })

  add_get_fn('top', function() { return top })
  add_get_fn('left', function() { return left })

  self.move_to = function(new_left, new_top) {
    left = new_left;
    top = new_top;
  }
  self.data_summary = function() {
    var fields = []

    function format_value(value) {
      if (typeof(value) === 'string') {
        return '"' + value.replace(/"/g, '\\"') + '"'
      }
      return value;
    }

    for (var key in cardlike) {
      fields.push(key + ': ' + format_value(cardlike[key]))
    }
    return fields.join(', ');
  }
  self.notification = function() {
    return notification;
  }
  self.notification_message = function () {
    if (notification == null) {
      return "'" + text + "' has no notification pending."
    }
    return "'" + text + "' has notification: '" + notification + "'";
  }
  self.notification_made = function() {
    notification = null;
  }
}

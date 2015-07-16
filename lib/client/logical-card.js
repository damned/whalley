var whalley = whalley || {};
whalley.LogicalCard = function (cardlike) {
  var self = this;
  var notification = cardlike['notification'] || null;
  var text = cardlike['text'] || null;
  var left = cardlike['left'] || 0;
  var top = cardlike['top'] || 0;

  self.text = function() { return text }
  self.left = function() { return left }
  self.top = function() { return top }
  self.move_to = function(new_left, new_top) {
    left = new_left;
    top = new_top;
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
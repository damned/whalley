var whalley = whalley || {};
whalley.LogicalWall = function () {
  var self = this;
  var event = whalley.event;

  self.events = {
    card_moving: event(),
    card_moved: event(),
    card_added: event()
  };

  self.move_to_front = function(id, cards) {
    cards.some(function (a_card, a_card_index) {
      if (a_card.has_id(id)) {
        cards.splice(a_card_index, 1)
        cards.push(a_card)
        return true;
      }
    });
    return cards;
  }
}
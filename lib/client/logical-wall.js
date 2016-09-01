var whalley = whalley || {};
whalley.LogicalWall = function () {
  var self = this;
  var event = whalley.event;
  var background_image, width, height;

  var events = {
    card_moving: event(),
    card_changed: event(),
    card_added: event(),
    change: event()
  };

  function set_background_image(image) {
    background_image = image
    events.change.fire();
  }

  function set_size(w, h) {
    if (w && h) {
      width = w
      height = h
      events.change.fire()
    }
  }

  function wall_data(data) {
    if (data) {
      if (data.background_image) {
        set_background_image(data.background_image)
      }
      if (data.width && data.height) {
        set_size(data.width, data.height);
      }
    }
    else {
      return {
        background_image: background_image,
        width: width,
        height: height
      }
    }
  }

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

  return {
    events: events,
    set_background_image: set_background_image,
    set_size: set_size,
    wall_data: wall_data,
    get background_image() {
      return background_image;
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    on_change: events.change.listen
  }
}
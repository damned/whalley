var whalley = whalley || {};
whalley.LogicalCardDefaults = {
  left: 0,
  top: 0,
  width: 100,
  height: 60,
  type: 'text'
}
whalley.LogicalCard = function (cardlike, wall) {
  function check_properties(cardlike) {
    if (cardlike.data !== undefined) {
      throw('Invalid card property: data (would conflict with data() method)')
    }
    if (cardlike.id === undefined || cardlike.id === null) {
      throw('Invalid card property: id is ' + id)
    }
    if (cardlike.text === undefined) {
      throw('Invalid card property: text is undefined')
    }
  }
  function add_get_fn(property, fn) {
    self.__defineGetter__(property, fn)
  }
  function default_data_fields() {
    for (var field in whalley.LogicalCardDefaults) {
      data[field] = whalley.LogicalCardDefaults[field]
    }
  }
  function specify_data_fields(fieldspec) {
    for (var field in fieldspec) {
      if (field === 'id') {
        data[field] = fieldspec[field].toString()
      }
      else {
        data[field] = fieldspec[field]
      }
    }
  }
  function add_field_getters() {
    for (var field in data) {
      (function(field) {
        add_get_fn(field, function() {
          return data[field]
        })
      })(field)
    }
  }

  check_properties(cardlike)

  var self = this;
  var data = {}

  default_data_fields();
  specify_data_fields(cardlike);

  data.x = data.left
  data.y = data.top

  add_field_getters();

  add_get_fn('half_width', function() { return self.width / 2 })
  add_get_fn('half_height', function() { return self.height / 2 })

  var events = {
    changed: whalley.event(),
    moved: whalley.event(),
    moving: whalley.event()
  }
  self.on_changed = events.changed.listen
  self.on_moved = events.moved.listen
  self.on_moving = events.moving.listen

  self.move_to = function(new_left, new_top) {
    data.left = data.x = new_left
    data.top = data.y = new_top
    card_view.update_position()
    if (data.status === null || data.status === '') {
      data.last_modification_status = undefined
    }
    else {
      data.last_modification_status = data.status
    }
  }

  self.data = function() {
    return data;
  }

  self.edit_done = function(new_text) {
    data.text = new_text
    events.changed.fire()
  }

  self.move_started = function() {
    wall.bring_to_front(self)
  }

  self.move_happening = function(x, y) {
    data.x = data.left = x
    data.y = data.top = y
    events.moving.fire()
  }

  self.move_completed = function() {
    events.moved.fire()
  }
  self.set_colour = function(colour) {
    data.colour = colour
  }

  self.data_summary = function() {
    var fields = []

    function format_value(value) {
      if (typeof(value) === 'string') {
        return '"' + value.replace(/"/g, '\\"') + '"'
      }
      return value;
    }

    for (var key in data) {
      fields.push(key + ': ' + format_value(cardlike[key]))
    }
    return fields.join(', ');
  }

  self.matches = function(term) {
    return self.text.indexOf(term) !== -1
  }
  self.has_id = function(queried_id) {
    return data.id === queried_id.toString();
  }

  var card_view
  console.log("wall: " + wall)
  const IMG_DATA_PREFIX = 'data:image';
  if (self.text.indexOf(IMG_DATA_PREFIX) == 0) {
    card_view = wall.create_image_card_view(self)
  }
  else {
    card_view = wall.create_text_card_view(self)
  }
  forward({ from: self, methods: 'display_as display_as_not', to: card_view})
}

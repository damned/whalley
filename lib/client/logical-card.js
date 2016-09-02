var whalley = whalley || {};
whalley.LogicalCardDefaults = {
  x: 0,
  y: 0,
  width: 100,
  height: 60,
  type: 'text',
  colour: 'lightgray'
}

whalley.LogicalCard = function (cardlike, wall) {
  function check_properties(cardlike) {
    if (cardlike.data !== undefined) {
      throw('Invalid card property: data (would conflict with data() method)')
    }
    if (cardlike.id === undefined || cardlike.id === null) {
      throw('Invalid card property: id is ' + id)
    }
    if (cardlike.text === undefined && (cardlike.type === 'text' || cardlike.type === undefined)) {
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

  add_field_getters();

  add_get_fn('half_width', function() { return self.width / 2 })
  add_get_fn('half_height', function() { return self.height / 2 })

  var events = {
    changed: whalley.event(),
    moved: whalley.event(),
    moving: whalley.event(),
    select: whalley.event(),
    deselect: whalley.event(),
    position_value_changed: whalley.event(),
    mark: whalley.event(),
    unmark: whalley.event()
  }
  self.on_changed = events.changed.listen
  self.on_moved = events.moved.listen
  self.on_moving = events.moving.listen
  self.on_select = events.select.listen
  self.on_deselect = events.deselect.listen
  self.on_mark = events.mark.listen
  self.on_unmark = events.unmark.listen
  self.on_position_value_changed = events.position_value_changed.listen

  self.move_to = function(new_x, new_y) {
    data.x = new_x
    data.y = new_y
    events.position_value_changed.fire() // based on external move so don't want to generate outgoing move event - view will be updated based on this
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


  var selected = false
  self.select = function(on) {
    if (on) {
      selected = true
      events.select.fire()
    }
    else {
      selected = false
      events.deselect.fire()
    }
  }
  add_get_fn('selected', function() { return selected })

  self.overlap = function(rect) {
    return Math.max(rect.x(), self.x - self.half_width) < Math.min(rect.x() + rect.width(), self.x + self.half_width) &&
      Math.max(rect.y(), self.y - self.half_height) < Math.min(rect.y() + rect.height(), self.y + self.half_height);
  }

  self.edit_done = function(new_text) {
    data.text = new_text
    events.changed.fire()
  }

  var move_start;
  self.move_started = function() {
    move_start = {x: self.x, y: self.y};
    wall.bring_to_front(self)
  }

  self.move_happening = function(x, y) {
    data.x = x
    data.y = y
    events.moving.fire({})
  }

  self.move_completed = function() {
    events.moved.fire({dx: self.x - move_start.x, dy: self.y - move_start.y})
  }

  self.set_colour = function(colour) {
    data.colour = colour
  }

  self.set_size = function(size) {
    data.width = size.width;
    data.height = size.height;
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
    return self.text !== undefined && self.text.indexOf(term) !== -1
  }
  self.has_id = function(queried_id) {
    return data.id === queried_id.toString();
  }

  self.mark = function(marker) {
    events.mark.fire(marker)
  }
  self.unmark = function(marker) {
    events.unmark.fire(marker)
  }
}

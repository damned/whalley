var whalley = whalley || {};

whalley.SvgMenu = function(position, group_creator, named_options) {
  var options = []
  for (var name in named_options) {
    options.push({name: name, action: named_options[name]})
  }
  var open_menu = function() {
    var options_group = group_creator().move(position.x, position.y)
    var option_buttons = []
    options.forEach(function(option, i) {
      var wh = [100, 30]
      var button = options_group.group(wh[0], wh[1])
      var background = button.rect(wh[0], wh[1]).fill('#fff');
      option_buttons.push(button)
      button.add(options_group.text(option.name)).dy(50 * i)
      button.click(function() {
        background.stroke({width: 3})
        option.action()
        options_group.remove()
      })
    })
  }

  return {
    open: open_menu
  }
}
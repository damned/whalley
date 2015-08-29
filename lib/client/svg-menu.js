var whalley = whalley || {};

whalley.SvgMenu = function(menu_trigger, wall, named_options) {
  var options = []
  for (var name in named_options) {
    options.push({name: name, action: named_options[name]})
  }
  function handle_menu_trigger_group_click(subject, target) {
    if (target === menu_trigger.node) {
      trigger_menu()
      return false
    }
  }

  var trigger_menu = function() {
    var options_group = wall.group().move(menu_trigger.parent().x(), menu_trigger.parent().y())
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
    handle: handle_menu_trigger_group_click
  }
}
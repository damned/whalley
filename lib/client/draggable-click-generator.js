var whalley = whalley || {};
// click not working in chrome with draggable() so using dragstart+end
whalley.DraggableClickGenerator = function(draggable) {
  var startp, lastp
  var click_event = whalley.event()
  var movement_threshold = 4

  function xy(el) {
    return {x: el.x(), y: el.y()}
  }

  draggable.on('dragstart', function(e) {
    startp = xy(this)
  })

  draggable.on('dragend', function(e) {
    var nowp = xy(this)
    console.log('start: ' + JSON.stringify(startp) + ', end: ' + JSON.stringify(nowp))
    var distance_moved = Math.max(Math.abs(startp.x - nowp.x), Math.abs(startp.y - nowp.y))
    if (distance_moved < movement_threshold) {
      click_event.fire(this)
    }
  })

  return {
    onclick: click_event.listen
  }
}

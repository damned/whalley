var whalley = whalley || {};
whalley.workarounds = {
  fixup_firefox_fo: function(fo) {
    // ensure foreignobject obeys svg render order: https://bugzilla.mozilla.org/show_bug.cgi?id=1141098
    fo.attr({transform: "translate(0,0)"})
  },
  // click not working in chrome with draggable() so using dragstart+end
  DraggableClickGenerator: function(draggable) {
    var startp, target
    var click_event = whalley.event()
    var movement_threshold = 4

    function xy(el) {
      return {x: el.x(), y: el.y()}
    }

    draggable.on('dragstart', function(e) {
      startp = xy(this)
      target = e.detail.event.target
    })

    draggable.on('dragend', function(e) {
      var nowp = xy(this)
      console.log('start: ' + JSON.stringify(startp) + ', end: ' + JSON.stringify(nowp))
      var distance_moved = Math.max(Math.abs(startp.x - nowp.x), Math.abs(startp.y - nowp.y))
      if (distance_moved < movement_threshold) {
        click_event.fire(this, target)
      }
    })

    return {
      onclick: click_event.listen
    }
  }
}

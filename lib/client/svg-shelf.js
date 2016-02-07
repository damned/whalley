var whalley = whalley || {};
whalley.SvgShelf = function (wall_to_card_api, cards_api, added_event) {
  var shelf, shelf_y;
  var blanks;

  function create_blank_cards() {
    var blanks = []
    blanks.push(new whalley.LogicalCard({ id: 'blank_x', width: 50, height: 60, color: 'white', text: wall_to_card_api.DEFAULT_TEXT }, wall_to_card_api))
    blanks.push(new whalley.LogicalCard({ id: 'blank_xx', width: 100, height: 60, color: 'white', text: wall_to_card_api.DEFAULT_TEXT }, wall_to_card_api))
    return blanks
  }
  function init_shelf(blanks, y) {
    if (y === undefined) {
      y = -80
    }
    var shelf = wall_to_card_api.group(400, 100).move(20, y)
    var rect = shelf.rect(400, 100);
    rect.move(0,0);
    shelf.draggy({
      minY: -80
        , minX: 20
        , maxY: 80
        , maxX: 420
    })
    shelf.attr({id: 'shelf'})
    shelf.text('shelf').fill({color: 'black'}).font({anchor: 'start'}).move(5, 80)
    rect.fill({color:'white', opacity: 0.3})
    function move_blanks() {
      var right = 400
      const spacing = 20;
      blanks.forEach(function(blank) {
        blank.move_to(shelf.x() + right - spacing - blank.half_width, shelf.y() + blank.half_height + spacing)
        right -= (blank.width + spacing)
      })
    }
    move_blanks();
    shelf.back()
    shelf.on('dragmove', function() {
      shelf_y = shelf.y()
      move_blanks()
    })
    blanks.forEach(function(blank) {
      blank.on_moved(function() {
        var template = JSON.parse(JSON.stringify(blank.data()));
        template.id = Date.now().toString()
        template.x = blank.x
        template.y = blank.y
        added_event.fire(cards_api.add(template));
        move_blanks()
      })
    })
    return shelf;
  }

  function load() {
    blanks = create_blank_cards()
    shelf = init_shelf(blanks, shelf_y)
  }

  return {
    reload: load
  }
}

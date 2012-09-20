var canvas = new fabric.Canvas('wall');
canvas.backgroundColor = 'rgb(200, 200, 200)';

function new_card(number, name) {
  var card = new fabric.Rect({ width: 100, height: 60, fill: 'rgb(200, 200, 100)' });
  card.hasControls = false;
  var text = new fabric.Text('#' + number + '\n' + name.substring(0, 10) + '\n' + name.substring(10, 20), { width: 50, height: 20, textAlign: "left", fontSize: 14 });
  text.hasControls = false;
  text.useNative = true;
  var group = new fabric.Group([ card, text ], {top: 150, left: 150});
  group.hasControls = false;
  return group;
};

function draw_cards(card_data) {
  card_data.forEach(function(single_card_data, i) {
    var card = new_card(single_card_data['Number'], single_card_data['Name'])
    card.setLeft(card.getLeft() + i * 50);
    canvas.add(card);
  });
}

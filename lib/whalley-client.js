var canvas = new fabric.Canvas('wall');

function new_card() {
  var card = new fabric.Rect({ width: 100, height: 50, fill: 'rgb(200, 200, 100)' });
  card.hasControls = false;
  var text = new fabric.Text('#270 put the baby in the bath tub', { width: 50, height: 20, textAlign: "left", fontSize: 14 });
  text.hasControls = false;
  text.useNative = true;
//  text.setText(text.useNative);
  var group = new fabric.Group([ card, text ], {top: 150, left: 150});
  group.hasControls = false;
  return group;
};

var cards = [
  new_card(),
  new_card()
];


cards.forEach(function(card, i) {
  card.setLeft(card.getLeft() + i * 50);
  canvas.add(card);
});


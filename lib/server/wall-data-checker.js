exports.check_wall = function(wall_data) {
  var cards = wall_data.cards;

  cards.forEach(function (card) {
    if (card.text === undefined) {
      throw "Missing 'text' field on card: " + card.id;
    }
  });
};

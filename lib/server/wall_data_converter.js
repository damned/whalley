exports.convert = function(source_data, target_version) {

  if (target_version === null) {
    if (source_data.data_version === undefined) {
      return source_data;
    }
    return to_preversioned(source_data);
  }
  return {};
};

function to_preversioned(wall_data) {
  console.log('cards: ' + wall_data.cards);
  var card_ids = wall_data.cards.map(function(card) {
    return card.id;
  });
  var cards = {};
  wall_data.cards.forEach(function(card) {
    cards[card.id] = card;
  });
  return {
    meta: {
      'lowfi-card-ids': card_ids
    },
    cards: cards
  }
}


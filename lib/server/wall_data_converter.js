exports.convert = function(source_data, target_version) {
  var target_data_version = target_version || undefined;
  if (source_data.data_version === target_data_version) {
    return source_data;
  }
  if (target_version === null) {
    return to_preversioned(source_data);
  }
  var cards = [];
  for (var key in source_data.cards) {
    cards.push(source_data.cards[key]);
  };
  return {
    data_version: '0.1',
    cards: cards
  };
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


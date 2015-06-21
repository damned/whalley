exports.convert = function(source_data, target_version) {
  target_version = target_version || undefined;

  check_version(target_version, "target_version to convert to");
  check_version(source_data.structure_version, "source structure_version to convert from");

  if (source_data.structure_version === target_version) {
    return source_data;
  }
  if (target_version === undefined) {
    return v0_1_to_preversioned(source_data);
  }
  return preversioned_to_v0_1(source_data);
};

var known_versions = [undefined, '0.1']
function is_known_version(version) {
  return known_versions.indexOf(version) > -1;
}
function known_versions_list() {
  return known_versions.map(function(version) {
    return '' + version;
  }).join(', ');
}
function check_version(version, context) {
  if (!is_known_version(version)) {
    throw "Invalid " + context + ": '" + version + "' - valid values: " + known_versions_list();
  }
}

function preversioned_to_v0_1(source_data) {
  var cards = [];
  for (var key in source_data.cards) {
    cards.push(source_data.cards[key]);
  };
  return {
    structure_version: '0.1',
    cards: cards
  };
}

function v0_1_to_preversioned(wall_data) {
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


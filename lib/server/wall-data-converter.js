function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

exports.convert = function(source_data, target_version) {
  target_version = target_version || undefined;

  var source_version = source_data.structure_version;
  check_version(target_version, "target_version to convert to");

  check_version(source_version, "source structure_version to convert from");

  if (source_version === target_version) {
    return source_data;
  }

  var working_data = clone(source_data)
  if (target_version === undefined) {
    return v0_1_to_preversioned(working_data);
  }
  if (target_version === '0.2' && source_version === '0.1') {
    return v0_1_to_v0_2(working_data);
  }
  return preversioned_to_v0_1(working_data);
};

var known_versions = [undefined, '0.1', '0.2']

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

function v0_1_to_v0_2(data) {
  function fixup_xy(card) {
    card.x = card.left;
    delete card.left;
    card.y = card.top;
    delete card.top;
  }

  function fixup_type(card) {
    if (card.type === undefined) {
      card.type = 'text'
    }
    if (card.text.match(/^img:/)) {
      card.type = 'image'
      card.image_src = '/images/' + card.text.substring('img: '.length)
      delete card.text
    }
    else if (card.text.match(/^data:image/)) {
      card.type = 'image'
      card.image_src = card.text
      delete card.text
    }
  }

  data.cards.forEach(function(card) {
    fixup_xy(card);
    fixup_type(card);
  })
  data.structure_version = '0.2'
  return data
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


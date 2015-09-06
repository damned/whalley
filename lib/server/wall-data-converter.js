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
  if (target_version === undefined && source_version === '0.1') {
    return versions['0.1'].downgrade(working_data);
  }
  if (target_version === undefined) {
    return versions['0.1'].downgrade(versions['0.2'].downgrade(working_data));
  }
  if (target_version === '0.2' && source_version === '0.1') {
    return versions['0.2'].upgrade(working_data);
  }
  if (target_version === '0.2' && source_version === undefined) {
    return versions['0.2'].upgrade(versions['0.1'].upgrade(working_data));
  }
  if (target_version === '0.1' && source_version === '0.2') {
    return versions['0.2'].downgrade(working_data);
  }
  return versions['0.1'].upgrade(working_data);
};

var versions = {
  undefined: {
    upgrade: false,
    downgrade: false
  },
  '0.1': {
    upgrade: function(source_data) {
      var cards = [];
      for (var key in source_data.cards) {
        cards.push(source_data.cards[key]);
      }
      ;
      return {
        structure_version: '0.1',
        cards: cards
      };
    },
    downgrade: function(wall_data) {
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
  },
  '0.2': {
    upgrade: function(data) {
      function fixup_xy(card) {
        rename_props(card, { left: 'x', top: 'y' });
      }

      function convert_to_image(card, src) {
        card.type = 'image'
        card.image_src = src
        delete card.text
      }

      function relative_to_absolute_src(text) {
        return '/images/' + text.substring('img: '.length);
      }

      function fixup_type(card) {
        if (card.type === undefined) {
          card.type = 'text'
        }

        if (card.text.match(/^img:/)) {
          convert_to_image(card, relative_to_absolute_src(card.text));
        }
        else if (card.text.match(/^data:image/)) {
          convert_to_image(card, card.text);
        }
      }

      data.cards.forEach(function(card) {
        fixup_xy(card);
        fixup_type(card);
      })
      data.structure_version = '0.2'
      return data
    },
    downgrade: function(data) {
      function fixup_xy(card) {
        rename_props(card, { x: 'left', y: 'top' });
      }

      function fixup_image_card(card) {
        if (card.type === 'image') {
          if (card.image_src.match(/^\/images/)) {
            card.text = 'img: ' + card.image_src.replace(/\/images\//, '')
          }
          else if (card.image_src.match(/^data:image/)) {
            card.text = card.image_src
          }
          delete card.image_src
        }
      }

      data.cards.forEach(function(card) {
        fixup_xy(card)
        fixup_image_card(card)
        delete card.type
      })
      data.structure_version = '0.1'
      return data
    }

  }
}

function is_known_version(version) {
  return versions[version] !== undefined;
}

function known_versions_list() {
  return Object.keys(versions).map(function(version) {
    return '' + version;
  }).join(', ');
}

function check_version(version, context) {
  if (!is_known_version(version)) {
    throw "Invalid " + context + ": '" + version + "' - valid values: " + known_versions_list();
  }
}

function rename_props(card, renames) {
  for (var from in renames) {
    card[renames[from]] = card[from];
    delete card[from];
  }
}


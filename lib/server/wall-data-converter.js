'use strict';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

exports.convert = function(source_data, target_code) {
  target_code = target_code || undefined;

  if (source_data.structure_version === target_code) {
    return source_data;
  }
  let source_version_ordinal = version_ordinal(source_data.structure_version, "source structure_version to convert from")
  let target_version_ordinal = version_ordinal(target_code, "target_version to convert to")

  let method, step
  if (target_version_ordinal > source_version_ordinal) {
    method = 'upgrade'
    step = 1
  }
  else {
    method = 'downgrade'
    step = -1
  }
  var working_data = clone(source_data)

  while (target_version_ordinal !== source_version_ordinal) {
    source_version_ordinal += step
    working_data = versions[source_version_ordinal][method](working_data)
  }
  return working_data;
}

var versions = [
  {
    code: undefined,
    upgrade: false,
    downgrade: function(wall_data) {
      var card_ids = wall_data.cards.map(card => {
        return card.id;
      });
      var cards = {};
      wall_data.cards.forEach(card => {
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
  {
    code: '0.1',
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
    downgrade: function(data) {
      let fixup_xy = (card) => {
        rename_props(card, {x: 'left', y: 'top'});
      }

      let fixup_image_card = (card) => {
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

      data.cards.forEach(card => {
        fixup_xy(card)
        fixup_image_card(card)
        delete card.type
      })
      data.structure_version = '0.1'
      return data
    }
  },
  {
    code: '0.2',
    upgrade: function(data) {
      let fixup_xy = (card) => {
        rename_props(card, {left: 'x', top: 'y'});
      }

      let convert_to_image = (card, src) => {
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
        if (card.text === undefined) {
          return;
        }
        if (card.text.match(/^img:/)) {
          convert_to_image(card, relative_to_absolute_src(card.text));
        }
        else if (card.text.match(/^data:image/)) {
          convert_to_image(card, card.text);
        }
      }

      data.cards.forEach(card => {
        fixup_xy(card);
        fixup_type(card);
      })
      data.structure_version = '0.2'
      return data
    }
  }
]

function is_known_version(version_code) {
  return find_version(version_code) !== undefined
}

function version_ordinal(version_code, context) {
  check_version(version_code, context);
  return versions.indexOf(find_version(version_code))
}

function find_version(version_code) {
  var found_version
  versions.forEach(version => {
    if (version.code === version_code) {
      found_version = version
    }
  })
  return found_version
}

function known_versions_list() {
  return versions.map(version => {
    return '' + version.code;
  }).join(', ');
}

function check_version(version_code, context) {
  if (!is_known_version(version_code)) {
    throw "Invalid " + context + ": '" + version_code + "' - valid values: " + known_versions_list();
  }
}

function rename_props(card, renames) {
  for (var from in renames) {
    card[renames[from]] = card[from];
    delete card[from];
  }
}


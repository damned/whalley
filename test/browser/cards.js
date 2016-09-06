'use strict';
var Nodes = require('./nodes')
var Card = require('./card')

function Cards(elements_finder) {
  var nodes = Nodes(elements_finder, {child_type: Card})

  var external = {
    find_by_text: nodes.find_by_text,
    get size() {
      return size()
    }
  }

  function size() {
    return nodes.elements_matching(
      (el) => { return el.getAttribute('class') },
      (classes) => { return classes === 'card' }
    ).then((cards) => { return cards.length })
  }

  return external
}
module.exports = Cards
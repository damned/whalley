'use strict';
var Cards = require('./cards')
var Shelf = require('./shelf')
var Card = require('./card')

function Wall(context) {
  let node = context.find('svg')

  var external = {
    get card() {
      return node.find('g.card', {as: Card})
    },

    get cards() {
      return node.all('g.card', {as: Cards})
    },

    get shelf() {
      return node.find('g#shelf', {as: Shelf, parent: this})
    },

    card_named: function(name) {
      //console.log('finding card named', name)
      return external.cards.find_by_text(name);
    }
  }
  return external
}
module.exports = Wall
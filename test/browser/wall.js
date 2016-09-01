'use strict';
var Cards = require('./cards')
var Shelf = require('./shelf')
var Card = require('./card')

class Wall {
  constructor(context) {
    this.node = context.find('svg')
  }

  get card() {
    return this.node.find('g.card', {as: Card})
  }

  get cards() {
    return this.node.all('g.card', {as: Cards})
  }

  get shelf() {
    return this.node.find('g#shelf', {as: Shelf, parent: this})
  }

  card_named(name) {
    //console.log('finding card named', name)
    return this.cards.find_by_text(name);
  }
}
module.exports = Wall
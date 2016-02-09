'use strict';
var Nodes = require('./nodes')
var Card = require('./card')

class Cards extends Nodes {
  constructor(elements) {
    super(elements)
    this.child_type = Card
  }
  get size() {
    return this._elements_matching(
      (el) => { return el.getAttribute('class') },
      (classes) => { return classes === 'card' }
    ).then((cards) => { return cards.length })
  }
}
module.exports = Cards
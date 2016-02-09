'use strict';
var Nodes = require('./nodes')
var Card = require('./card')

class Cards extends Nodes {
  constructor(elements) {
    super(elements)
    this.child_type = Card
  }
}
module.exports = Cards
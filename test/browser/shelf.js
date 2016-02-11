'use strict';
var Node = require('./node')
var Card = require('./card')

class Shelf extends Node {
  constructor(element, parent) {
    super(element)
    this.parent = parent;
  }

  drag_down() {
    return this.element.then((el) => {
      return this.height.then((height) => {
        return this._actions(el)
          .mouseMove(el, {x: 5, y: height - 5 })
          .mouseDown()
          .mouseMove({x: 100, y: 400 })
          .mouseUp()
          .perform().then(this._selfie())
      })
    })
  }

  pull_out_card() {
    return new Card(this.element.then((el) => {
      return this._find_blank_in(el.getDriver()).then((blank_el) => {
        return this._actions(blank_el)
          .dragAndDrop(blank_el, {x: 0, y: 200})
          .click()
          .sendKeys('n', 'e', 'w')
          .perform()
      }).then(() => {
        return this.parent.card_named('new').element
      })
    }))
  }

  _find_blank_in(context) {
    return context.findElement({css: 'g.blank'});
  }
}
module.exports = Shelf
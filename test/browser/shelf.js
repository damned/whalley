'use strict';
var Node = require('./node')

class Shelf extends Node {
  drag_down() {
    return this.element.then((el) => {
      return el.getSize().then((size) => {
        return size.height;
      }).then((height) => {
        return this._actions(el)
          .mouseMove(el, {x: 2, y: height - 2 })
          .mouseDown()
          .mouseMove({x: 100, y: 400 })
          .mouseUp()
          .perform().then(this._selfie())
      })
    })
  }

  pull_out_card() {
    return this.element.then((el) => {
      return this._find_blank_in(el.getDriver()).then((blank_el) => {
        return this._actions(blank_el)
          .dragAndDrop(blank_el, {x: 0, y: 200})
          .click()
          .sendKeys('n', 'e', 'w')
          .perform()
      }).then(this._selfie())
    })
  }

  _find_blank_in(context) {
    return context.findElement({css: 'g.blank'});
  }
}
module.exports = Shelf
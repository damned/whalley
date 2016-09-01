'use strict';
var Node = require('./node')
var Card = require('./card')
var keys = require('./keys')
var _ = require('lodash')

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

  pull_out_card(specified) {
    let options = _.assign({
      x: 0, y: 200,
      text: 'new'
    }, specified)

    let location = {x: options.x, y: options.y}
    var new_text = options.text;

    return new Card(this.element.then((el) => {
      return this._find_blank_in(el.getDriver()).then((blank_el) => {
        var actions = this._actions(blank_el)
        actions.dragAndDrop(blank_el, location)
            .click()
            .sendKeys.call(actions, keys.to_enter(new_text))
            .perform()
      }).then(() => {
        return this.parent.card_named(new_text).element
      })
    }))
  }

  _find_blank_in(context) {
    return context.findElement({css: 'g.blank'});
  }
}
module.exports = Shelf
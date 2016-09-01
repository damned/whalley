'use strict';
var Node = require('./node')
var Menu = require('./menu')
var keys = require('./keys')

class Card extends Node {
  constructor(element) {
    super(element)
    this.type = 'card'
  }

  click_menu() {
    return new Menu(this.element.then((el) => {
      return this._click_menu_actions(el).perform().then((() => {
        return el.getDriver()
      }))
    }), this);
  }

  drag(offset) {
    this.element.then((el) => {
      return this._actions(el).dragAndDrop(el, offset).perform()
    })
    return this
  }

  edit(text_to_add) {
    return this.element.then((el) => {
      var actions = this._actions(el);
      return keys.select_all(actions.click(el).click()).
          sendKeys.call(actions, keys.to_enter(text_to_add)).perform()
    }).then(this._selfie())
  }

  get colour() {
    return this.element.then((el) => {
      return el.findElement({css: 'div'})
    }).then((div) => {
      return div.getCssValue('background-color')
    })
  }

  get location() {
    return this.element.then((el) => {
      return el.getLocation()
    })
  }


  // "private"

  _click_menu_actions(el) {
    return this._actions(el).mouseMove(el).mouseMove({x: -30, y: -20}).click();
  }

}

module.exports = Card
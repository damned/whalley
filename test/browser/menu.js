'use strict';
var webdriver = require('selenium-webdriver')
var Node = require('./node')

class Menu extends Node {
  constructor(element, parent) {
    super(element)
    this.parent = parent
    element.then((el) => {
      this.driver = el.getDriver()
    })
  }

  click_first() {
    console.log('1')
    return this.element.then((el) => {
      console.log('2')
      return new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({
        x: 2,
        y: -2
      }).click().perform()
    }).then(() => {
      console.log('3')
      return this;
    })
  }

  click_cancel() {
    let parent = this.parent;
    return this._menu_finder(this.driver)().then((el) => {
      return this._height_getter(el).then((height) => {
        return this._actions(el)
          .mouseMove(el)
          .mouseMove({ x: 2, y: height-2 })
          .click()
          .perform()
      }).then(function () {
        return parent;
      })
    })
  }
}

module.exports = Menu
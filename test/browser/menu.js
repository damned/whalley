'use strict';
var webdriver = require('selenium-webdriver')
var until = webdriver.until
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
    return this._menu_finder(this.driver, '.cancel')().then((el) => {
      return this._height_getter(el).then((height) => {
        return el.getSize().then((size) => {
          return el.getLocation().then((location) => {
            console.log(JSON.stringify(size))
            console.log(JSON.stringify(location))
            return this._actions(el)
              .mouseMove(el)
              //.mouseMove({ x: 20, y: height-50 })
              .click()
              .perform()
          })
        })
      }).then(function () {
        return parent;
      })
    })
  }

  get has_gone() {
    return this._menu_finder(this.driver)().then((el) => {
      return false
    }).thenCatch((err) => {
      if (err.toString().startsWith('NoSuchElement')) {
        return true;
      }
      throw err;
    })
  }
}

module.exports = Menu
'use strict';
var webdriver = require('selenium-webdriver')
function check(object, name) {
  console.log(name + ' raw: '    + object)
  console.log(name + ': '    + Object.prototype.toString(object))
  console.log(name + ' length: '    + object.length)
  console.log(name + ' then: '    + object.then)
  console.log(name + ' findElement: '    + object.findElement)
  console.log(name + ' is promise: '    + webdriver.promise.isPromise(object))
}

class Menu {
  constructor(driver, parent) {
    this.driver = driver
    this.parent = parent
  }

  sub_menu(label) {
    let selector = '.' + label.replace(/\s/, '-')
    return this._menu_finder(selector).then((el) => {
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

  select(label) {
    let parent = this.parent;
    let selector = '.' + label.replace(/\s/, '-')
    return this._menu_finder(selector).then((el) => {
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
    return this._menu_finder().then((el) => {
      return false
    }).thenCatch((err) => {
      if (err.toString().startsWith('NoSuchElement')) {
        return true;
      }
      throw err;
    })
  }

  _menu_finder(sublocator) {
    let locator = 'g.options_menu'
    if (sublocator) {
      locator += ' ' + sublocator
    }
    return this.driver.then((driver) => {
      return driver.findElement({css: locator})
    })
  }

  get _height_getter() {
    return (el) => {
      return el.getSize().then((size) => {
        return size.height;
      })
    }
  }

  _actions(el) {
    return new webdriver.ActionSequence(el.getDriver());
  }
}

module.exports = Menu
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

function Menu(driver, parent) {

  var external = {
    sub_menu: sub_menu,
    select: select,
    get has_gone() {
      return has_gone()
    }
  }

  function sub_menu(label) {
    let selector = '.' + label.replace(/\s/, '-')
    return _menu_finder(selector).then((el) => {
      return new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({
        x: 2,
        y: -2
      }).click().perform()
    }).then(() => {
      return external;
    })
  }

  function select(label) {
    let selector = '.' + label.replace(/\s/, '-')
    return _menu_finder(selector).then((el) => {
      return _height_getter()(el).then((height) => {
        return el.getSize().then((size) => {
          return el.getLocation().then((location) => {
            return _actions(el)
              .mouseMove(el)
              .click()
              .perform()
          })
        })
      }).then(function () {
        return parent;
      })
    })
  }

  function has_gone() {
    return _menu_finder().then((el) => {
      return false
    }).thenCatch((err) => {
      if (err.toString().startsWith('NoSuchElement')) {
        return true;
      }
      throw err;
    })
  }

  function _menu_finder(sublocator) {
    let locator = 'g.options_menu'
    if (sublocator) {
      locator += ' ' + sublocator
    }
    return driver.then((d) => {
      return d.findElement({css: locator})
    })
  }

  function _height_getter() {
    return (el) => {
      return el.getSize().then((size) => {
        return size.height;
      })
    }
  }

  function _actions(el) {
    return new webdriver.ActionSequence(el.getDriver());
  }
  return external
}

module.exports = Menu
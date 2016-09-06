'use strict';
var Node = require('./node')
var Menu = require('./menu')
var keys = require('./keys')

function Card(element_finder) {

  var node = Node(element_finder, {type: 'card'})

  function element() {
    return element_finder() // TODO node.element() ?
  }

  var external = {
    get colour() {
      return element().then((el) => {
             return el.findElement({css: 'div'})
          }).then((div) => {
        return div.getCssValue('background-color')
      })
    },
    get location() {
      return element().then((el) => {
        return el.getLocation()
      })
    },
    click_menu: click_menu,
    drag: drag,
    edit: edit,
    get text() {
      return node.text
    },
    element: element
  }

  function click_menu() {
    return Menu(element().then((el) => {
      return _click_menu_actions(el).perform().then((() => {
        return el.getDriver()
      }))
    }), external);
  }

  function drag(offset) {
    element().then((el) => {
      return node._actions(el).dragAndDrop(el, offset).perform()
    })
    return external
  }

  function edit(text_to_add) {
    return element().then((el) => {
      var actions = node._actions(el);
      return keys.select_all(actions.click(el).click()).
          sendKeys.call(actions, keys.to_enter(text_to_add)).perform()
    }).then(undefined)
  }

  function _click_menu_actions(el) {
    return node._actions(el).mouseMove(el).mouseMove({x: -30, y: -20}).click();
  }

  return external
}

module.exports = Card
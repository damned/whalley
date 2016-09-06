'use strict';
var Node = require('./node')
var Card = require('./card')
var keys = require('./keys')
var _ = require('lodash')

function isAFunction(object) {
  return typeof object == 'function';
}

function Shelf(element_finder, parent) {
  var node = Node(element_finder)

  function element() {
    return element_finder() // TODO node.element() ?
  }

  var external = {
    drag_down: drag_down,
    pull_out_card: pull_out_card
  };

  function drag_down() {
    return element().then((el) => {
      return node.height.then((height) => {
        return node._actions(el)
          .mouseMove(el, {x: 5, y: height - 5 })
          .mouseDown()
          .mouseMove({x: 100, y: 400 })
          .mouseUp()
          .perform().then(function () {
            return external
          })
      })
    })
  }

  function pull_out_card(specified) {
    let options = _.assign({
      x: 0, y: 200,
      text: 'new'
    }, specified)

    let location = {x: options.x, y: options.y}
    var new_text = options.text;

    function new_card_element_finder() {
      return element().then((el) => {
        return _find_blank_in(el.getDriver()).then((blank_el) => {
          var actions = node._actions(blank_el)
          actions.dragAndDrop(blank_el, location)
            .click()
            .sendKeys.call(actions, keys.to_enter(new_text))
            .perform()
        }).then(() => {
          var card = parent.card_named(new_text)
          return card.element()
        })
      })
    }

    return Card(new_card_element_finder)
  }

  function _find_blank_in(context) {
    return context.findElement({css: 'g.blank'});
  }

  return external
}
module.exports = Shelf
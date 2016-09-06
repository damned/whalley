'use strict';
var Node = require('./node')
var Card = require('./card')
var keys = require('./keys')
var _ = require('lodash')

function Shelf(element, parent) {
  var node = Node(element)

  var external = {
    drag_down: drag_down,
    pull_out_card: pull_out_card
  };

  function drag_down() {
    return element.then((el) => {
      return node.height.then((height) => {
        console.log('height', height)
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

    return new Card(element.then((el) => {
      return _find_blank_in(el.getDriver()).then((blank_el) => {
        //console.log("blank_el", blank_el)
        var actions = node._actions(blank_el)
        actions.dragAndDrop(blank_el, location)
            .click()
            .sendKeys.call(actions, keys.to_enter(new_text))
            .perform()
      }).then(() => {
        var card = parent.card_named(new_text)
        var card_element = card.element
        //console.log("card", card)
        //console.log("card_element", card_element)
        return card_element
      })
    }))
  }

  function _find_blank_in(context) {
    return context.findElement({css: 'g.blank'});
  }

  return external
}
module.exports = Shelf
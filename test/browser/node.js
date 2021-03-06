'use strict';
var webdriver = require('selenium-webdriver')
var Nodes = require('./nodes')
var _ = require('lodash')

function Node(element_finder, overrides) {
  var class_options = _.assign({ type: 'node'}, overrides)
  var type = class_options.type

  function element() {
    return element_finder()
  }

  function find(locator, extras) {
    let options = extras || {}
    var type = options.as || Node;
    var parent = options.parent;
    var element_finder = () => { return element().findElement({css: locator}) };
    return type(element_finder, parent)
  }

  function all(locator, extras) {
    let options = extras || {}
    var collection_type = options.as || Nodes;
    let elements_finder = () => { return element().findElements({css: locator}) };
    return collection_type(elements_finder)
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

  function _selfie() {
    return () => { return external }
  }

  var external = {
    get text() {
      return element().then((el) => {
        return el.getText()
      })
    },
    get height() {
      return element().then(_height_getter())
    },
    get element() { return element() },
    all: all,
    find: find,
    _height_getter: _height_getter,
    _actions: _actions,
    _selfie: _selfie
  }

  return external
}
module.exports = Node

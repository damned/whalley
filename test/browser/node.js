'use strict';
var webdriver = require('selenium-webdriver')
var Nodes = require('./nodes')

class Node {
  constructor(element) {
    this.element = element
    this.type = 'node'
  }

  find(locator, extras) {
    return this._wrapped(this.element.findElement({css: locator}), Node, extras);
  }

  all(locator, extras) {
    return this._wrapped(this.element.findElements({css: locator}), Nodes, extras);
  }

  get text() {
    return this.element.then((el) => { return el.getText() })
  }

  // "private"

  _actions(el) {
    return new webdriver.ActionSequence(el.getDriver());
  }

  _selfie() {
    return () => { return this }
  }

  _wrapped(elements, default_type, extras) {
    let options = extras || {as: default_type}
    return new options.as(elements)
  }
}
module.exports = Node

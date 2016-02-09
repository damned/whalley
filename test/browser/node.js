'use strict';
var webdriver = require('selenium-webdriver')
var Nodes = require('./nodes')

class Node {
  constructor(element) {
    this.element = element
    this.type = 'node'
  }

  find(locator, extras) {
    let options = extras || {}
    var type = options.as || Node;
    var parent = options.parent;
    let element = this.element.findElement({css: locator});
    return new type(element, parent)
  }

  all(locator, extras) {
    let options = extras || {}
    var type = options.as || Nodes;
    let elements = this.element.findElements({css: locator});
    return new type(elements)
  }

  get text() {
    return this.element.then((el) => {
      console.log(el)
      return el.getText() })
  }

  get height() {
    return this.element.then(this._height_getter)
  }

  // "private"

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

  _selfie() {
    return () => { return this }
  }

  _menu_finder(context) {
    return () => {
      return context.findElement({css: 'g.options_menu'})
    }
  }
}
module.exports = Node

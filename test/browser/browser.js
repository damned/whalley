'use strict';
var webdriver = require('selenium-webdriver')

class Node {
  constructor(element) {
    this.element = element
  }
  find(locator, extras) {
    let options = extras || {as: Node}
    let type = options.as
    return new type(this.element.findElement(({css: locator})))
  }
  get text() {
    return this.element.getText()
  }
  then(success, failure) {
    return this.element.then(success, failure)
  }
}

class Card extends Node {

}

class Wall {
  constructor(context) {
    this.node = context.find('svg')
  }

  get card() {
    return this.node.find('g.card', {as: Card})
  }
}

class Page {
  constructor(browser) {
    this.browser = browser
  }

  title() {
    return this.browser.title()
  }

  wall() {
    return new Wall(this.browser.find('#wall'))
  }
}


class Browser {
  constructor() {
    this.base_uri = 'http://localhost:1234'
    this.driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();
  }
  start() {
    return this.driver.getWindowHandle()
  }
  find(locator) {
    return new Node(this.driver.findElement({css: locator}))
  }
  open(path) {
    this.driver.get(this.base_uri + path)
    return new Page(this)
  }
  title() {
    return this.driver.getTitle()
  }
  quit() {
    return this.driver.quit()
  }
}
module.exports = Browser

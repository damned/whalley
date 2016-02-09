'use strict';
var webdriver = require('selenium-webdriver')
var Node = require('./node')

class Menu extends Node {
  click_first() {
    return this.element.then((el) => {
      new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({
        x: 2,
        y: -2
      }).click().perform().then(function () {
        return this;
      })
    })
  }
}

module.exports = Menu
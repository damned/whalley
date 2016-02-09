'use strict';
var webdriver = require('selenium-webdriver')
var Node = require('./node')

class Menu extends Node {
  click_first() {
    console.log('1')
    this.element.then((el) => {
      console.log('2')
      return new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({
        x: 2,
        y: -2
      }).click().perform()
    }).then(() => {
      console.log('3')
      return this;
    })
    return this;
  }

  click_cancel() {
    return this.element.then((el) => {
      return this.height.then((height) => {
        return new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({
          x: 2,
          y: height-2
        }).click().perform()
      }).then(function () {
        return this;
      })
    })
  }
}

module.exports = Menu
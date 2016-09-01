"use strict";

var webdriver = require('selenium-webdriver')

module.exports = {
  to_enter: function(new_text) {
    let tab_to_lose_focus = '\t'
    let keys = new_text.split('')
    keys.push(tab_to_lose_focus)
    return keys;
  },
  select_all: function(actions) {
    return actions.keyDown(webdriver.Key.CONTROL).sendKeys('a').keyUp(webdriver.Key.CONTROL)
  }
}
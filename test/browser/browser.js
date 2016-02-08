'use strict';
var webdriver = require('selenium-webdriver')

class Node {
  constructor(element) {
    this.element = element
    this.type = 'node'
  }
  find(locator, extras) {
    let options = extras || {as: Node}
    let type = options.as
    return new type(this.element.findElement({css: locator}))
  }
  all(locator, extras) {
    let options = extras || {as: Node}
    let type = options.as
    let elements = this.element.findElements({css: locator})
    check(elements, 'all elements')
    // NB findElements returns promise of an array
    return new type(elements)
  }
  get text() {
    check(this.element, this.type + ' this.element')

    return this.element.then(function(el) {
      return webdriver.promise.fulfilled(el.getText());
    })
    return 'boom'
  }
}

class Nodes {
  constructor(promise_of_elements) {
    this.promise_of_elements = promise_of_elements
    this.child_type = Node
  }
  find_by_text(name) {
    check(this.promise_of_elements, "promise_of_elements")
    let search = webdriver.promise.defer();
    this.promise_of_elements.then(function(all_found) {
      console.log('actually all_found: ' + all_found.length)
      all_found.forEach(function(to_filter) {
        to_filter.getText().then(function(text) {
          if (text.startsWith(name)) {
            search.fulfill(to_filter)
          }
        }, (err) => {
          if (search.isPending() || !err.toString().startsWith('StaleElement')) {
            console.log("error getting text (name: " + name + ") while search.isPending is " + search.isPending() + ": " + err)
            throw err
          }
          else {
            console.log('ignoring stale element refs post-search')
          }
        })
      });
    })
    return new this.child_type(search.promise);
  }
}

class Menu extends Node {
  click_first() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({x:0, y:-2}).click().perform().then(function() {
        setTimeout(d.fulfill, 1000)
      })
    })
    return d.promise;
  }
}

class Card extends Node {
  constructor(element) {
    super(element)
    this.type = 'card'
  }
  click_menu() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({x:-30, y:-20}).click().sendKeys('a', 'b', 'c').perform().then(() => {
        el.getDriver().findElement({css: 'g.options_menu'}).then((menu_el) => {
          d.fulfill(menu_el)
        })
      })
    })
    return new Menu(d.promise);
  }
  drag() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      console.log('blah!')
      new webdriver.ActionSequence(el.getDriver()).dragAndDrop(el, {x: 100, y: 20 }).perform().then(() => {
          d.fulfill(this)
      })
    }, (err) => { console.log('err: ' + err)})
    return d.promise;
  }
  edit(text_to_add) {
    return this.element.then((el) => {
      console.log('blah 2!')
      let actions = new webdriver.ActionSequence(el.getDriver());
      actions.click(el).sendKeys.call(actions, text_to_add.split(''))
      return actions.perform().then(() => {
        console.log('wowsers 2!')
        return this
      })
    })
  }
}

class Cards extends Nodes {
  constructor(elements) {
    super(elements)
    this.child_type = Card
  }
}

class Shelf extends Node {
  drag_down() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      console.log('blah sehflf!')
      let height;
      el.getLocation().then((loc) => {
        console.log('loc: ' + JSON.stringify(loc))
      }).then(() => {
        el.getSize().then((size) => {
          console.log('size: ' + JSON.stringify(size))
          height = size.height;
        })
      }).then(() => {
        new webdriver.ActionSequence(el.getDriver())
            .mouseMove(el, {x: 2, y: height - 2 })
            .mouseDown()
            .mouseMove({x: 100, y: 400 })
            .mouseUp()
            .perform().then(() => {
          setTimeout(() => {d.fulfill(this)}, 2000)
        })
      })
    }, (err) => { console.log('err: ' + err)})
    return d.promise;
  }
  pull_out_card() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      console.log('pull out card!')
      el.getDriver().findElement({css: 'g.blank'}).then((blank_el) => {
        console.log('found blank!')
        new webdriver.ActionSequence(el.getDriver()).dragAndDrop(blank_el, {x:0, y:200}).click().sendKeys('n', 'e', 'w').perform().then(() => {
          setTimeout(() => {d.fulfill(this)}, 2000)
        })
      })
    }, (err) => { console.log('err: ' + err)})
    return d.promise;
  }
}

class Wall {
  constructor(context) {
    this.node = context.find('svg')
  }

  get card() {
    return this.node.find('g.card', {as: Card})
  }

  get shelf() {
    return this.node.find('g#shelf', {as: Shelf})
  }

  card_named(name) {
    var cards = this.node.all('g.card', {as: Cards});
    return cards.find_by_text(name);
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

function check(object, name) {
  console.log(name + ' raw: '    + object)
  console.log(name + ': '    + Object.prototype.toString(object))
  console.log(name + ' length: '    + object.length)
  console.log(name + ' then: '    + object.then)
  console.log(name + ' findElement: '    + object.findElement)
  console.log(name + ' is promise: '    + webdriver.promise.isPromise(object))
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
    console.log("quitting... " + this.driver)
    return this.driver.quit()
  }
}
module.exports = Browser

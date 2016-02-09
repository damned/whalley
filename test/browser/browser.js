'use strict';
var webdriver = require('selenium-webdriver')
var promise = webdriver.promise;

class Node {
  constructor(element) {
    this.element = element
    this.type = 'node'
  }
  find(locator, extras) {
    return this.wrapped(this.element.findElement({css: locator}), Node, extras);
  }
  all(locator, extras) {
    return this.wrapped(this.element.findElements({css: locator}), Nodes, extras);
  }

  wrapped(elements, default_type, extras) {
    let options = extras || {as: default_type}
    return new options.as(elements)
  }

  get text() {
    return this.element.then((el) => { return el.getText() })
  }
}

class Nodes {
  constructor(elements_promise) {
    this.elements = elements_promise
    this.child_type = Node
  }

  find_by_text(name) {
    return new this.child_type(this._element_by_text(name));
  }

  _element_by_text(name) {
    return this._element_with_value('getText', (t) => { return t.startsWith(name) });
  }

  _elements_and_values(getter) {
    return this._resolved_elements().then(function (all_found) {
      return all_found.map((el) => {
        return el[getter].apply(el).then((value) => {
          return {el: el, value: value}
        })
      })
    }).then(promise.all);
  }

  _element_with_value(value_getter, value_matcher) {
    return this._elements_and_values(value_getter).then((values) => {
      return values.find((el_and_value) => {
        return value_matcher(el_and_value.value)
      }).el
    });
  }

  _resolved_elements() {
    return this.elements.then(promise.all);
  }
}

class Menu extends Node {
  click_first() {
    return this.element.then((el) => {
      new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({x:2, y:-2}).click().perform().then(function() {
        return this;
      })
    })
  }
}

class Card extends Node {
  constructor(element) {
    super(element)
    this.type = 'card'
  }

  click_menu() {
    return new Menu(this.element.then((el) => {
      return this._click_menu_actions(el).perform().then(this._menu_finder(el.getDriver()))
    }));
  }

  drag() {
    return this.element.then((el) => {
      return this._actions(el).dragAndDrop(el, {x: 100, y: 20 }).perform()
    }).then(() => {
      return this
    })
  }

  edit(text_to_add) {
    return this.element.then((el) => {
      var actions = this._actions(el);
      return actions.click(el).sendKeys.call(actions, text_to_add.split('')).perform()
    }).then(() => {
      return this
    })
  }

  // "private"

  _menu_finder(context) {
    return () => {
      return context.findElement({css: 'g.options_menu'})
    }
  }
  _click_menu_actions(el) {
    return this._actions(el).mouseMove(el).mouseMove({x: -30, y: -20}).click();
  }

  _actions(el) {
    return new webdriver.ActionSequence(el.getDriver());
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
          d.fulfill(this)
        })
      })
    })
    return d.promise;
  }
  pull_out_card() {
    let d = webdriver.promise.defer();
    this.element.then((el) => {
      console.log('pull out card!')
      el.getDriver().findElement({css: 'g.blank'}).then((blank_el) => {
        console.log('found blank!')
        new webdriver.ActionSequence(el.getDriver()).dragAndDrop(blank_el, {x:0, y:200}).click().sendKeys('n', 'e', 'w').perform().then(() => {
          d.fulfill(this)
        })
      })
    })
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

  wait_for_wall() {
    return this.browser.wait_for('.wall_status.ready')
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
  wait_for(selector) {
    return this.driver.wait(() => {
      return webdriver.until.elementLocated({css:selector});
    }, 20000)
  }
}
module.exports = Browser

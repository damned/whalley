'use strict';
var wd = require('webdriver-sync');
var ChromeDriver = wd.ChromeDriver;

class Node {
  constructor(element) {
    this.element = element
    this.type = 'node'
  }
  find(locator, extras) {
    let options = extras || {as: Node}
    let type = options.as
    return new type(this.findElement(locator))
  }

  all(locator, extras) {
    let options = extras || {as: Nodes}
    let type = options.as
    let elements = this.findElements(locator)
    return new type(elements)
  }

  get text() {
    return this.element.getText()
  }

  findElement(css) {
    return this.element.findElement(wd.By.cssSelector(css));
  }
  findElements(css) {
    return this.element.findElements(wd.By.cssSelector(css));
  }
}

class Nodes {
  constructor(elements) {
    this.elements = elements
    this.child_type = Node
  }
  find_by_text(name) {
    return new this.child_type(this.elements.find((el) => {
      return el.getText().startsWith(name)
    }))
  }
}

class Menu extends Node {
  click_first() {
    console.log('click first...')
    return this.element.then((el) => {
      console.log('ready to click first')
      new webdriver.ActionSequence(el.getDriver()).mouseMove(el).mouseMove({x:0, y:-2}).click().perform().then(function() {
        console.log('done click first')
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
          d.fulfill(this)
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

class Browser {
  constructor() {
    this.base_uri = 'http://localhost:1234'
    this.driver = new ChromeDriver();
  }
  start() {
    return this.driver.getWindowHandle()
  }
  find(locator) {
    return new Node(this.driver.findElement(wd.By.cssSelector(locator)))
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

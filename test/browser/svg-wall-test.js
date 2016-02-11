'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')

var webdriver = require('selenium-webdriver')

describe('svg wall', function() {
  const wall_name = 'temp-test-wall';
  var browser, page
  this.timeout(3000)

  before(() => {
    browser = new Browser()

    return browser.start()
  })

  before(() => {
    page = browser.open_wall(wall_name)
  })

  after(() => {
    return browser.quit()
  })

  it('displays a new empty wall', (done) => {
    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().cards.size).to.eventually.equal(0).notify(done)
  })

  it('allows card to be added', (done) => {
    page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card();
      expect(new_card.text).to.eventually.equal('new').notify(done)
    })
  })

  it('allows card to be edited', (done) => {
    var card = page.wall().card_named('new');
    card.edit('updated ').then((edited) => {
      expect(edited.text).to.eventually.include('updated').notify(done)
    })
  })

  it('card menu can be cancelled', (done) => {
    var card = page.wall().card_named('updated new');
    card.click_menu().sub_menu('change colour').then((menu) => {
      expect(menu.has_gone).to.eventually.equal(false)
      menu.select('cancel')
      expect(menu.has_gone).to.eventually.equal(true).notify(done)
    })
  })

  let start = capturer()

  it('allows card to be dragged', (done) => {
    var card = page.wall().card_named('updated new');
    card.location.then(start.capture())
    card.drag({x:50, y:20})
    card.location.then((finish) => {
      expect(finish.x).to
        .equal(start.value.x + 50)
      done()
    })
  })

  it('card displays a menu', (done) => {
    var card = page.wall().card_named('updated new');
    card.click_menu().sub_menu('change colour').then((menu) => {
      menu.select('pink')
      expect(card.colour).to.eventually.equal('rgba(255, 192, 203, 1)')
      done()
    })
  })

})


function check(object, name) {
  console.log(name + ' raw: '    + object)
  console.log(name + ': '    + Object.prototype.toString(object))
  console.log(name + ' length: '    + object.length)
  console.log(name + ' then: '    + object.then)
  console.log(name + ' findElement: '    + object.findElement)
  console.log(name + ' is promise: '    + webdriver.promise.isPromise(object))
}

function capturer() {
  let captured
  return {
    capture: function() {
      return (value) => {
        captured = value
      }
    },
    get value() {
      return captured
    }
  }
}


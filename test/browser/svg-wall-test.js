'use strict';

require('should')
var chai = require('chai')
var expect = chai.expect
chai.use(require('chai-as-promised'))
var Browser = require('./browser')
var Store = require('../../lib/server/wall-stores.js').Store

var webdriver = require('selenium-webdriver')

require('shelljs/global')

var child = require('child_process')
var app = child.spawn('nodejs', ['whalley-node-app.js', '--noauth'])
app.on('error', (err) => {
  console.log('Error running app process while testing: ' + err);
});
process.on('exit', function() {
  echo('Exiting, attempting to kill app, pid: ' + app.pid)
  app.stdin.end()
  app.kill();
  echo('Done')
});

class User {
  add_card(page, text) {
    return page.wall().shelf.drag_down().then((shelf) => {
      var new_card = shelf.pull_out_card();
      return new_card.edit(text)
    })
  }
}

describe('svg wall', function() {
  const wall_name = 'test-wall';
  var browser, page, captured, store, user
  var second_browser, second_page, second_user

  var existing_cards = [ 'existing to drag' ]

  this.timeout(10000)

  before(() => {
    browser = new Browser()
    user = new User()
    second_browser = new Browser({index: 1})
    second_user = new User()
    store = Store('.store/')
    return browser.start().then(function() {
      console.log('trying to start second browser')
      second_browser.start()
    })
})

  before(() => {
    page = browser.open_wall(wall_name)
    second_page = second_browser.open_wall(wall_name)
  })

  beforeEach(() => {
    captured = capturer()
  })

  after(() => {
    return browser.quit().then(function() {
      second_browser.quit() // need to watch out for es6 classes and 'this' it seems :/
                            // had problems doing ...then(second_browser.quit)
    })
  })

  it('displays the test wall', (done) => {
    expect(page.title()).to.eventually.equal('Whalley SVG Card Wall')
    expect(page.wall().cards.size).to.eventually.equal(existing_cards.length).notify(done)
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

  xit('allows card to be edited, persisting to server - currently cannot check this in browser tests cos not using persistence -> simplify auth/persistence?', (done) => {
    var card = page.wall().card_named('new');
    card.edit('updatagain').then((edited) => {
      expect(edited.text).to.eventually.include('updatagain').then(() => {
        //expect(store.read_wall('edit-session', '0.2').cards).to.equal({})
        done()
      })
    })
  })

  it('card menu can be cancelled', (done) => {
    user.add_card(page, 'to cancel').then((card) => {
      return card.click_menu().sub_menu('change colour')
    }).then((menu) => {
      expect(menu.has_gone).to.eventually.equal(false)
      menu.select('cancel')
      expect(menu.has_gone).to.eventually.equal(true).notify(done)
    })
  })

  it('allows card to be dragged', (done) => {
    user.add_card(page, 'to drag').then((card) => {
      card.location.then(capture('start'))
      card.drag({x: 50, y: 20})
      return card.location
    }).then((location) => {
      expect(location.x).to.equal(captured.start.x + 50)
      done()
    })
  })

  it('moves card on other browser', (done) => {
    var card = page.wall().card_named('existing to drag')
    var start_x;
    card.location.then((location) => {
      start_x = location.x
      card.drag({x: 40, y: 30})
      return second_page.wall().card_named('existing to drag').location
    }).then((other_location) => {
      expect(other_location.x).to.equal(start_x + 40)
      done()
    })
  })

  it('card displays a menu', (done) => {
    user.add_card(page, 'to be pink').then((card) => {
      card.click_menu().sub_menu('change colour').then((menu) => {
        menu.select('pink')
        expect(card.colour).to.eventually.equal('rgba(255, 192, 203, 1)')
        done()
      })
    })
  })

  function capture(name) {
    return captured.capture(name)
  }

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
  var captured = {
    capture: function(name) {
      if (name === 'capture') throw('cannot capture "capture" - conflicts with capture method')
      return (value) => {
        captured[name] = value
        return value
      }
    }
  }
  return captured
}


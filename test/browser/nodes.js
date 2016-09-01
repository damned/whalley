'use strict';
var Node = require('./node')
var webdriver = require('selenium-webdriver')
var promise = webdriver.promise;

class Nodes {
  constructor(elements_promise) {
    this.elements = elements_promise
    this.child_type = Node
  }

  find_by_text(name) {
    return new this.child_type(this._element_by_text(name));
  }

  _element_by_text(name) {
    return this._element_matching(
      (el) => { return el.getText() },
      (t) => { return t.startsWith(name) },
      "looking for element with text starting with '" + name + "'"
    );
  }

  _elements_and_values(getter) {
    return this._resolved_elements().then(function (all_found) {
      return all_found.map((el) => {
        return getter(el).then((value) => {
          return {el: el, value: value}
        }).thenCatch((err) => { console.log("caught cha !!!!! " + err) })
      })
    }).then(promise.all);
  }

  _element_matching(value_getter, value_matcher, description) {
    return this._elements_and_values(value_getter).then((values) => {
      var found = values.find((el_and_value) => {
        return value_matcher(el_and_value.value)
      });
      if (found == undefined) {
        throw new Error('did not find: ' + description +
          '\ngot values: ' + values.map((ev) => { return "'" + ev.value + "'" })
        )
      }
      return found.el
    });
  }

  _elements_matching(value_getter, value_matcher) {
    return this._elements_and_values(value_getter).then((values) => {
      return values.filter((el_and_value) => {
        return value_matcher(el_and_value.value)
      })
    }).then((matching) => { return matching.map((el_and_value) => { return el_and_value.el }) });
  }

  _resolved_elements() {
    return this.elements.then(promise.all);
  }
}
module.exports = Nodes
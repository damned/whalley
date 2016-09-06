'use strict';
var Node = require('./node')
var webdriver = require('selenium-webdriver')
var promise = webdriver.promise;
var _ = require('lodash')

function Nodes(elements_finder, overrides) {
  var options = _.assign({ child_type: Node }, overrides)
  var child_type = options.child_type

  var external = {
    find_by_text: find_by_text,
    elements_matching: elements_matching
  }

  function find_by_text(name) {
    return child_type(() => { return _element_by_text(name) });
  }

  function elements_matching(value_getter, value_matcher) {
    return _elements_and_values(value_getter).then((values) => {
      return values.filter((el_and_value) => {
        return value_matcher(el_and_value.value)
      })
    }).then((matching) => { return matching.map((el_and_value) => { return el_and_value.el }) });
  }

  function _element_by_text(name) {
    return _element_matching(
      (el) => { return el.getText() },
      (t) => { return t.startsWith(name) },
      "looking for element with text starting with '" + name + "'"
    );
  }

  function _elements_and_values(getter) {
    function try_once() {
      return _resolved_elements().then(function (all_found) {
        return all_found.map((el) => {
          return getter(el).then((value) => {
            return {el: el, value: value}
          })
        })
      }).then(promise.all)
    }
    return try_once().thenCatch((err) => {
      console.log("caught cha (probably stale reference exception?) !!!!! doing basic retry...... " + err)
      return try_once()
    });
  }

  function _element_matching(value_getter, value_matcher, description) {
    return _elements_and_values(value_getter).then((values) => {
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

  function _resolved_elements() {
    return elements_finder().then(promise.all);
  }

  return external
}
module.exports = Nodes
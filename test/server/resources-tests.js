require('should');
var chai = require('chai');
var expect = chai.expect;

var resources = require('../../lib/server/resources');
var response = {};
var match_handler;
var result, url;
var method;

describe('resources', function() {
  describe('MethodUrlStartsWithHandler', function() {
    beforeEach(function() {
      match_handler = function() {
        match_handler.called = true;
      };
      match_handler.called = false;
      method = 'GET';
      handler = new resources.MethodUrlStartsWithHandler(method, '/the_prefix', match_handler);
    });
    context('url starts with prefix', function() {
      beforeEach(function() {
        url = '/the_prefix/the_rest_of_url';
      });
      context('is of the specified request method', function() {
        beforeEach(function() {
          result = handler.handle({
            url: url,
            method: method
          }, response)
        });
        it('returns true', function() {
          expect(result).to.be.true
        });
        it('calls the match_handler', function() {
          expect(match_handler.called).to.be.true
        });
      })
      context('is not the specified request method', function() {
        beforeEach(function() {
          result = handler.handle({
            url: url,
            method: 'NOT' + method
          }, response)
        });
        it('returns false', function() {
          expect(result).to.be.false
        });
        it('does not call the match_handler', function() {
          expect(match_handler.called).to.be.false
        });
      })
    });
    context('url does not start with prefix', function() {
      beforeEach(function() {
        result = handler.handle({
          url: '/not_the_prefix/the_rest_of_url',
          method: method
        }, response)
      });

      it('returns false', function() {
        expect(result).to.be.false
      });
      it('does not call the match_handler', function() {
        expect(match_handler.called).to.be.false
      });
    });
  });
});

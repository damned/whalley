require('should');
var chai = require('chai');
var expect = chai.expect;

var resources = require('../../lib/server/resources');
var response = {};
var match_handler;
var result, url;

describe('resources', function() {
  describe('GetUrlStartsWithHandler', function() {
    beforeEach(function() {
      match_handler = function() {
        match_handler.called = true;
      };
      match_handler.called = false;
      handler = new resources.GetUrlStartsWithHandler('/the_prefix', match_handler);
    });
    context('url starts with prefix', function() {
      beforeEach(function() {
        url = '/the_prefix/the_rest_of_url';
      });
      context('is a GET request', function() {
        beforeEach(function() {
          result = handler.handle({
            url: url,
            method: 'GET'
          }, response)
        });
        it('returns true', function() {
          expect(result).to.be.true
        });
        it('calls the match_handler', function() {
          expect(match_handler.called).to.be.true
        });
      })
      context('is not a GET request', function() {
        beforeEach(function() {
          result = handler.handle({
            url: url,
            method: 'POST'
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
          url: '/not_the_prefix/the_rest_of_url'
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

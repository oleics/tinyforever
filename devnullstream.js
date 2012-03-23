var util = require('util'),
    stream = require('stream');

var devNullStream = exports.devNullStream = function() {
  this.end = function() {};
  this.write = function () {};
};
util.inherits(devNullStream, stream.Stream);

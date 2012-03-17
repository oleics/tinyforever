var util = require('util'),
    stream = require('stream');

var devNullSteam = exports.devNullSteam = function() {
  this.end = function() {};
};
util.inherits(devNullSteam, stream.Stream);

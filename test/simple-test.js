
var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    tinyforever = require('../tinyforever');

var examplesDir = path.join(__dirname, 'examples');

vows.describe('tinyforever/monitor/simple').addBatch({
  'When using tinyforever': {
    'an instance of tinyforever.Monitor with valid options': {
      topic: new (tinyforever.Monitor)(path.join(examplesDir, 'server.js'), {
        max: 10,
        silent: true,
        options: [8090]
      }),
      "should have correct properties set": function (child) {
        assert.isArray(child.args);
        assert.equal(child.max, 10);
        assert.isTrue(child.silent);
        assert.isFunction(child.start);
        assert.isObject(child.data);
        assert.isFunction(child.stop);
      },
      "calling the restart() method in less than `minUptime`": {
        topic: function (child) {
          var that = this;
          child.once('start', function () {
            child.once('restart', that.callback.bind(this, null));
            child.restart();
          });
          child.start();
        },
        "should restart the child process": function (_, child, data) {
          assert.isObject(data);
          child.kill(true);
        }
      }
    }
  }
}).export(module);

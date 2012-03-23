/*
 * spin-test.js: Tests for spin restarts in tinyforever.
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    path = require('path'),
    vows = require('vows'),
    tinyforever = require('../tinyforever'),
    fork = require('child_process').fork;

var forkBatch = {
  "When using tinyforever": {
    "and spawning a script that uses `process.send()`": {
      "using the 'native' fork": {
        topic: function () {
          var script = path.join(__dirname, 'examples', 'process-send.js'),
              child;
          
          child = this.child = new (tinyforever.Monitor)(script, { silent: false, minUptime: 2000, max: 1, fork: true });

          child.on('message', this.callback.bind(null, null));
          child.start();
        },
        "should reemit the message correctly": function (err, msg) {
          assert.isObject(msg);
          assert.deepEqual(msg, { from: 'child' });
          this.child.child.kill();
        }
      }
    }
  }
}

var noForkBatch = {
	"Fork is skipped":{
		topic:true,
		"for node < 0.5.x":function () {}
	}
}

vows.describe('tinyforever/monitor/fork').addBatch(fork?forkBatch:noForkBatch
).export(module);


var spawn = require('child_process').spawn;
var async = require('async');

var tests = [
  './test/simple-test.js',
  './test/fork-test.js',
  './test/env-spawn-test.js',
  './test/signal-test.js',
  './test/spin-test.js'
];

runTests(tests, function(err) {
  if(err) {
    console.error(err.stack||err);
  } else {
    console.log('DONE');
  }
});

function runTests(files, cb) {
  async.forEachSeries(files, runTest, cb);
}

function runTest(f, cb) {
  console.log('\n== %s ==\n', f);
  var p = spawn(process.execPath, [f]);
  p.on('exit', function(code, signal) {
    if(code>0) {
      cb(new Error('Code '+code+', signal '+signal));
    } else {
      cb();
    }
  });
  p.stdout.pipe(process.stdout,{end:false});
  p.stderr.pipe(process.stderr,{end:false});
}


/*
  Original file:
  https://github.com/nodejitsu/forever/blob/546f83d439f8f56e76c6404cfc7ac67f9e559524/lib/forever/monitor.js
*/

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    devNullStream = require('./devnullstream').devNullStream,
    fork = require('child_process').fork;

var Monitor = exports.Monitor = function(script, options) {
  var self = this;
  options = options || {};
  
  this.silent = options.silent || false;
  this.killTTL = options.killTTL;
  this.max = options.max;
  
  this.fork = options.fork || false;
  
  this.minUptime = typeof options.minUptime !== 'number' ? 0 : options.minUptime;
  this.spinSleepTime = options.spinSleepTime || null;
  
  this.args = options.options || [];
  this.cwd = options.cwd || null;
  this.hideEnv = options.hideEnv || [];
  this._env = options.env || {};
  this._hideEnv = {};
  
  this.data = {};
  this.running = false;
  this.times = 0;
  
  this.command = options.command || null;
  
  this.hideEnv.forEach(function(key) {
    self._hideEnv[key] = true;
  });
  
  this.args.unshift(script);
};

util.inherits(Monitor, EventEmitter);

Monitor.prototype.trySpawn = function() {
  var self = this;
  try {
    if(this.fork && fork) {
      var child = fork(this.args[0], this.args.slice(1), {
        cwd: this.cwd,
        env: this._getEnv()
      }, function() {
        console.log('child exit');
      });
    } else {
      var child = spawn(this.command ? this.command : process.execPath, this.args, {
        cwd: this.cwd,
        env: this._getEnv()
      }, function() {
        //console.log('Hook exit: %s', hookPath);
      });
      var stdout = this.silent ? new devNullStream() : process.stdout;
      var stderr = this.silent ? new devNullStream() : process.stderr;
      
      child.stdout.on('data', function(data) {
        self.emit('stdout', data);
        stdout.write(data);
      });
      
      child.stderr.on('data', function(data) {
        self.emit('stderr', data);
        stderr.write(data);
      });
    }
    return child;
  } catch(err) {
    console.error(err.stack||err);
    return;
  }
};

Monitor.prototype.start = function(restart) {
  var self = this,
      child;
  
  if(this.running && !restart) {
    process.nextTick(function () {
      self.emit('error', new Error('Cannot start process that is already running.'));
    });
  }
  
  child = this.trySpawn();
  if (!child) {
    process.nextTick(function () {
      self.emit('error', new Error('Target script does not exist: ' + self.args[0]));
    });
    return this;
  }
  
  this.ctime = Date.now();
  this.child = child;
  this.running = true;
  
  process.nextTick(function () {
    self.emit(restart ? 'restart' : 'start', self, self.data);
  });
  
  function onMessage(msg) {
    self.emit('message', msg);
  }
  
  child.on('message', onMessage);
  
  child.on('exit', function (code, signal) {
    var spinning = Date.now() - self.ctime < self.minUptime;
    console.warn('TinyForever detected script exited with code: ' + code);
    child.removeListener('message', onMessage);
    
    function letChildDie() {
      self.running = false;
      self.forceStop = false;
      
      self.emit('exit', self, spinning);
    }

    function restartChild() {
      self.forceRestart = false;
      process.nextTick(function () {
        console.warn('TinyForever restarting script for ' + self.times + ' time');
        self.start(true);
      });
    }
    
    // restart
    self.times++;

    if (self.forceStop || (self.times >= self.max)
      || (spinning && typeof self.spinSleepTime !== 'number') && !self.forceRestart) {
      letChildDie();
    }
    else if (spinning) {
      setTimeout(restartChild, self.spinSleepTime);
    }
    else {
      restartChild();
    }
  });
  
  return this;
};

Monitor.prototype.restart = function() {
  this.forceRestart = true;
  return this.kill(false);
};

Monitor.prototype.stop = function() {
  return this.kill(true);
};

Monitor.prototype.kill = function(forceStop) {
  var self = this,
      child = this.child;

  if (!child || !this.running) {
    process.nextTick(function () {
      self.emit('error', new Error('Cannot stop process that is not running.'));
    });
  } else {
    //
    // Set an instance variable here to indicate this
    // stoppage is forced so that when `child.on('exit', ..)`
    // fires in `Monitor.prototype.start` we can short circuit
    // and prevent auto-restart
    //
    if(forceStop) {
      this.forceStop = true;
      //
      // If we have a time before we truly kill forcefully, set up a timer
      //
      if (this.killTTL) {
        var timer = setTimeout(function () {
          try {
			// stupid fix for 0.4.x
			if (!self.fork) child.killed = false;
            child.kill('SIGKILL');
          }
          catch (e) {
            //conditions for races may exist, this is most likely an ESRCH
            //these should be ignored, and then we should emit that it is dead
          }          
          self.emit('stop');
        }, this.killTTL);
        
        child.on('exit', function () {
          clearTimeout(timer);  
        });
      }
    }
    
    try {
      child.kill();
    } catch(err) { }
    self.emit('stop');
  }
  return this;
};

Monitor.prototype._getEnv = function () {
  var self = this,
      merged = {};

  function addKey(key, source) {
    merged[key] = source[key];
  }

  //
  // Mixin the key:value pairs from `process.env` and the custom
  // environment variables in `this._env`.
  //
  Object.keys(process.env).forEach(function (key) {
    if (!self._hideEnv[key]) {
      addKey(key, process.env);
    }
  });

  Object.keys(this._env).forEach(function (key) {
    addKey(key, self._env);
  });

  return merged;
};

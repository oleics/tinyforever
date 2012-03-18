# tinyforever - limited replacement of forever

[forever](https://github.com/nodejitsu/forever) is huge.

[tinyforever](https://github.com/oleics/tinyforever) is lightweight.

## Install

``npm install tinyforever``

## Motivation

Initially created for [tinyhook](https://github.com/sergeyksv/tinyhook),
a lightweight alternative to [hook.io](https://github.com/hookio).

## forever compatibility notes

Projects using *tinyforever* can switch to *forever* at any time.

* only forever.Monitor
* only module-fork/spawn
* Properties
  * child
  * running
  * times
  * args
* Events
  * 'start'
  * 'restart'
  * 'stop'
  * 'message'
  * 'error'
* Options
  * silent
  * max
  * fork (node >= 0.5.1)
  * killTTL
  * minUptime
  * spinSleepTime
  * cwd
  * env
  * hideEnv
  * options

## MIT License

Copyright (c) Oliver Leics <oliver.leics@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
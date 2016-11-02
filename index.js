#!/usr/bin/env node

var hypercore = require('hypercore')
var swarm = require('hyperdrive-archive-swarm')
var level = require('level')
var minimist = require('minimist')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var home = process.env.HOME || process.env.USERPROFILE

var usage = fs.readFileSync(path.join(__dirname, 'usage.txt'), 'utf8')
var argv = minimist(process.argv.slice(2), {
  boolean: [ 'help', 'live' ],
  default: {live: true},
  alias: { help: 'h' }
})

var cmd = argv._[0]
var dir = argv._[1] && path.join(home, '.hypername', argv._[1])
var key = argv._[2]
var value = argv._[3]

if (argv.help || !dir) {
  console.log(usage)
  process.exit(argv.help ? 0 : 1)
}

mkdirp.sync(dir)
var core = hypercore(level(dir))

core._db.get('_key', {valueEncoding: 'binary'}, function (_, oldKey) {
  var feed = null

  if (cmd === 'init') {
    feed = core.createFeed(oldKey || key)
    feed.open(function () {
      core._db.put('_key', feed.key, function (err) {
        if (err) throw err
        console.log(feed.key.toString('hex'))
      })
    })
    return
  }

  if (!oldKey) throw new Error('No key found. Run `hypername init` first')

  feed = core.createFeed(oldKey)

  if (cmd === 'sync') {
    feed.open(function () {
      var blocks = feed.blocks
      swarm(feed)
      feed.on('download-finished', function () {
        console.log('Pulled ' + (feed.blocks - blocks) + ' change(s)')
        blocks = feed.blocks
        if (argv.live === false) process.exit(0)
      })
    })
  } else if (cmd === 'list' || cmd === 'ls') {
    parse(feed, {}, function (err, map) {
      if (err) throw err
      Object.keys(map).forEach(function (key) {
        console.log(key + ' = ' + map[key])
      })
    })
  } else if (cmd === 'get') {
    parse(feed, {}, function (err, view) {
      if (err) throw err
      if (view[key]) console.log(view[key])
      else process.exit(1)
    })
  } else if (cmd === 'set') {
    if (!key) throw new Error('key is required')
    feed.append(JSON.stringify({key: key, value: value || ''}), function (err) {
      if (err) throw err
    })
  } else {
    throw new Error('Usage: hypername <cmd> <topic> <options...>')
  }
})

function parse (feed, opts, cb) {
  var view = {}

  feed.createReadStream(opts)
    .on('data', function (data) {
      data = JSON.parse(data)
      view[data.key] = data.value
    })
    .on('end', function () {
      cb(null, view)
    })
    .on('error', function (err) {
      cb(err)
    })
}

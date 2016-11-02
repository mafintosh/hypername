# hypername

Distributed name server

```
npm install -g hypername
```

## Usage

On one computer

``` sh
hypername init my-topic
<prints-key>
```

On another

``` sh
hypername init my-topic <key-printed-above>
```

Now the first computer will be able to share name=value pairs with the other one

On the first computer do

``` sh
hypername set my-topic hello world
hypername sync my-topic
```

On the other

``` sh
hypername sync my-topic --exit # exit after first change
hypername get my-topic hello # prints world
```

## API
```txt
  Usage:
    $ hypername <command> [options]

  Commands:
    init <topic>                Initialize a hypername database.
    set <topic> <key> <value>   Save a value in the store
    get <topic> <key>           Get a value from the store
    list <topic>                List all key value-pairs
    sync <topic>                Connect to the swarm and synchronize data

    Options:
      -h, --help                Print usage
          --no-live             Exit after the first download

  Examples:
    $ hypername init my-topic         # start hypername & print key
    $ hypername set my-topic hi cat   # save a key-value pair
    $ hypername get my-topic hi       # get a value at a key
    $ hypername list my-topic         # list all key-value pairs
    $ hypername sync my-topic         # sync hypername over the network

  All data is stored in ~/.hypername/<topic>
```

## License

MIT

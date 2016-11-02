# hypername

Distributed name server

```
npm install -g hypername
```

## Usage

On one computer

``` sh
hypername init some.db
<prints-key>
```

On another

``` sh
hypername init some-other.db <key-printed-above>
```

Now the first computer will be able to share name=value pairs with the other one

On the first computer do

``` sh
hypername set some.db hello world
hypername sync some.db
```

On the other

``` sh
hypername sync some-other.db --exit # exit after first change
hypername get some-other.db hello # prints world
```

## License

MIT

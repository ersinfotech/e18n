# e18n
e18n for ers

## description

automatically use locales diretory in root dir. if not exits e18n will generate a startkit for you!

## install

```
  npm install --save e18n
```

## usage

```javascript
var app = express();

var e18n = require('e18n');

e18n.use(app); // have e18n before app.router


```

after server started, you can goto `/e18n` for web translation page

## client configuration

`note`: 

```javascript
resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__' // always should be set to this

```

please goto [i18next](https://github.com/i18next/i18next) for more infomation.

```html

script(src='e18n/i18next.js', type='text/javascript')

var options = {
    ns: { namespaces: ['ns.common', 'ns.special'], defaultNs: 'ns.special'},
    useLocalStorage: false,
    resGetPath: 'locales/resources.json?lng=__lng__&ns=__ns__',
    dynamicLoad: true,
    sendMissing: true,
    sendMissingTo: 'current'
};

```


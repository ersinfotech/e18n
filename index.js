// i18n solution for ersinfotech

var fs = require('fs');
var join = require('path').join;

var i18n = require('i18next');
var _ = require('underscore');
var fse = require('fs-extra');

var defaultWTOptions = {
  languages: ['dev'],
  namespaces: ['translation'],
  resGetPath: "locales/resources.json?lng=__lng__&ns=__ns__",
  resChangePath: 'locales/change/__lng__/__ns__',
  resRemovePath: 'locales/remove/__lng__/__ns__',
  fallbackLng: 'dev',
  dynamicLoad: true
};

var indexHTML = [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
    '<meta charset="utf-8">',
    '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',

    '<title>i18next - webtranslate</title>',

    '<!-- Application root. -->',
    '<base href="/">',

    '<!-- Application styles. -->',
    '<link rel="stylesheet" href="__path__/css/i18nextWT.css">',
  '</head>',

  '<body>',
    '<div class="header">',
      '<div class="header-inner"></div>',
    '</div>',

    '<div class="main">',
      '<div class="main-inner"></div>',
    '</div>',

    '<div class="footer">',
      '<div class="footer-inner"></div>',
    '</div>',

    '<!-- Application source. -->',
    '<script src="__path__/js/i18nextWT.js"></script>',
    '<script language="javascipt" type="text/javascript">',
      'i18nextWT_onready = function(wt) {',

        '__loadResources__',

        'wt.config(',
          'JSON.parse(\'__i18nextWTOptions__\')',
        ')',

        'wt.start();',
      '};',
    '</script>',
  '</body>',
  '</html>'
].join('\n')

function renderIndex (req, res, option) {
  var i18nextWTOptions = getWTOption();
  option.i18nextWTOptions = JSON.stringify(i18nextWTOptions);

  var html = indexHTML;
  html = html.replace('__i18nextWTOptions__', option.i18nextWTOptions);
  html = html.replace('__loadResources__', option.i18nextWTResources);
  html = html.replace(/__path__/g, option.i18nextWTPath);
  res.send(html);
}

function getLngAndNS (locales) {
  if (!fs.existsSync(locales)) fse.copySync(join(__dirname, '/locales'), locales);
  var languages = fs.readdirSync(locales);
  var namespaces = languages.map(function(d) { return fs.readdirSync(join(locales, d)); });

  namespaces = _.chain(namespaces)
    .flatten()
    .uniq()
    .filter(function(d) { return /.json$/.test(d); })
    .map(function(d) { return d.slice(0, -5) })
    .value();

  return {
    languages: languages,
    namespaces: namespaces
  };

}

function getOptionByPath (path) {
  var option = getLngAndNS(path);
  option = _.defaults(option, defaultWTOptions);

  return option;
}

function getWTOption () {
  var p = join(process.cwd(), '/locales');
  return getOptionByPath(p);
}

exports.use = function(route, app) {
  switch (arguments.length) {
    case 1: {
      app = route;
      route = '/e18n';
      exports.use(route, app);
      break;
    }
    case 2: {
      if (!app) throw Error('function(route, app) {}, app is missing');
      var i18nextWTOptions = getWTOption();

      exports.enable(app, {
        path: route,
        i18nextWTOptions: i18nextWTOptions,
        index: renderIndex

      });
    }

  }

};

exports.enable = function(app, option) {

  i18n.init();

  app.use(i18n.handle); // have i18n befor app.router

  i18n.registerAppHelper(app)
    .serveClientScript(app)
    .serveDynamicResources(app)
    .serveChangeKeyRoute(app)
    .serveRemoveKeyRoute(app)
    .serveMissingKeyRoute(app);

  i18n.serveWebTranslate(app, option);

};

exports.disable = function() {
  console.log('not implemented');
};

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

exports.use = function(route, app) {
  switch (arguments.length) {
    case 1: {
      option = route;
      route = '/e18n';
      exports.use(route, option);
      break;
    }
    case 2: {
      var p = join(process.cwd(), '/locales');
      if (!app) throw Error('function(route, app) {}, app is missing');

      var i18nextWTOptions = getOptionByPath(p);

      exports.enable(app, {
        path: route,
        i18nextWTOptions: i18nextWTOptions

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

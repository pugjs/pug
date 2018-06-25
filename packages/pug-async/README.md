<a href="https://pugjs.org"><img src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg" height="200" align="right"></a>
# Async Pug

This repository contains async implementation of Pug template engine.

Original synchronous calls to file system has been replaced by async versions.

It became possible to use database as source of pug-files.

### Package

via npm:

```bash
$ npm install pug-async
```

## API

```js
(async function () {

  var pug = require('pug-async');
  
  // compile
  var fn = await pug.compile('string of pug', options);
  var html = fn(locals);
  
  // render
  var html = await pug.render('string of pug', merge(options, locals));
  
  // renderFile
  var html = await pug.renderFile('filename.pug', merge(options, locals));

})().then(() => {}, err => { console.error(err); });
```

## License

MIT

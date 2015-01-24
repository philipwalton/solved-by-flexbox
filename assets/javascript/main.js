var analytics = require('./analytics');
var supports = require('./supports');


// Add an `is-legacy` class on browsers that don't supports flexbox.
if (!supports.flexbox()) {
  var div = document.createElement('div');
  div.className = 'Error';
  div.innerHTML = 'Your browser does not support Flexbox. ' +
                  'Parts of this site may not appear as expected.';

  body.insertBefore(div, body.firstChild);
}


// Track various interations with Google Analytics
analytics.track();

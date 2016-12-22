import * as analytics from './analytics';
import supports from './supports';


/**
 * The main script entry point for the site. Initalizes all the sub modules
 * analytics tracking, and the service worker.
 * @param {?Error} err Present if an error occurred loading the polyfills.
 */
function main(err) {
  // Add an `is-legacy` class on browsers that don't supports flexbox.
  if (!supports.flexbox()) {
    let div = document.createElement('div');
    div.className = 'Error';
    div.innerHTML = `Your browser does not support Flexbox.
                     Parts of this site may not appear as expected.`;

    document.body.insertBefore(div, document.body.firstChild);
  }

  // Delays running any analytics or registering the service worker
  // to ensure the don't compete for load resources.
  window.onload = function() {
    analytics.init();
    analytics.trackPageload();
    if (err) {
      analytics.trackError(err);
    }
  };
}


main();

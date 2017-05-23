import supports from './supports';


const POLYFILL_PATH = process.env.SBF_PUBLIC_PATH + 'polyfills.js';


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

  System.import('./analytics').then((analytics) => {
    analytics.init();
    if (err) {
      analytics.trackError(err);
    }
  });
}


/**
 * The primary site feature detect. Determines whether polyfills are needed.
 * @return {boolean} True if the browser supports all required features and
 *     no polyfills are needed.
 */
function browserSupportsAllFeatures() {
  return !!(window.Promise && window.Symbol);
}


/**
 * Creates a new `<script>` element for the passed `src`, and invokes the
 * passed callback once done.
 * @param {string} src The src attribute for the script.
 * @param {!Function<?Error>} done A callback to be invoked once the script has
 *     loaded, if an error occurs loading the script the function is invoked
 *     with the error object.
 */
function loadScript(src, done) {
  const js = document.createElement('script');
  js.src = src;
  js.onload = () => done();
  js.onerror = () => done(new Error('Failed to load script ' + src));
  document.head.appendChild(js);
}


if (browserSupportsAllFeatures()) {
  main();
} else {
  loadScript(POLYFILL_PATH, main);
}

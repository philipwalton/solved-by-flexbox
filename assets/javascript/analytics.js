import 'autotrack/lib/plugins/clean-url-tracker';
import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/max-scroll-tracker';
import 'autotrack/lib/plugins/media-query-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/page-visibility-tracker';
import 'autotrack/lib/plugins/social-widget-tracker';


/**
 * Bump this when making backwards incompatible changes to the tracking
 * implementation. This allows you to create a segment or view filter
 * that isolates only data captured with the most recent tracking changes.
 */
const TRACKING_VERSION = '2';


/**
 * A global list of tracker object, randomized to ensure no one tracker
 * data is always sent first.
 */
const ALL_TRACKERS = shuffleArray([
  {name: 't0', trackingId: 'UA-40829935-1'},
  {name: 'testing', trackingId: 'UA-40829935-4'}
]);


const TEST_TRACKERS = ALL_TRACKERS.filter(({name}) => /test/.test(name));
const NULL_VALUE = '(not set)';


const metrics = {
  PAGE_VISIBLE: 'metric1',
  MAX_SCROLL_PERCENTAGE: 'metric2',
};


const dimensions = {
  BREAKPOINT: 'dimension1',
  RESOLUTION: 'dimension2',
  ORIENTATION: 'dimension3',
  HIT_SOURCE: 'dimension4',
  URL_QUERY_PARAMS: 'dimension5',
  METRIC_VALUE: 'dimension6',
  CLIENT_ID: 'dimension7',
  HIT_TYPE: 'dimension8',
  HIT_TIME: 'dimension9',
  HIT_ID: 'dimension10',
  WINDOW_ID: 'dimension11',
  VISIBILITY_STATE: 'dimension12',
  TRACKING_VERSION: 'dimension13',
  PAGE_PATH: 'dimension14'
};


// The command queue proxies.
const gaAll = createGaProxy(ALL_TRACKERS);
const gaTest = createGaProxy(TEST_TRACKERS);


/**
 * Initializes all the analytics setup. Creates trackers and sets initial
 * values on the trackers.
 */
export function init() {
  createTrackers();
  trackErrors();

  trackCustomDimensions();
  requireAutotrackPlugins();
}


/**
 * Tracks the initial pageload and performance timing data associated with it.
 */
export function trackPageload() {
  sendInitialPageview();
}


/**
 * Tracks a JavaScript error.
 * @param {Error} err The error object to track.
 */
export function trackError(err) {
  gaAll('send', 'event', 'Script', 'error', err.stack || err.toString(), {
    nonInteraction: true,
  });
}


/**
 * Creates the trackers and sets the default transport and tracking
 * version fields. In non-production environments it also logs hits.
 */
function createTrackers() {
  for (let tracker of ALL_TRACKERS) {
    window.ga('create', tracker.trackingId, 'auto', tracker.name, {
      siteSpeedSampleRate: 10
    });
  }

  // Ensures all hits are sent via `navigator.sendBeacon()`.
  // Note: this cannot via the `create` command.
  gaAll('set', 'transport', 'beacon');

  // Log hits in non-production environments.
  if (process.env.NODE_ENV != 'production') {
    gaAll('set', 'sendHitTask', function(model) {
      var paramsToIgnore = ['v', 'did', 't', 'tid', 'ec', 'ea', 'el', 'ev',
          'a', 'z', 'ul', 'de', 'sd', 'sr', 'vp', 'je', 'fl', 'jid'];

      var hitType = model.get('&t');
      var hitPayload = model.get('hitPayload');
      var hit = hitPayload
          .split('&')
          .map(decodeURIComponent)
          .filter((item) => {
            const [param] = item.split('=');
            return !(param.charAt(0) === '_' ||
                paramsToIgnore.indexOf(param) > -1);
          });

      var parts = [model.get('&tid'), hitType];
      if (hitType == 'event') {
        parts = [
          ...parts,
          model.get('&ec'),
          model.get('&ea'),
          model.get('&el'),
        ];
        if (model.get('&ev')) parts.push(model.get('&ev'));
      }

      window['console'].log(...parts, hit);
    });
  }
}


/**
 * Tracks any errors that may have occured on the page prior to analytics being
 * initialized, then adds an event handler to track future errors.
 */
function trackErrors() {
  // Errors that have occurred prior to this script running are stored on
  // the `q` property of the window.onerror function.
  const errorQueue = window.onerror.q || [];

  // Override the temp `onerror()` handler to now send hits to GA.
  window.onerror = (msg, file, line, col, error) => {
    gaAll('send', 'event', {
      eventCategory: 'Script',
      eventAction: 'uncaught error',
      eventLabel: error ? error.stack : `${msg}\n${file}:${line}:${col}`,
      nonInteraction: true,
    });
  };

  // Replay any stored errors in the queue.
  for (let error of errorQueue) {
    window.onerror(...error);
  }
}


/**
 * Sets a default dimension value for all custom dimensions on all trackers.
 */
function trackCustomDimensions() {
  // Sets a default dimension value for all custom dimensions on all trackers.
  // This obviously must be done before setting any other custom dimensions.
  Object.keys(dimensions).forEach((key) => {
    gaAll('set', dimensions[key], NULL_VALUE);
  });

  // Adds tracking of dimensions known at page load time.
  gaTest((tracker) => {
    tracker.set({
      [dimensions.TRACKING_VERSION]: TRACKING_VERSION,
      [dimensions.CLIENT_ID]: tracker.get('clientId'),
      [dimensions.WINDOW_ID]: uuid(),
    });
  });

  // Adds tracking to record each the type, time, uuid, and visibility state
  // of each hit immediately before it's sent.
  gaTest((tracker) => {
    const originalBuildHitTask = tracker.get('buildHitTask');
    tracker.set('buildHitTask', (model) => {
      const path = model.get('page') || location.pathname;
      model.set(dimensions.PAGE_PATH, path),

      model.set(dimensions.HIT_TYPE, model.get('hitType'), true);
      model.set(dimensions.HIT_TIME, String(+new Date), true);
      model.set(dimensions.HIT_ID, uuid(), true);
      model.set(dimensions.VISIBILITY_STATE, document.visibilityState, true);
      originalBuildHitTask(model);
    });
  });
}


/**
 * Requires select autotrack plugins for each tracker.
 */
function requireAutotrackPlugins() {
  gaAll('require', 'cleanUrlTracker', {
    stripQuery: true,
    queryDimensionIndex: getDefinitionIndex(dimensions.URL_QUERY_PARAMS),
    indexFilename: 'index.html',
    trailingSlash: 'add',
  });
  gaAll('require', 'eventTracker');
  gaTest('require', 'maxScrollTracker', {
    sessionTimeout: 30,
    timeZone: 'America/Los_Angeles',
    maxScrollMetricIndex: getDefinitionIndex(metrics.MAX_SCROLL_PERCENTAGE),
  });
  gaAll('require', 'mediaQueryTracker', {
    definitions: [
      {
        name: 'Breakpoint',
        dimensionIndex: 1,
        items: [
          {name: 'xs', media: 'all'},
          {name: 'sm', media: '(min-width: 384px)'},
          {name: 'md', media: '(min-width: 576px)'},
          {name: 'lg', media: '(min-width: 768px)'}
        ]
      },
      {
        name: 'Resolution',
        dimensionIndex: 2,
        items: [
          {name: '1x',   media: 'all'},
          {name: '1.5x', media: '(-webkit-min-device-pixel-ratio: 1.5), ' +
                                '(min-resolution: 144dpi)'},
          {name: '2x',   media: '(-webkit-min-device-pixel-ratio: 2), ' +
                                '(min-resolution: 192dpi)'},
        ]
      },
      {
        name: 'Orientation',
        dimensionIndex: 3,
        items: [
          {name: 'landscape', media: '(orientation: landscape)'},
          {name: 'portrait',  media: '(orientation: portrait)'}
        ]
      }
    ]
  });
  gaAll('require', 'outboundLinkTracker');
  gaTest('require', 'pageVisibilityTracker', {
    visibleMetricIndex: getDefinitionIndex(metrics.PAGE_VISIBLE),
    sessionTimeout: 30,
    timeZone: 'America/Los_Angeles',
    fieldsObj: {[dimensions.HIT_SOURCE]: 'pageVisibilityTracker'},
  });
  gaAll('require', 'socialWidgetTracker');
}


/**
 * Sends the initial pageview.
 */
function sendInitialPageview() {
  gaAll('send', 'pageview', {[dimensions.HIT_SOURCE]: 'pageload'});
}


/**
 * Creates a ga() proxy function that calls commands on all but the
 * excluded trackers.
 * @param {Array} trackers an array or objects containing the `name` and
 *     `trackingId` fields.
 * @return {Function} The proxied ga() function.
 */
function createGaProxy(trackers) {
  return (command, ...args) => {
    for (let {name} of trackers) {
      if (typeof command == 'function') {
        window.ga(() => {
          command(window.ga.getByName(name));
        });
      } else {
        window.ga(`${name}.${command}`, ...args);
      }
    }
  };
}


/**
 * Accepts a custom dimension or metric and returns it's numerical index.
 * @param {string} definition The definition string (e.g. 'dimension1').
 * @return {number} The definition index.
 */
function getDefinitionIndex(definition) {
  return +/\d+$/.exec(definition)[0];
}


/**
 * Randomizes array element order in-place using Durstenfeld shuffle algorithm.
 * http://goo.gl/91pjZs
 * @param {Array} array The input array.
 * @return {Array} The randomized array.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}


/*eslint-disable */
// https://gist.github.com/jed/982883
const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};
/*eslint-enable */

import 'autotrack/lib/plugins/clean-url-tracker';
import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/max-scroll-tracker';
import 'autotrack/lib/plugins/media-query-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/page-visibility-tracker';
import 'autotrack/lib/plugins/social-widget-tracker';


/* global ga */


/**
 * The tracking ID for your Google Analytics property.
 * https://support.google.com/analytics/answer/1032385
 */
const TRACKING_ID = 'UA-40829935-1';

/**
 * Bump this when making backwards incompatible changes to the tracking
 * implementation. This allows you to create a segment or view filter
 * that isolates only data captured with the most recent tracking changes.
 */
const TRACKING_VERSION = '3';


/**
 * A default value for dimensions so unset values always are reported as
 * something. This is needed since Google Analytics will drop empty dimension
 * values in reports.
 */
const NULL_VALUE = '(not set)';


/**
 * A mapping between custom dimension names and their indexes.
 */
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
};


/**
 * A mapping between custom metric names and their indexes.
 */
const metrics = {
  PAGE_VISIBLE: 'metric1',
  MAX_SCROLL_PERCENTAGE: 'metric2',
  PAGE_LOADS: 'metric3',
};


/**
 * Initializes all the analytics setup. Creates trackers and sets initial
 * values on the trackers.
 */
export const init = () => {
  // Initialize the command queue in case analytics.js hasn't loaded yet.
  window.ga = window.ga || ((...args) => (ga.q = ga.q || []).push(args));

  createTracker();
  trackErrors();
  trackCustomDimensions();
  requireAutotrackPlugins();
};


/**
 * Tracks a JavaScript error with optional fields object overrides.
 * This function is exported so it can be used in other parts of the codebase.
 * E.g.:
 *
 *    `fetch('/api.json').catch(trackError);`
 *
 * @param {(Error|Object)=} err
 * @param {Object=} fieldsObj
 */
export const trackError = (err = {}, fieldsObj = {}) => {
  ga('send', 'event', Object.assign({
    eventCategory: 'Error',
    eventAction: err.name || '(no error name)',
    eventLabel: `${err.message}\n${err.stack || '(no stack trace)'}`,
    nonInteraction: true,
  }, fieldsObj));
};


/**
 * Creates the trackers and sets the default transport and tracking
 * version fields. In non-production environments it also logs hits.
 */
const createTracker = () => {
  ga('create', TRACKING_ID, 'auto', {
    siteSpeedSampleRate: 10
  });

  // Ensures all hits are sent via `navigator.sendBeacon()`.
  ga('set', 'transport', 'beacon');

  // Log hits in non-production environments.
  if (process.env.NODE_ENV != 'production') {
    ga('set', 'sendHitTask', function(model) {
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
};


/**
 * Tracks any errors that may have occured on the page prior to analytics being
 * initialized, then adds an event handler to track future errors.
 */
const trackErrors = () => {
  // Errors that have occurred prior to this script running are stored on
  // `window.__e.q`, as specified in `index.html`.
  const loadErrorEvents = window.__e && window.__e.q || [];

  const trackErrorEvent = (event) => {
    // Use a different eventCategory for uncaught errors.
    const fieldsObj = {eventCategory: 'Uncaught Error'};

    // Some browsers don't have an error property, so we fake it.
    const err = event.error || {
      message: `${event.message} (${event.lineno}:${event.colno})`,
    };

    trackError(err, fieldsObj);
  };

  // Replay any stored load error events.
  for (let event of loadErrorEvents) {
    trackErrorEvent(event);
  }

  // Add a new listener to track event immediately.
  window.addEventListener('error', trackErrorEvent);
};


/**
 * Sets a default dimension value for all custom dimensions on all trackers.
 */
const trackCustomDimensions = () => {
  // Sets a default dimension value for all custom dimensions to ensure
  // that every dimension in every hit has *some* value. This is necessary
  // because Google Analytics will drop rows with empty dimension values
  // in your reports.
  Object.keys(dimensions).forEach((key) => {
    ga('set', dimensions[key], NULL_VALUE);
  });

  // Adds tracking of dimensions known at page load time.
  ga((tracker) => {
    tracker.set({
      [dimensions.TRACKING_VERSION]: TRACKING_VERSION,
      [dimensions.CLIENT_ID]: tracker.get('clientId'),
      [dimensions.WINDOW_ID]: uuid(),
    });
  });

  // Adds tracking to record each the type, time, uuid, and visibility state
  // of each hit immediately before it's sent.
  ga((tracker) => {
    const originalBuildHitTask = tracker.get('buildHitTask');
    tracker.set('buildHitTask', (model) => {
      const qt = model.get('queueTime') || 0;
      model.set(dimensions.HIT_TIME, String(new Date - qt), true);
      model.set(dimensions.HIT_ID, uuid(), true);
      model.set(dimensions.HIT_TYPE, model.get('hitType'), true);
      model.set(dimensions.VISIBILITY_STATE, document.visibilityState, true);

      originalBuildHitTask(model);
    });
  });
};


/**
 * Requires select autotrack plugins and initializes each one with its
 * respective configuration options.
 */
const requireAutotrackPlugins = () => {
  ga('require', 'cleanUrlTracker', {
    stripQuery: true,
    queryDimensionIndex: getDefinitionIndex(dimensions.URL_QUERY_PARAMS),
    indexFilename: 'index.html',
    trailingSlash: 'add',
  });
  ga('require', 'eventTracker');
  ga('require', 'maxScrollTracker', {
    sessionTimeout: 30,
    timeZone: 'America/Los_Angeles',
    maxScrollMetricIndex: getDefinitionIndex(metrics.MAX_SCROLL_PERCENTAGE),
  });
  ga('require', 'mediaQueryTracker', {
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
  ga('require', 'outboundLinkTracker', {
    events: ['click', 'auxclick', 'contextmenu'],
  });
  ga('require', 'pageVisibilityTracker', {
    sendInitialPageview: true,
    pageLoadsMetricIndex: getDefinitionIndex(metrics.PAGE_LOADS),
    visibleMetricIndex: getDefinitionIndex(metrics.PAGE_VISIBLE),
    timeZone: 'America/Los_Angeles',
    fieldsObj: {[dimensions.HIT_SOURCE]: 'pageVisibilityTracker'},
  });
  ga('require', 'socialWidgetTracker');
};




/**
 * Accepts a custom dimension or metric and returns it's numerical index.
 * @param {string} definition The definition string (e.g. 'dimension1').
 * @return {number} The definition index.
 */
const getDefinitionIndex = (definition) => +/\d+$/.exec(definition)[0];


/**
 * Generates a UUID.
 * https://gist.github.com/jed/982883
 * @param {string|undefined=} a
 * @return {string}
 */
const uuid = function b(a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) :
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
};

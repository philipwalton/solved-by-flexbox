import 'autotrack/lib/plugins/clean-url-tracker';
import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/media-query-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/page-visibility-tracker';
import 'autotrack/lib/plugins/social-widget-tracker';


import {
  getStoredData,
  getStoredTrackerData,
  setStoredData,
  setStoredTrackerData
} from './analytics-storage';


/**
 * A global list of tracker object, randomized to ensure no one tracker
 * data is always sent first.
 */
const ALL_TRACKERS = shuffleArray([
  {name: 't0', trackingId: 'UA-40829935-1'},
  {name: 'testing', trackingId: 'UA-40829935-4'}
]);
const PROD_TRACKERS = ALL_TRACKERS.filter(({name}) => !/test/.test(name));
const TEST_TRACKERS = ALL_TRACKERS.filter(({name}) => /test/.test(name));


const NULL_VALUE = '(not set)';


const metrics = {
  PAGE_VISIBLE: 'metric1',
  PAGE_HIDDEN: 'metric2'
};


const dimensions = {
  BREAKPOINT: 'dimension1',
  RESOLUTION: 'dimension2',
  ORIENTATION: 'dimension3',
  HIT_SOURCE: 'dimension4',
  URL_QUERY_PARAMS: 'dimension5',
  METRIC_VALUE: 'dimension6',
  CLIENT_ID: 'dimension7',
  PREVIOUS_HIT_INDEX: 'dimension8',
  PREVIOUS_HIT_PAYLOAD: 'dimension9',
  HIT_TYPE: 'dimension10',
  HIT_UUID: 'dimension11'
};


// The command queue proxies.
let gaAll = createGaProxy(ALL_TRACKERS);
let gaProd = createGaProxy(PROD_TRACKERS);
let gaTest = createGaProxy(TEST_TRACKERS);


// Delays running any analytics until after the load event
// to ensure beacons don't block resources.
window.onload = function() {
  createTrackers();
  trackErrors();
  setDefaultDimensionValues();
  requirePlugins();
  trackClientId();
  initSessionControl();
  sendInitialPageview();
};


function createTrackers() {
  let fields = {siteSpeedSampleRate: 10};
  let data = getStoredData();
  for (let tracker of PROD_TRACKERS) {
    window.ga('create', tracker.trackingId, 'auto', tracker.name, fields);
  }
  window.ga(function() {
    let tracker = window.ga.getAll()[0];
    data.clientId = tracker.get('clientId') || data.clientId;
    setStoredData(data);

    for (let tracker of TEST_TRACKERS) {
      if (data.clientId) fields.clientId = data.clientId;
      if (window.localStorage) fields.storage = 'none';
      window.ga('create', tracker.trackingId, 'auto', tracker.name, fields);
    }
  });
}


function trackErrors() {
  // Errors that have occurred prior to this script running are stored on
  // the `q` property of the window.onerror function.
  let errorQueue = window.onerror.q || [];

  // Override the temp `onerror()` handler to now send hits to GA.
  window.onerror = function(msg, file, line, col, error) {
    gaAll('send', 'event', {
      eventCategory: 'Script',
      eventAction: 'uncaught error',
      eventLabel: error ? error.stack : `${msg}\n${file}:${line}:${col}`
    });
  };

  // Replay any stored errors in the queue.
  for (let error of errorQueue) {
    window.onerror(...error);
  }
}


function setDefaultDimensionValues() {
  Object.keys(dimensions).forEach((key) => {
    gaAll('set', dimensions[key], NULL_VALUE);
  });
}


function requirePlugins() {
  gaAll('require', 'cleanUrlTracker', {
    stripQuery: true,
    queryDimensionIndex: getDefinitionIndex(dimensions.URL_QUERY_PARAMS),
    indexFilename: 'index.html',
    trailingSlash: 'add'
  });
  gaProd('require', 'eventTracker');
  gaProd('require', 'mediaQueryTracker', {
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
  gaProd('require', 'pageVisibilityTracker', {
    visibleMetricIndex: getDefinitionIndex(metrics.PAGE_VISIBLE),
    hiddenMetricIndex: getDefinitionIndex(metrics.PAGE_HIDDEN),
    fieldsObj: {
      nonInteraction: null, // Ensure all events are interactive.
      [dimensions.HIT_SOURCE]: 'pageVisibilityTracker'
    },
    hitFilter: function(model) {
      model.set(dimensions.METRIC_VALUE, String(model.get('eventValue')), true);
    }
  });
  gaProd('require', 'socialWidgetTracker');
}


function trackClientId() {
  gaAll(function(tracker) {
    let clientId = tracker.get('clientId');
    tracker.set(dimensions.CLIENT_ID, clientId);
  });
}


function initSessionControl() {
  gaTest(function(tracker) {
    let originalBuildHitTask = tracker.get('buildHitTask');
    let originalSendHitTask = tracker.get('sendHitTask');

    tracker.set('buildHitTask', function(model) {
      let name = tracker.get('name');
      let trackerData = getStoredTrackerData(name);

      model.set(dimensions.HIT_TYPE, model.get('hitType'), true);
      model.set(dimensions.HIT_UUID, uuid(), true);
      model.set(dimensions.PREVIOUS_HIT_INDEX,
          String(trackerData.index || 0), true);

      if (trackerData.payload) {
        model.set(
            dimensions.PREVIOUS_HIT_PAYLOAD, trackerData.payload, true);
      }

      // if (hasSessionTimedOut()) { /* Do something... */ }

      originalBuildHitTask(model);
    });

    tracker.set('sendHitTask', function(model) {
      let now = +new Date;
      let name = tracker.get('name');
      let trackerData = getStoredTrackerData(name);
      trackerData.index = (trackerData.index || 0) + 1;
      trackerData.time = trackerData.time || now;
      trackerData.payload = serializeHit(model);
      setStoredTrackerData(name, trackerData);

      originalSendHitTask(model);
    });

  });
}


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
  return function(command, ...args) {
    for (let {name} of trackers) {
      if (typeof command == 'function') {
        window.ga(function() {
          command(window.ga.getByName(name));
        });
      }
      else {
        window.ga(`${name}.${command}`, ...args);
      }
    }
  };
}


function serializeHit(model) {
  let hitType = model.get('hitType');
  let page = model.get('page');
  let hitSource = model.get(dimensions.HIT_SOURCE);

  let hit = {hitType, page};
  if (hitSource && hitSource != NULL_VALUE) hit.hitSource = hitSource;

  if (hit.hitType == 'event') {
    hit.eventCategory = model.get('eventCategory');
    hit.eventAction = model.get('eventAction');
    hit.eventLabel = model.get('eventLabel');
  }

  return Object.keys(hit)
      .map((key) => `${key}=${decodeURIComponent(hit[key])}`).join('&');
}


// Accepts a custom dimension or metric and returns it's numerical index.
function getDefinitionIndex(definition) {
  return +/\d+$/.exec(definition)[0];
}


/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * http://goo.gl/91pjZs
 * @param {Array} array The input array.
 * @return {Array} The randomized array.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}


/*eslint-disable */
// https://gist.github.com/jed/982883
const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)};
/*eslint-enable */
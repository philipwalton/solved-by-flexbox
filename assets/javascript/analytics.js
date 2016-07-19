import 'autotrack/lib/plugins/clean-url-tracker';
import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/media-query-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/page-visibility-tracker';
import 'autotrack/lib/plugins/social-widget-tracker';


/* global ga */


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
  CLIENT_ID: 'dimension7'
};


ga('create', 'UA-40829935-1', 'auto');


// Delays running any analytics until after the load event
// to ensure beacons don't block resources.
window.onload = function() {
  requirePlugins();
  trackClientId();
  sendInitialPageview();
};



function requirePlugins() {
  ga('require', 'cleanUrlTracker', {
    stripQuery: true,
    queryDimensionIndex: getDefinitionIndex(dimensions.URL_QUERY_PARAMS),
    indexFilename: 'index.html',
    trailingSlash: 'add'
  });
  ga('require', 'eventTracker');
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
  ga('require', 'outboundLinkTracker');
  ga('require', 'pageVisibilityTracker', {
    fieldsObj: {
      nonInteraction: null, // Ensure all events are interactive.
      [dimensions.HIT_SOURCE]: 'pageVisibilityTracker'
    },
    hitFilter: function(model) {
      model.set(dimensions.METRIC_VALUE, String(model.get('eventValue')), true);
    }
  });
  ga('require', 'socialWidgetTracker');
}


function trackClientId() {
  ga(function(tracker) {
    let clientId = tracker.get('clientId');
    tracker.set(dimensions.CLIENT_ID, clientId);
  });
}


function sendInitialPageview() {
  ga('send', 'pageview', {[dimensions.HIT_SOURCE]: 'pageload'});
}


// Accepts a custom dimension or metric and returns it's numerical index.
function getDefinitionIndex(dimension) {
  return +dimension.slice(-1);
}

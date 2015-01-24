/* global ga */

var linkClicked = require('./link-clicked');
var parseUrl = require('./parse-url');


var breakpoints = {
  xs: '(max-width: 383px)',
  sm: '(min-width: 384px) and (max-width: 575px)',
  md: '(min-width: 576px) and (max-width: 767px)',
  lg: '(min-width: 768px)'
};


function trackBreakpoints() {
  // Do nothing in browsers that don't support `window.matchMedia`.
  if (!window.matchMedia) return;

  // Prevent rapid breakpoint changes from all firing at once.
  var timeout;

  Object.keys(breakpoints).forEach(function(breakpoint) {
    var mql = window.matchMedia(breakpoints[breakpoint]);

    // Set the initial breakpoint on pageload.
    if (mql.matches) {
      ga('set', 'dimension1', breakpoint);
    }

    // Update the breakpoint as the matched media changes, and send an event.
    mql.addListener(function(mql) {
      if (mql.matches) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          ga('set', 'dimension1', breakpoint);
          ga('send', 'event', 'Breakpoint', 'change', breakpoint);
        }, 1000);
      }
    });
  });
}


function trackOutboundLinks() {
  linkClicked(function() {

    // Ignore outbound links on social buttons.
    if (this.getAttribute('data-social-network')) return;

    if (isLinkOutbound(this)) {
      // Opening links in an external tabs allows the ga beacon to send.
      // When following links directly, sometimes they don't make it.
      this.target = '_blank';

      ga('send', 'event', 'Outbound Link', 'click', this.href);
    }
  });
}


function trackSocialInteractions() {
  linkClicked(function() {
    var socialNetwork = this.getAttribute('data-social-network');
    if (socialNetwork) {
      var socialAction = this.getAttribute('data-social-action');
      var socialTarget = location.href;

      // Opening links in an external tab allows the ga beacon to send.
      // When following links directly, sometimes they don't make it.
      this.target = '_blank';

      ga('send', 'social', socialNetwork, socialAction, socialTarget);
    }
  });
}


function isLinkOutbound(link) {
  var url = parseUrl(link.href);
  var loc = parseUrl(location.href);
  return url.origin != loc.origin;
}


module.exports = {
  track: function() {

    trackBreakpoints();
    trackOutboundLinks();
    trackSocialInteractions();

    ga('send', 'pageview');
  }
};

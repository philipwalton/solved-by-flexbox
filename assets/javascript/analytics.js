/* global ga */

import linkClicked from './link-clicked';
import parseUrl from './parse-url';


const breakpoints = {
  xs: '(max-width: 383px)',
  sm: '(min-width: 384px) and (max-width: 575px)',
  md: '(min-width: 576px) and (max-width: 767px)',
  lg: '(min-width: 768px)'
};


function trackBreakpoints() {
  // Do nothing in browsers that don't support `window.matchMedia`.
  if (!window.matchMedia) return;

  // Prevent rapid breakpoint changes from all firing at once.
  let timeout;

  Object.keys(breakpoints).forEach(function(breakpoint) {
    let mql = window.matchMedia(breakpoints[breakpoint]);

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
    let socialNetwork = this.getAttribute('data-social-network');
    if (socialNetwork) {
      let socialAction = this.getAttribute('data-social-action');
      let socialTarget = location.href;

      // Opening links in an external tab allows the ga beacon to send.
      // When following links directly, sometimes they don't make it.
      this.target = '_blank';

      ga('send', 'social', socialNetwork, socialAction, socialTarget);
    }
  });
}


function isLinkOutbound(link) {
  let url = parseUrl(link.href);
  let loc = parseUrl(location.href);
  return url.origin != loc.origin;
}


export default {
  track: function() {

    trackBreakpoints();
    trackOutboundLinks();
    trackSocialInteractions();

    ga('send', 'pageview');
  }
};

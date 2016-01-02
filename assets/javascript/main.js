import 'autotrack/lib/plugins/media-query-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/session-duration-tracker';
import 'autotrack/lib/plugins/social-tracker';


import supports from './supports';


// Add an `is-legacy` class on browsers that don't supports flexbox.
if (!supports.flexbox()) {
  let div = document.createElement('div');
  div.className = 'Error';
  div.innerHTML = `Your browser does not support Flexbox.
                   Parts of this site may not appear as expected.`;

  document.body.insertBefore(div, document.body.firstChild);
}

var addListener = require('./add-listener');

function isLink(el) {
  return el.nodeName && el.nodeName.toLowerCase() == 'a' && el.href;
}

function getLinkAncestor(el) {
  if (isLink(el)) return el;
  while (el.parentNode && el.parentNode.nodeType == 1) {
    if (isLink(el)) return el;
    el = el.parentNode;
  }
}

module.exports = function(fn) {
  addListener(document, 'click', function(event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var link = getLinkAncestor(target);
    if (link) {
      fn.call(link, e);
    }
  });
};

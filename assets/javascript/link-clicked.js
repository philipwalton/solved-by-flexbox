import addListener from './add-listener';

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

export default function(fn) {
  addListener(document, 'click', function(event) {
    let e = event || window.event;
    let target = e.target || e.srcElement;
    let link = getLinkAncestor(target);
    if (link) {
      fn.call(link, e);
    }
  });
}

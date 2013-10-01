// track clicks on outbound hyperlinks
;(function() {

  var links = document.getElementsByTagName("a")
    , link
    , i = 0
    , ga = window.ga

  function isLink(el) {
    return el.nodeName.toLowerCase() == "a" && el.href
  }

  function isExternalLink(el) {
    return el.href.indexOf(location.host) < 0
  }

  function getLinkAncestor(el) {
    if (isLink(el)) return el
    while (el.parentNode && el.parentNode.nodeType == 1) {
      if (isLink(el)) return el
      el = el.parentNode
    }
  }

  function logExternalClicks(event) {
    var e = event || window.event
      , target = e.target || e.srcElement
      , link = getLinkAncestor(target)
    if (link && isExternalLink(link)) {
      ga && ga("send", "event", "Outbound Link", link.href);
    }
  }

  // add target="_blank" to external links
  while(link = links[i++]) {
    if (link.target != "_blank" && isExternalLink(link)) {
      link.target = "_blank"
    }
  }

  // register logging on click events
  document.addEventListener("click", logExternalClicks)

}())

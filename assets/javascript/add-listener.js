module.exports = function(element, event, fn) {
  if (element.addEventListener) {
    element.addEventListener(event, fn, false);
  }
  else {
    element.attachEvent('on' + event, fn);
  }
};

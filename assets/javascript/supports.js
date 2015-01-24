var supports = {};
var style = document.body.style;

module.exports = {
  flexbox: function() {
    return supports.flexbox || (supports.flexbox = ('flexBasis' in style ||
        'msFlexAlign' in style || 'webkitBoxDirection' in style));
  }
};

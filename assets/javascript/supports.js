let supports = {};
let style = document.body.style;

export default {
  flexbox: function() {
    return supports.flexbox || (supports.flexbox = ('flexBasis' in style ||
        'msFlexAlign' in style || 'webkitBoxDirection' in style));
  }
};

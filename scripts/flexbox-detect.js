(function(body) {
  if (!('flexBasis' in body.style ||
        'webkitFlexBasis' in body.style ||
        'msFlexAlign' in body.style)) {

    var div = document.createElement('div');
    div.className = 'Error';
    div.innerHTML = 'Your browser does not support Flexbox. ' +
                    'Parts of this site may not appear as expected.';

    body.insertBefore(div, body.firstChild);
  }
}(document.body));

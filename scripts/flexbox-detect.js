;(function(body, div) {
  if (body.style.flex == null && body.style.webkitFlex == null) {
    div = document.createElement("div")
    div.className = "Error"
    div.innerHTML = "Your browser does not support Flexbox. Parts of this site may not appear as expected."
    body.insertBefore(div, body.firstChild)
  }
}(document.body))

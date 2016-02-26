---
template: default.html
title: Sticky Footer
excerpt: Getting your footer to stick to the bottom of sparsely contented pages has always been tricky. And if the footer's height is unknown, it's basically impossible. Not so anymore.
---

<div class="Demo Demo--spaced">

Click the button below to hide the contents of this page. Notice how the footer sticks to the bottom of the window even when there's not enough content to fill the page.

<button id="collapse-trigger" class="Button"><span class="icon-refresh u-spaceRS"></span> Toggle Contents</button>

</div>

<div id="collapsable-content">

Getting the footer to stick to the bottom of pages with sparse content is something just about every Web developer has tried to tackle at some point in his or her career. And, for the most part, it's a solved problem. Yet all the [existing solutions](http://ryanfait.com/resources/footer-stick-to-bottom-of-page/) have one significant shortcoming &mdash; they don't work if the height of your footer is unknown.

Flexbox is a perfect fit for this type of problem. While mostly known for laying out content in the horizontal direction, Flexbox actually works just as well for vertical layout problems. All you have to do is wrap the vertical sections in a flex container and choose which ones you want to expand. They'll automatically take up all the available space in their container.

In the example below, the container is set to the height of the window, and the content area is told to expand as needed. *(Note: in the vertical direction you need to specify a height for the container. This is different from the horizontal direction, which automatically expands to fit.)*

## The HTML

```xml
<body class="Site">
  <header>…</header>
  <main class="Site-content">…</main>
  <footer>…</footer>
</body>
```

## The CSS

```css
.Site {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.Site-content {
  flex: 1;
}
```

View the full [source](https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/components/site.css) for the `Site` component used in this demo on Github.

<aside class="Notice"><strong>Note:</strong>&nbsp; the CSS required to make this demo work cross-browser is slightly different from the CSS shown in the example above, which assumes a fully spec-compliant browser. See the <a href="https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/components/site.css">comments in the source</a> for more details.</aside>

</div>

<script class="js-allow-before-footer">
  (function() {
    var collapseTrigger = document.getElementById("collapse-trigger");
    var collapseableContent = document.getElementById("collapsable-content");
    var isCollapsed = false;
    collapseTrigger.addEventListener("click", function() {
      if (isCollapsed) {
        collapseableContent.classList.remove("u-hidden");
      } else {
        collapseableContent.classList.add("u-hidden");
      }
      isCollapsed = !isCollapsed;
    }, false);
  }());
</script>

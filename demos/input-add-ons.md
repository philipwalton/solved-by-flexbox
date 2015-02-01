---
template: default.html
title: Input Add-ons
excerpt: Creating full-width, fluid input/button pairs has been impossible for most of the history of CSS. With Flexbox it couldn't be easier.
---

Because of the way input sizing works in CSS, it's almost impossible to append or prepend another element to it and have the input field behave fluidly and take up the remaining space.

The only existing way to do this is to either know the exact width of the input, or to use something like `display:table-cell`, which has its own set of problems, most notably the difficulty with positioning anything absolutely inside of the add-on in certain browsers.

With Flexbox, all these problems go away, and the code is trivially simple. In addition, you get the input field and the input add-on to be the same height for free.

<div class="Grid Grid--guttersLg Grid--full med-Grid--fit">
  <div class="Grid-cell">
    <h2>Add-on Prepended</h2>
    <div class="InputAddOn">
      <span class="InputAddOn-item">Amount</span>
      <input class="InputAddOn-field">
    </div>
    <div class="InputAddOn">
      <button class="InputAddOn-item"><span class="icon icon-search"></span></button>
      <input class="InputAddOn-field">
    </div>
  </div>
  <div class="Grid-cell">
    <h2>Add-on Appended</h2>
    <div class="InputAddOn">
      <input class="InputAddOn-field">
      <button class="InputAddOn-item">Go</button>
    </div>
    <div class="InputAddOn">
      <input class="InputAddOn-field">
      <button class="InputAddOn-item"><span class="icon icon-star"></span></button>
    </div>
  </div>
</div>

## Appended and Prepended Add-ons

<div class="Grid Grid--guttersLg Grid--full med-Grid--fit">
  <div class="Grid-cell">
    <div class="InputAddOn">
      <span class="InputAddOn-item"><span class="icon icon-envelope"></span></span>
      <input class="InputAddOn-field" placeholder="Example One">
      <button class="InputAddOn-item">Send</button>
    </div>
  </div>
  <div class="Grid-cell">
    <div class="InputAddOn">
      <span class="InputAddOn-item"><span class="icon icon-lock"></span></span>
      <input class="InputAddOn-field" placeholder="Example One">
      <button class="InputAddOn-item">Encrypt</button>
    </div>
  </div>
</div>

## The HTML

```html
<!-- appending -->
<div class="InputAddOn">
  <input class="InputAddOn-field">
  <button class="InputAddOn-item">…</button>
</div>

<!-- prepending -->
<div class="InputAddOn">
  <span class="InputAddOn-item">…</span>
  <input class="InputAddOn-field">
</div>

<!-- both -->
<div class="InputAddOn">
  <span class="InputAddOn-item">…</span>
  <input class="InputAddOn-field">
  <button class="InputAddOn-item">…</button>
</div>
```

## The CSS

```css
.InputAddOn {
  display: flex;
}

.InputAddOn-field {
  flex: 1;
  /* field styles */
}

.InputAddOn-item {
  /* item styles */
}

```

View the full [source](https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/components/input-add-on.css) for the `InputAddOn` component used in this demo on Github.

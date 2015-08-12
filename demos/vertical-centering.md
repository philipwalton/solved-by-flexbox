---
template: default.html
title: Vertical Centering
excerpt: This classic problem has been challenging CSS hackers for years, yet none of the historical solutions have fully solved it. With Flexbox, it's finally possible.
---

The lack of good ways to vertically center elements in CSS has been a dark blemish on its reputation for pretty much its entire existence.

What makes matters worse is the techniques that do work for vertical centering are obscure and unintuitive, while the obvious choices (like `vertical-align:middle`) never seem to work when you need them.

The current landscape of [vertical centering options](http://css-tricks.com/centering-in-the-unknown/) ranges from negative margins to `display:table-cell` to ridiculous hacks involving full-height pseudo-elements. Yet even though these techniques sometimes get the job done, they don't work in every situation. What if the thing you want to center is of unknown dimensions and isn't the only child of its parent? What if you could use the pseudo-element hack, but you need those pseudo-elements for something else?

With Flexbox, you can stop worrying. You can align anything (vertically or horizontally) quite painlessly with the `align-items`, `align-self`, and `justify-content` properties.

<div class="Demo Demo--spaced u-ieMinHeightBugFix">
  <div class="Aligner">
    <div class="Aligner-item Aligner-item--fixed">
      <div class="Demo">
        <h3>I'm Centered!</h3>
        <p contenteditable="true">This box is both vertically and horizontally centered. Even if the text in this box changes to make it wider or taller, the box will still be centered. Go ahead, give it a try. Just click to edit the text.</p>
      </div>
    </div>
  </div>
</div>

Unlike some of the existing vertical alignment techniques, with Flexbox the presence of sibling elements doesn't affect their ability to be vertically aligned.

<div class="Demo Demo--spaced u-ieMinHeightBugFix">
  <div class="Aligner">
    <div class="Aligner-item Aligner-item--top">
      <div class="Demo"><strong>Top</strong></div>
    </div>
    <div class="Aligner-item">
      <div class="Demo"><strong>Centered</strong></div>
    </div>
    <div class="Aligner-item Aligner-item--bottom">
      <div class="Demo"><strong>Bottom</strong></div>
    </div>
  </div>
</div>

## The HTML

```html
<div class="Aligner">
  <div class="Aligner-item Aligner-item--top">…</div>
  <div class="Aligner-item">…</div>
  <div class="Aligner-item Aligner-item--bottom">…</div>
</div>
```

## The CSS

```css
.Aligner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.Aligner-item {
  max-width: 50%;
}

.Aligner-item--top {
  align-self: flex-start;
}

.Aligner-item--bottom {
  align-self: flex-end;
}
```

View the full [source](https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/components/aligner.css) for the `Aligner` component used in this demo on Github.

<aside class="Notice"><strong>Note:</strong>&nbsp; the markup and CSS required to make this demo work cross-browser is slightly different from what's shown in the examples above, which assume a fully spec-compliant browser. See the <a href="https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/utils/compat.css">comments in the source</a> for more details.</aside>

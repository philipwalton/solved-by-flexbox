---
template: default.html
title: Media Object
excerpt: Create media objects with fixed or varying figure sizes without worrying about overflow, clearfixing, or block formatting context hacks.
---

The [media object](http://www.stubbornella.org/content/2010/06/25/the-media-object-saves-hundreds-of-lines-of-code) is the poster-child of Object Oriented CSS</a> (OOCSS). Its simplicity and utility have converted many a CSS developer (myself included) to the OOCSS methodology.

But like most CSS layout techniques, the media object must resort to tricks and hacks to accomplish its goals.

The media object's body must prevent text from wrapping below the image by either creating a [block formatting context](http://www.stubbornella.org/content/2013/07/31/re-visiting-the-secret-power-of-block-fomatting-context/) or using a left margin/padding equal to the width of the image. The media object must also clearfix its body which requires either `overflow:hidden` or having to use the pseudo-elements.

With Flexbox these problems are solved. In addition, Flexbox allows us to vertically align the media object figure however we want. We can also easily align the figure to the right without needing to change the source order.

## Basic Examples

<div class="Grid Grid--guttersLg Grid--full large-Grid--fit">
  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media">
        <img class="Media-figure Image" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
        <div class="Media-body">
          <h3 class="Media-title">Standard Media Object</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ac nisl quis massa vulputate adipiscing. Vivamus sit amet risus ligula. Nunc eu pulvinar augue.</p>
        </div>
      </div>
    </div>
    <div class="Demo Demo--spaced">
      <div class="Media">
        <img class="Media-figure Image" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
        <div class="Media-body">
          <h3 class="Media-title">Standard Media Object</h3>
          <p>Donec imperdiet sem leo, id rutrum risus aliquam vitae. Cras tincidunt porta mauris, vel feugiat mauris accumsan eget.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media Media--reverse">
        <img class="Media-figure Image" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
        <div class="Media-body">
          <h3 class="Media-title">Media Object Reversed</h3>
          <p>Phasellus vel felis purus. Aliquam consequat pellentesque dui, non mollis erat dictum sit amet. Curabitur non quam dictum, consectetur arcu in, vehicula justo. Donec tortor massa, eleifend nec viverra in, aliquet at eros. Mauris laoreet condimentum mauris, non tempor massa fermentum ut. Integer gravida pharetra cursus. Nunc in suscipit nunc.</p>
        </div>
      </div>
    </div>
  </div>
</div>

## Non-images

<div class="Grid Grid--guttersLg Grid--full large-Grid--fit">
  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media">
        <figure class="Media-figure"><span class="icon-comments icon-big"></span></figure>
        <div class="Media-body">
          <h3 class="Media-title">Using Icons</h3>
          <p>Donec imperdiet sem leo, id rutrum risus aliquam vitae. Vestibulum ac turpis non lacus dignissim dignissim eu sed dui.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media Media--center">
        <figure class="Media-figure"><span class="icon-info-sign icon-big"></span></figure>
        <div class="Media-body">
          <h3 class="Media-title">Vertically Centering the Figure</h3>
          <p>Nunc nec fermentum dolor. Duis at iaculis turpis. Sed rutrum elit ac egestas dapibus. Duis nec consequat enim.</p>
        </div>
      </div>
    </div>
  </div>
</div>

## Nested Media Objects

<div class="Grid Grid--guttersLg Grid--full large-Grid--fit">
  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media">
        <img class="Media-figure Image" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
        <div class="Media-body">
          <h3 class="Media-title">Media Object Title</h3>
          <p>Phasellus vel felis purus. Aliquam consequat pellentesque dui, non mollis erat dictum sit amet. Curabitur non quam dictum, consectetur arcu in, vehicula justo.</p>
          <div class="Demo Demo--spaced u-smaller">
            <div class="Media">
              <figure class="Media-figure">
                <img class="Image Image--tiny" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
              </figure>
              <p class="Media-body">
                Mauris porta arcu id magna adipiscing lacinia at congue lacus. Vivamus blandit quam quis tincidunt egestas. Etiam posuere lectus sed sapien malesuada molestie.
              </p>
            </div>
          </div>
          <div class="Demo Demo--spaced u-smaller">
            <div class="Media">
              <figure class="Media-figure">
                <img class="Image Image--tiny" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
              </figure>
              <div class="Media-body">
                <p>Vestibulum ac turpis non lacus dignissim dignissim eu sed dui. Proin a ligula sit amet massa malesuada mattis eu a ante. Nunc porttitor sed quam quis sollicitudin. Vestibulum ac turpis non lacus dignissim dignissim eu sed dui.</p>
                <div class="Media Media--center">
                  <span class="Media-figure icon-thumbs-up-alt"></span>
                  <p class="Media-body">Rutrum risus aliquam vitae.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="Grid-cell">
    <div class="Demo Demo--spaced">
      <div class="Media">
        <img class="Media-figure Image" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
        <div class="Media-body">
          <h3 class="Media-title">Media Object Title</h3>
          <p>Phasellus vel felis purus. Aliquam consequat pellentesque dui, non mollis erat dictum sit amet. Curabitur non quam dictum, consectetur arcu in, vehicula justo. Donec tortor massa, eleifend nec viverra in, aliquet at eros. Mauris laoreet condimentum mauris, non tempor massa fermentum ut.</p>
          <div class="Media Media--center u-smaller">
            <span class="Media-figure icon-thumbs-up-alt"></span>
            <p class="Media-body">Donec imperdiet sem leo, id rutrum risus aliquam vitae.</p>
          </div>
          <div class="Demo Demo--spaced u-smaller">
            <div class="Media">
              <figure class="Media-figure">
                <img class="Image Image--tiny" src="{{ site.baseUrl }}images/kitten.jpg" alt="Kitten">
              </figure>
              <p class="Media-body">
                Mauris porta arcu id magna adipiscing lacinia at congue lacus. Vivamus blandit quam quis tincidunt egestas. Etiam posuere lectus sed sapien malesuada molestie. Aliquam vitae pharetra dolor. Nullam non mattis nunc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

## The HTML

```html
<div class="Media">
  <img class="Media-figure" src="" alt="">
  <p class="Media-body">&hellip;</p>
</div>
```

## The CSS

```css
.Media {
  display: flex;
  align-items: flex-start;
}

.Media-figure {
  margin-right: 1em;
}

.Media-body {
  flex: 1;
}
```

View the full [source](https://github.com/philipwalton/solved-by-flexbox/blob/master/assets/css/components/media.css) for the `Media` component used in this demo on Github.

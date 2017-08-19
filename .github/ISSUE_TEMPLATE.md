<!-- For bugs and feature request, please fillin the following -->
<!-- For general questions, please use the pug tag on stack overflow: -->
<!-- https://stackoverflow.com/questions/tagged/pug -->

**Pug Version:** your version number here

**Node Version:** your version number here

## Input JavaScript Values

```js
pug.renderFile('input.pug', {
  whatIsIt: 'language',
});
```

## Input Pug

```pug
h1 I Love Pug
p It's a great #{whatIsIt}
```

## Expected HTML

```html
<h1>I Love Pug</h1>
<p>It's a great language</p>
```

## Actual HTML

```html
<h1>I Love Pug</h1>
<p>It's a great language</p>
```

## Additional Comments

<!-- Please give us any additional details we'll need in order to understand the issue here -->

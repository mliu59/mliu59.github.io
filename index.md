---
title: Sample Title
---
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Miles Liu</title>
  </head>
  <body>
    <h1>{{ "Hello World!" | downcase }}</h1>
    <h1>h1 Header</h1>
    <h2>h2 Header</h2>
    <h3>h2 Header</h3>
    <h4>h2 Header</h4>
    <p><a href="https://mliu59.github.io/about.html">example link</a>
    {{ page.path }}
    {{ page.url }}
    </p>
    {% if true %}
    <p> this should display </p>
    {% else %}
    <p> this should not display </p>
    {% endif %}
    [Link to a file]({% link /e.pdf %})
    <p>Hello world</p>
  </body>
</html>




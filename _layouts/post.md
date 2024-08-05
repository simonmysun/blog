---
layout: default
---

<h1>{{ page.title }}</h1>

{{ page.date | date: "%e. %B %Y" | strip}} @ {{ page.place }}

{{ content }}
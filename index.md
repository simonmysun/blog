---
layout: default
title: Blogs of Maoyin Sun
language: en-DE
---
Blogs of Maoyin Sun
===================

The blog entries are listed below.
{% for post in site.posts %}{% if post.title and post.language and post.place and post.layout == 'post' %}
{%- assign postDate = post.date | date: "%Y" -%}
{% if postDate != currDate %}
## {{ postDate }}
{% endif %}
{%- assign currDate = postDate -%}
* {{ post.language }}, {{ post.date | date: "%d. %b" | strip}}, [{{ post.title }}]({{ site.baseurl }}{{ post.url }}) @ {{ post.place }}
{% endif %}{% endfor %}

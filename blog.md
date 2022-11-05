---
layout: default
title: "Blog"
show_excerpts: true
---
# Posts

{% if site.show_excerpts %}
  {% include home.html %}
{% else %}
  {% include archive.html title="Posts" %}
{% endif %}

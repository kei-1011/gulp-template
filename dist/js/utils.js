var preload_image = function(src) {
  jQuery("<img />")
    .attr("src", src)
    .hide()
    .appendTo("body")
    .on("load", function() {
      jQuery(this).remove();
    });
};

jQuery.fn.ifExists = function(fn, else_fn) {
  this.length !== 0 ? fn(this) : else_fn && else_fn();
  return this;
};

/*
Responsive.js
Copyright (c) 2015 necota
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

var buildWidthMediaQuery = function(min, max) {
  var media = "(min-width: " + min + "px)";
  if (max !== null) media += " and (max-width: " + max + "px)";
  return media;
};

var matchWidthMediaQuery = function(min, max) {
  return window.matchMedia(buildWidthMediaQuery(min, max)).matches;
};

var responsive = (function() {
  var sets = [];

  window.addEventListener(
    "resize",
    function() {
      sets.forEach(function(set, key) {
        var widthQuery = window.matchMedia(set.media);

        if (widthQuery.matches) {
          set.fn(!set.prevMatch);
        }
        set.prevMatch = widthQuery.matches;
      });
    },
    false
  );

  return function(min, max, fn) {
    sets.push({
      media: buildWidthMediaQuery(min, max),
      fn: fn,
      prevMatch: false
    });
  };
})();

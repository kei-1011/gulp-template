$(function($) {
  var $w = $(window);
  var $h = $("html");
  var $b = $("body");
  var win_width = $(window).width();
  var bp = 750;

  /* --------------------------------------------------
   * common responsive scripts
   */

  (function() {
    var responsive_images = $("[data-sp-replace]");

    responsive_images.each(function() {
      var img = $(this);
      img.data("src", img.attr("src"));
      img.data(
        "src-sp",
        img.attr("src").replace(/\.(svg|png|jpg|gif)/, "-sp.$1")
      );
      preload_image(img.data("src-sp"));
    });

    responsive(0, 750, function(changed) {
      $h.css("font-size", $w.width() / 7.5);

      if (!changed) return;
      responsive_images.each(function() {
        $(this).attr("src", $(this).data("src-sp"));
      });
    });

    responsive(751, null, function(changed) {
      $h.removeAttr("style");
      if (!changed) return;
      responsive_images.each(function() {
        $(this).attr("src", $(this).data("src"));
      });
    });
  })();
});
/* --------------------------------------------------
 * fire
 */
$(function() {
  (function(e) {
    e.initEvent("resize", true, true);
    window.dispatchEvent(e);
    setTimeout(function() {
      window.dispatchEvent(e);
    }, 0);
  })(document.createEvent("HTMLEvents"));
});

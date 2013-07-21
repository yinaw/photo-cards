/**
* photocards is a jQuery plugin that animates a set of images as a stack of photos.
*
* @name photocards
* @version 1.0.0
* @requires jQuery v1.7+
* @author 
* @license MIT License - http://www.opensource.org/licenses/mit-license.php
*
*/

; (function ($) {
    if (!$) return;
    var distribution = {
        linear: function (length, i, max) {
            return length == 0 ? 0 : (i % 3 == 0 ? (max / length) * i : -(max / length) * i);
        },

        none: function () {
            return 0;
        },

        exponential: function (length, i, max) {
            return length == 0 ? 0 : (i % 2 == 0 ? (max / (i + 1)) : -(max / (i + 1)));
        }
    };

    function vOffSet(degree) {
        return (degree / SETTINGS.maxRotate) * 6 + "px";
    };

    $.fn.photocards = function (options) {
        return this.each(function () {
            var wrapper = $(this);

            wrapper.addClass('photo-album');

            var SETTINGS = $.extend({
                speed: 1000,
                direction: 'left',
                distribution: 'exponential',
                auto: 'none',
                maxRotate: 6   /*maximun rotate is 6 degs be default.*/
            }, options);

            var photocards = wrapper.find('li');  /*find element like<li><img src="img/1.jpg"></li>*/

            var count = photocards.length;
            if (count === 0) return;  //There is no image.

            var imgwidth = 0,
                index = 0,
                top,
                arrdeg = [],
                ready = true;

            photocards.each(function (i, img) {   /*rotate photocards.*/
                var $img = $(img);
                var width = $img.width();
                var degree = i;
                var effdeg = distribution[SETTINGS.distribution] == null ?
                                distribution["linear"](count, i, SETTINGS.maxRotate)
                                : distribution[SETTINGS.distribution](count, i, SETTINGS.maxRotate);
                arrdeg.push(effdeg);

                $img.data('d', effdeg)
                    .data('i', i).addClass(i).css('transform', 'rotate(' + effdeg + 'deg)')
                    .css('z-index', count - i);
                if (i === 0) {
                    top = $img;
                }
                imgwidth = Math.max(imgwidth, width);   //the maximum photocard width.
            });

            wrapper.on('click', function () {   //click and move the top image
                if (ready)
                    doslide(top);
                else {
                    return false;
                }
            });

            function doslide(obj) {
                ready = false;   //signal sliding is on-going.
                var dir = SETTINGS.direction;
                obj.animate(animateProp(), SETTINGS.speed, function () {
                    top = findNext();
                    index = top.data('i');
                    reZIndex();
                    obj.animate(
                        { 'left': '0px' },
                        SETTINGS.speed, function () {
                            ready = true;
                        });
                });
            }

            function animateProp(d) {
                var o = {};
                o['left'] = SETTINGS.direction == 'left' ? imgwidth : '-' + imgwidth;
                return o;
            }

            function reZIndex() {
                photocards.each(function (i, img) {
                    $(img).css('z-index', (i >= index ? count - (i - index) : index - (i)));
                });
            }

            function findNext() {
                var n = top.next();
                if (n.length != 0)
                    return n
                else {
                    return photocards.first();
                }
            }

        });
    }
})(jQuery)
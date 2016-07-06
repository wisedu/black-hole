/**
 * 图片查看器的插件
 * 使用此插件前请添加资源服务器上的相关的依赖
 * 依赖:
 * 1. galleria 基本库
 * 2. 相应的 theme (可以使用多个 theme)
 */

;(function($) {
    var Galleria
    var DEFAULT = {
        width: 900,
        height: 700
    }

    var BhGallery = function(options) {
        this.options = $.extend({}, DEFAULT, options)
    }
    $.extend(BhGallery.prototype, {
        show: function() {
            var _this = this
            var $template = $('<div class="bh-gallery"><div class="bh-gallery__backdrop"></div><div class="bh-gallery__main"><div class="bh-gallery__gallery"></div></div><div class="bh-gallery__close iconfont icon-close"></div></div>')

            $('body').append($template)
            var $main = $('.bh-gallery__gallery', $template).css({
                width: _this.options.width,
                height: _this.options.height
            })
            Galleria.run($main, this.options)

            this.resizeGallery($main)

            /**
             * niceScroll 会有一定的延迟,没有具体研究,感觉上是等页面重新渲染完成后 niceScroll 会重新进行一次绑定
             * 所以立即执行会不起效,延迟执行
             */
            setTimeout(function () {
                $('body').getNiceScroll().hide()
                // $('.bh-gallery__main', $template).niceScroll()
            }, 1000)

            $('.bh-gallery__close', $template).click(function() {
                $template.remove()
                $('body').getNiceScroll().show()
            })
        },
        /**
         * 因为如果图片查看器的尺寸超出了尺寸的话需要出滚动条, 吐过采用 css 居中的话无法根据情况显示位置
         * 并且因为是绝对定位居中,无法出滚动条,因此采用 css 计算来居中
         */
        resizeGallery: function($gallery) {
            var windowWidth = $(window).width()
            var windowHeight = $(window).height()
            var galleryWidth = this.options.width
            var galleryHeight = this.options.height

            if (galleryWidth < windowWidth) {
                $gallery.css({
                    marginLeft: (windowWidth - galleryWidth) / 2
                })
            }

            if (galleryHeight < windowHeight) {
                $gallery.css({
                    marginTop: (windowHeight - galleryHeight) / 2
                })
            }
        }
    })

    $.bhGallery = function(options) {
        Galleria = window.Galleria
        if (Galleria === undefined) {
            $.getScript('http://res.wisedu.com/bower_components/galleria/src/galleria.js').done(function() {
                Galleria = window.Galleria
                $.getScript('http://res.wisedu.com/fe_components/galleria/standard/galleria.wisedu.js').done(function() {
                    if (Galleria === undefined) {
                        console.error('please include Galleria lib');
                        return
                    }
                    if (options.showType === 'page') {
                        Galleria.run(options.selector, options)
                    } else {
                        (new BhGallery(options)).show()
                    }
                })
            })
        } else {
            if (options.showType === 'page') {
                Galleria.run(options.selector, options)
            } else {
                (new BhGallery(options)).show()
            }
        }
    }

}(jQuery));

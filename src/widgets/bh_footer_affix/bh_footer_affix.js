(function($) {
    /**
     * 页面滚动，使元素块变浮动，一定要在页面数据加载完成之后才能初始化页脚
     * @param data
     */
    $.bhFooterAffix = function() {
        var $footer = $('body main [bh-role=bhFooterAffix]').first();
        if ($footer[0]) {
            var $parent = $footer.parent();
            if ($parent.attr('bh-footer-affix-role') === "bhFooterAffix") {
                return;
            }
            var footerEle = '<div bh-footer-affix-role="bhFooterAffix" class="bh-footer-affix bh-card bh-card-lv1"></div>';
            $footer.wrap(footerEle);

            var hasPaperPile = $('[bh-paper-pile-dialog-role=bhPaperPileDialog]')[0];
            var hasPropertyDialog = $('[bh-property-dialog-role=bhPropertyDialog]')[0];
            var hasBhWindow = $('[role=dialog]').filter(function() {
                return $(this).hasClass('.jqx-window') && $(this).css('display') !== 'none';
            })[0];

            $(window).scroll(function(e) {
                if (hasPaperPile || hasPropertyDialog || hasBhWindow) {
                    return;
                } else {
                    scrollToSetFooterPlace($parent);
                }
            });
            initFooterAffixPosition($parent);
        }
    };

    $.bhFooterAffix.resetPosition = function() {
        resetFooterAffix();
    };

    //当页面的内容发生变化，重置页脚的位置
    function resetFooterAffix() {
        setTimeout(function() {
            var $page = $("[bh-footer-affix-role=bhFooterAffix]").parent();
            var positionAndHeight = getHeightAndOffset($page);
            var pageShowHeight = positionAndHeight.articleHeight + positionAndHeight.articleOffset.top;
            //article高度小于浏览器高度，则让article的footer取消浮动
            if (pageShowHeight <= positionAndHeight.windowHeight) {
                setDivFooterPosition($page);
            } else {
                //给article的footer添加浮动属性
                footerAffixToFixed($page);
            }
        }, 50);
    }

    // 初始化页面的时候初始化页脚的位置
    function initFooterAffixPosition($page) {
        footerAffixToFixed($page);
        setDivFooterPosition($page);
    }

    //设置footer的位置
    function setDivFooterPosition($page) {
        var positionAndHeight = getHeightAndOffset($page);
        var $divFooter = $page.find("div[bh-footer-affix-role=bhFooterAffix]");
        var dialogFooterFixedStyle = footerAffixToFixed($page, 'get');
        $divFooter.attr("bh-footer-affix-fixed", dialogFooterFixedStyle);

        //页面高度小于浏览器高度，则让页脚取消浮动
        var pageShowHeight = positionAndHeight.articleHeight + positionAndHeight.articleOffset.top;
        if (pageShowHeight <= positionAndHeight.windowHeight) {
            setDivFooterRelative($divFooter);
        }
    }
    // 设置footer的位置
    function setDivFooterRelative($divFooter) {
        //当首页的div的页脚没有任何内容时，不做任何处理
        if ($divFooter.contents().length === 0) {
            return;
        }

        var $page = $divFooter.parent();
        var layoutType = '';
        var pageContentHeight = 0;
        $page.children().each(function() {
            var $item = $(this);
            //先判断该布局是不是左右布局，是左右布局则继续读取它里面的子结构然后取高度大的nav或page的高度做页面高度
            if ($item[0].localName === "nav") {
                layoutType = 'navLeft';
            }

            if (layoutType === 'navLeft') {
                var navContentHeight = 0;
                $item.children().each(function() {
                    navContentHeight += $(this).outerHeight();
                });
                if (navContentHeight > pageContentHeight) {
                    pageContentHeight = navContentHeight;
                }
            } else {
                var itemHeight = $item.outerHeight();
                if ($item.attr('bh-footer-affix-role') == "bhFooterAffix") {
                    itemHeight = 0;
                }
                pageContentHeight += itemHeight;
            }
        });
        var pagePaddingBottom = parseInt($page.css("padding-bottom"), 10);
        pagePaddingBottom = pagePaddingBottom ? pagePaddingBottom : 0;

        var pageMinHeight = parseInt($page.css("min-height"), 10);
        pageMinHeight = pageMinHeight ? pageMinHeight : 0;

        //当内容高度比首页最小高度还小的时候，让页脚能自适应高度
        if ((pageContentHeight + pagePaddingBottom) < pageMinHeight) {
            $divFooter.removeAttr("style");
            $divFooter.css({
                "top": pageContentHeight + "px",
                "bottom": "initial",
                "background-color": "transparent"
            }).removeClass('bh-card bh-card-lv1');
        } else {
            $divFooter.css({
                "left": 0,
                "bottom": 0,
                "position": "absolute"
            });
        }
        $divFooter.show();
    }
    //给首页添加的footer添加浮动属性，
    //当可视区域和window的高度一致，将页脚设置为绝对定位
    function footerAffixToFixed($page, flag) {
        var footerStyle = '';
        var $pageDivFooter = $page.find("div[bh-footer-affix-role=bhFooterAffix]");

        if ($pageDivFooter[0]) {
            var pageWidth = $page.outerWidth();
            var positionData = getHeightAndOffset($page);
            var articleShowHeight = positionData.articleHeight + positionData.footerHeight + positionData.bodyHeaderHeight;
            initPagePadding($pageDivFooter, positionData.divFooterHeight);
            footerStyle = 'left:' + positionData.articleOffset.left + 'px;width:' + pageWidth + 'px;position:fixed;bottom:0;top:initial;display:block;z-index:1000;';
            if (flag !== 'get') {
                if (articleShowHeight <= positionData.windowHeight) {
                    $pageDivFooter.css({
                        "left": positionData.articleOffset.left + "px",
                        "bottom": 0,
                        "position": "absolute",
                        "background-color": "transparent"
                    }).removeClass('bh-card bh-card-lv1');
                } else {
                    $pageDivFooter.css({
                        "left": positionData.articleOffset.left + "px",
                        "width": pageWidth + "px",
                        "position": "fixed",
                        "bottom": 0,
                        "top": "initial",
                        "display": "block",
                        "z-index": 1000
                    });
                }
            }
        }
        return footerStyle;
    }

    /**
     * 滚动条滚动时，设置页脚样式,
     * 当可视区域和window的高度一致，将页脚设置为绝对定位
     * @param $dialog
     */
    function scrollToSetFooterPlace($page) {
        var positionAndHeight = getHeightAndOffset($page);

        var $divFooter = $page.find("div[bh-footer-affix-role=bhFooterAffix]");
        // 滚动到底的时候，将footer设置为绝对定位
        if (positionAndHeight.windowHeight + positionAndHeight.scrollTop >= positionAndHeight.bodyHeight - 32) {
            setDivFooterRelative($divFooter);
        } else {
            var pageFooterFixedStyle = $divFooter.attr("bh-footer-affix-fixed");
            var articleShowHeight = positionAndHeight.articleHeight + positionAndHeight.footerHeight + positionAndHeight.bodyHeaderHeight;
            if (articleShowHeight <= positionAndHeight.windowHeight) {
                $divFooter.css({
                    "left": 0,
                    "bottom": 0,
                    "position": "absolute",
                    "background-color": "transparent"
                }).removeClass('bh-card bh-card-lv1');
            } else {
                $divFooter.attr("style", pageFooterFixedStyle);
            }
        }
    }

    //获取window，article，footer的高度以及offset
    function getHeightAndOffset($page) {
        var data = {};
        var $window = $(window);
        var $body = $("body");
        var scrollTop = $window.scrollTop();
        var windowHeight = $window.height();

        var bodyHeight = $body.get(0).scrollHeight;
        var footerHeight = $("[bh-footer-role=footer]").outerHeight();
        var bodyHeaderHeight = $('body header header').outerHeight();

        if ($page) {
            var articleHeight = $page.outerHeight();
            var articleOffset = $page.offset();
            var divFooterHeight = 0;
            var $divFooter = $page.find('div[bh-footer-affix-role=bhFooterAffix]');
            if ($divFooter.length > 0) {
                divFooterHeight = $divFooter.outerHeight(true);
            }

            data.articleHeight = articleHeight;
            data.articleOffset = articleOffset;
            data.divFooterHeight = divFooterHeight;
        }

        data.windowHeight = windowHeight;
        data.scrollTop = scrollTop;
        data.bodyHeight = bodyHeight;
        data.footerHeight = footerHeight;
        data.bodyHeaderHeight = bodyHeaderHeight;
        return data;
    }

    // 添加article的paddingbottom
    function initPagePadding($pageDivFooter, divFooterHeigth) {
        $pageDivFooter.parent().css({
            "padding-bottom": divFooterHeigth
        });
    }

})(jQuery);
(function($) {
    $.bhPropertyDialog = {
        show: function(data) {
            var dialogDefaults = {
                insertContainer: "", //必填，弹出框要插入的容器
                title: "", //必填，弹出框的title
                content: "", //必填，弹出框的内容html
                footer: "", //可选，弹出框的页脚按钮html，可传入html片段，或default（使用默认的页脚），或空（无页脚）
                selector: "",
                hideCover: false, //可选，是否隐藏遮罩层，默认不隐藏
                autoDestroy: true, //可选, 隐藏时自动销毁，默认销毁
                ok: null,
                cancel: null,
                open: null, //可选，每次打开弹出框后的回调，不包括第一次的初始化
                hide: null, //可选，每次隐藏弹出框后的回调
                ready: null //可选，初始化并渲染完成的回调
            };
            var options = $.extend({}, dialogDefaults, data);
            showDialog(options);
        },
        hide: function(data) {
            var dialogDefaults = {
                close: null, //可选，当关闭的回调
                destroy: true //可选，值为true或false； true则在隐藏的同时将弹出框remove
            };
            var options = $.extend({}, dialogDefaults, data);
            dialogHide(options);
        },
        footerHide: function() {
            dialogFooterHide();
        },
        footerShow: function() {
            dialogFooterShow();
        },
        destroy: function() {
            dialogDestroy();
        }
    };

    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime() {
        return 450;
    }

    /**
     * 弹出侧边框
     * @param insertContainer 弹出框要插入的容器
     * @param title 弹出框的title
     * @param content 弹出框的内容html
     * @param footer 弹出框的按钮html
     */
    function showDialog(data) {
        //当输入的插入容器不存在时，会导致死循环
        if (data.insertContainer) {
            if (data.insertContainer.length === 0) {
                if (typeof window.console !== 'undefined') {
                    window.console.error('insertContainer 要插入的容器不存在');
                }
                return;
            }
        }
        var $dialog = $("div[bh-property-dialog-role=bhPropertyDialog]");
        data = resetOptionContainer(data);
        //给传入的title，content，footer添加标签
        data = addTagToOption(data);
        //若不存在则新建一个
        if ($dialog.length === 0) {
            //获取弹框框架
            var dialogHtml = getDialogHtml();
            //获取页脚html
            var footerHtml = "";
            if (data.footer) {
                if (data.footer === "default") {
                    //使用默认页脚
                    footerHtml = getDefaultFooterHtml();
                } else {
                    //使用传入的页脚
                    footerHtml = data.footer;
                }
            }
            dialogHtml = dialogHtml.replace("@title", data.title).replace("@content", data.content).replace("@footer", data.footer);
            $dialog = $(dialogHtml);
            //无页脚时，隐藏页脚
            if (!footerHtml) {
                $dialog.find("[bh-property-dialog-role=footer]").hide();
            }

            data.insertContainer.append($dialog);
            //给弹框的body设置高度,当内容过多时使其能出滚动条
            setDialogBodyHeight();
            //弹框事件监听
            dialogEventListen($dialog, data);

            setTimeout(function() {
                //初始化结束后的回调
                if (typeof data.ready != 'undefined' && data.ready instanceof Function) {
                    //获取该弹框的header，section，footer的jquery对象
                    var $dialogHeader = $dialog.find("[bh-property-dialog-role=header]").children();
                    var $dialogBody = $dialog.find("[bh-property-dialog-role=body]").children();
                    var $dialogFooter = $dialog.find("[bh-property-dialog-role=footer]").children();

                    data.ready($dialogHeader, $dialogBody, $dialogFooter);
                }

                //给按钮添加水波纹效果
                BH_UTILS && BH_UTILS.wavesInit();
                $dialog.find("[bh-property-dialog-role=body]").niceScroll({
                    zindex: 99999,
                    horizrailenabled: false
                });
            }, getAnimateTime());
        } else {
            setTimeout(function() {
                //每次打开的回调
                if (typeof data.open != 'undefined' && data.open instanceof Function) {
                    data.open();
                }
            }, getAnimateTime());
        }

        //当hideCover为false时显示遮罩层
        if (!data.hideCover) {
            $dialog.find(".bh-property-dialog-cover").show()
                .removeClass("bh-property-dialog-cover-fadeOut").addClass("bh-property-dialog-cover-fadeIn");
        }

        setDialogPosition($dialog, data);

        $dialog.show();
        //移除动画
        $dialog.find("div.bh-property-dialog-container").removeClass("bh-outRight").addClass("bh-intoRight");

        //当弹框出现时，将页面的滚动条隐藏
        setTimeout(function() {
            $("body").addClass('sc-overflow-hide').getNiceScroll().remove();
        }, getAnimateTime() + 50);
    }

    //给传入的title，content，footer添加标签
    function addTagToOption(options) {
        var $asideContent = null;
        if (options.content) {
            var contentObj = $(options.content)[0];
            if (contentObj && contentObj.localName !== "section") {
                $asideContent = $('<section>' + options.content + '</section>');
            }
        } else {
            var $aside = options.insertContainer;
            if ($aside && $aside[0] && $aside[0].localName === "aside") {
                //当传入要显示的内容的选择器时则使用传入的，不传入则默认使用第一个script标签的
                if (options.selector) {
                    $asideContent = $('<div>' + $aside.find(options.selector).html() + '</div>');
                } else {
                    $asideContent = $('<div>' + $aside.find('script').html() + '</div>');
                }
            }
        }


        if (!options.title) {
            var $asideHeader = $asideContent.children("h3");
            if ($asideHeader.length > 0) {
                options.title = $asideHeader[0].outerHTML;
            }
        } else {
            var $title = $('<h3>' + options.title + '</h3>');
            var $titleChild = $title.children();
            if ($titleChild.length === 0 || $titleChild.length > 1) {
                options.title = $title[0].outerHTML;
            } else if ($titleChild.length === 1 && $titleChild[0].localName !== "h3") {
                options.title = $title[0].outerHTML;
            }
            //if($titleChild.length === 0 || ($titleChild.length === 0 && $title[0] && $title[0].localName !== "h3")){
            //    options.title = '<h3>'+options.title+'</h3>';
            //}
        }

        var $asideSection = $asideContent.children("section");
        if ($asideSection.length > 0) {
            options.content = $asideSection[0].outerHTML;
        }

        if (!options.footer) {
            var $asideFooter = $asideContent.children("footer");
            if ($asideFooter.length > 0) {
                //当footer有内容时使用传入的，有footer标签但是没有内容则使用默认页脚
                if ($asideFooter.children().length > 0) {
                    options.footer = $asideFooter[0].outerHTML;
                } else {
                    options.footer = getDefaultFooterHtml();
                }
            }
        } else {
            if (options.footer === "default") {
                options.footer = getDefaultFooterHtml();
            }
        }

        return options;
    }

    function getDefaultFooterHtml() {
        var _html =
            '<footer>' +
            '<a class="bh-btn bh-btn-primary bh-btn-large" bh-property-dialog-role="okBtn">确定</a>' +
            '<a class="bh-btn bh-btn-default bh-btn-large" bh-property-dialog-role="cancelBtn">取消</a>' +
            '</footer>';
        return _html;
    }

    function getDialogHtml() {
        var _html =
            '<div class="bh-property-dialog" bh-property-dialog-role="bhPropertyDialog">' +
            '<div class="bh-property-dialog-container bh-animated bh-outRight bh-card bh-card-lv2">' +
            '<i class="iconfont icon-close bh-pull-right bh-cursor-point" bh-property-dialog-role="closeIcon"></i>' +
            '<div class="bh-mb-16" bh-property-dialog-role="header">' +
            '@title' +
            '</div>' +
            '<div bh-property-dialog-role="body">' +
            '@content' +
            '</div>' +
            '<div class="bh-property-dialog-footer bh-animated bh-outDown" bh-property-dialog-role="footer">' +
            '@footer' +
            '</div>' +
            '</div>' +
            '<div class="bh-property-dialog-cover bh-animated bh-property-dialog-cover-fadeIn"></div>' +
            '</div>';
        return _html;
    }


    /**
     * 隐藏侧边框
     * @param flag 默认弹框不销毁，"destroy"将弹框销毁
     */
    function dialogHide(options) {
        if (typeof options.close != 'undefined' && options.close instanceof Function) {
            //当关闭回调返回false时，阻止弹框关闭
            var optionFlag = options.close();
            if (typeof optionFlag === "boolean" && !optionFlag) {
                return;
            }
        }
        var $dialog = $("div[bh-property-dialog-role=bhPropertyDialog]");
        if ($dialog.length > 0) {
            $dialog.find("div.bh-property-dialog-container").removeClass("bh-intoRight").addClass("bh-outRight");
            $dialog.find("div.bh-property-dialog-cover").removeClass("bh-property-dialog-cover-fadeIn")
                .addClass("bh-property-dialog-cover-fadeOut");

            setTimeout(function() {
                $dialog.hide();
                $dialog.find("div.bh-property-dialog-footer").hide().removeClass("bh-intoUp").addClass("bh-outDown");
                if (options.destroy || options.autoDestroy) {
                    $dialog.remove();
                }

                setTimeout(function() {
                    $("body").removeClass('sc-overflow-hide').niceScroll({
                        zindex: 99999,
                        horizrailenabled: false
                    });
                }, 50);
            }, getAnimateTime());
        }
    }


    /**
     * 显示侧边框页脚
     * @param insertContainer 弹出框插入的容器
     */
    function dialogFooterHide() {
        $("div[bh-property-dialog-role=bhPropertyDialog]").find("div.bh-property-dialog-footer")
            .removeClass("bh-intoUp").addClass("bh-outDown");
        setDialogBodyHeight();
    }

    /**
     * 隐藏侧边框页脚
     * @param insertContainer 弹出框插入的容器
     */
    function dialogFooterShow() {
        var $dialogFooter = $("div[bh-property-dialog-role=bhPropertyDialog]").find("div.bh-property-dialog-footer");
        $dialogFooter.removeClass("bh-outDown").addClass("bh-intoUp").show();
        setDialogBodyHeight(true);
    }

    /**
     * 给弹框的body设置高度,当内容过多时使其能出滚动条
     * @param isFooterShow 页脚是否有显示
     */
    function setDialogBodyHeight(isFooterShow) {
        var heightStr = '100% - 56px';
        if (isFooterShow) {
            heightStr = '100% - 56px - 52px';
        }
        $("div[bh-property-dialog-role=bhPropertyDialog]").find("[bh-property-dialog-role=body]")
            .attr('style', 'height: -moz-calc(' + heightStr + ');height: -webkit-calc(' + heightStr + ');height: calc(' + heightStr + ');overflow: hidden;');

        setTimeout(function() {
            $("body").addClass('sc-overflow-hide').getNiceScroll().remove();
        }, getAnimateTime() + 50);
    }

    /**
     * 将弹框销毁
     */
    function dialogDestroy() {
        var $dialog = $("div[bh-property-dialog-role=bhPropertyDialog]");
        if ($dialog.length > 0) {
            dialogEventOff($dialog);
            $dialog.remove();
        }
    }

    function dialogEventListen($dialog, data) {
        $dialog.on("click", "i[bh-property-dialog-role=closeIcon]", function() {
            data.close = data.hide;
            $.bhPropertyDialog.hide(data);
        });

        $dialog.on("click", "[bh-property-dialog-role=okBtn]", function() {
            data.close = data.ok;
            $.bhPropertyDialog.hide(data);
        });

        $dialog.on("click", "[bh-property-dialog-role=cancelBtn]", function() {
            data.close = data.cancel;
            $.bhPropertyDialog.hide(data);
        });
    }

    function dialogEventOff($dialog) {
        $dialog.off("click");
    }

    //当没有传入insertContainer，title等字段时，从固定结构中查找元素
    function resetOptionContainer(data) {
        var $body = $("body");
        //当不传入insertContainer时，去查找固定结构并设置
        if (!data.insertContainer) {
            var $paperDialogs = $body.find("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            if ($paperDialogs.length > 0) {
                //当存在paper弹出框是的处理
                var $insertToDialog = "";
                var insertToDialogIndex = 0;
                var hasOpenDialogs = $body.find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
                if (hasOpenDialogs.length > 0) {
                    hasOpenDialogs.each(function() {
                        var $itemDialog = $(this);
                        var dialogIndex = parseInt($itemDialog.attr("bh-paper-pile-dialog-role-index"), 10);
                        if (dialogIndex > insertToDialogIndex) {
                            $insertToDialog = $itemDialog;
                        }
                    });
                }
                if ($insertToDialog.length > 0) {
                    data.insertContainer = $insertToDialog.children().children("aside");
                }
            } else {
                //当没有paper弹出框的处理
                if ($body.children("main").length > 0) {
                    var tempFixedArticle = $body.children("main").children("article");
                    if (tempFixedArticle.length > 0) {
                        var $aside = tempFixedArticle.children("aside");
                        if ($aside.length > 0) {
                            data.insertContainer = $aside;
                        } else {
                            data.insertContainer = $('<aside></aside>');
                            tempFixedArticle.append(data.insertContainer);
                        }
                    }
                }
            }
        }

        return data;
    }

    //设置弹框的位置
    function setDialogPosition($dialog, options) {
        var $window = $(window);
        var windowHeight = $window.height();
        var scrollTop = $window.scrollTop();
        var insertContData = getInsertContainerTop(options.insertContainer);
        var $normalHeader = $('header[bh-header-role="bhHeader"]');
        var normalHeaderHeight = $normalHeader.outerHeight();
        var $miniHeader = $('header[bh-header-role="bhHeaderMini"]');
        var miniHeaderHeight = $miniHeader.outerHeight();
        var isMiniHeaderShow = $normalHeader.hasClass("bh-normalHeader-hide") ? true : false;
        var headerHeight = isMiniHeaderShow ? miniHeaderHeight : normalHeaderHeight;
        var bodyHeight = $('body').get(0).scrollHeight;
        var $footer = $('[bh-footer-role="footer"]');
        var footerTop = $footer.offset().top;
        var footerHeight = $footer.outerHeight();
        var dialogTop = 0;
        var topDiff = 4; //高度偏移量
        var headerDiff = normalHeaderHeight - miniHeaderHeight; //大小头部高度差
        if (scrollTop > insertContData.top) {
            dialogTop = scrollTop - insertContData.top + headerHeight;
        }
        var dialogHeight = insertContData.height;
        //出现小头部的处理
        if (isMiniHeaderShow) {
            //滚动条滚到页脚的处理
            if (windowHeight + scrollTop + footerHeight >= bodyHeight) {
                dialogHeight = bodyHeight - scrollTop - footerHeight - topDiff - headerDiff;
            } else {
                //滚动条没有滚到页脚的处理
                dialogHeight = windowHeight - miniHeaderHeight;
            }
        } else {
            //当页面内容大于屏幕高度的处理
            if (footerTop > windowHeight) {
                dialogHeight = windowHeight - insertContData.top;
            }
        }

        $dialog.css({
            top: dialogTop,
            height: dialogHeight
        });
    }

    //获取弹框插入节点的高度和top值
    function getInsertContainerTop($dom) {
        var height = $dom.outerHeight();
        if (height) {
            return {
                top: $dom.offset().top,
                height: height
            };
        } else {
            return getInsertContainerTop($dom.parent());
        }
    }
})(jQuery);
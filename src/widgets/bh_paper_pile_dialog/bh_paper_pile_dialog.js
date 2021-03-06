/**
 * 堆叠对话框
 * 页面结构要求
 *      页面的最外层不能设置背景色，不能设置边框
 *      变化的title要设置成绝对定位，避免title缩小时其对应的内容跟着上移
 */
(function($) {
    $.bhPaperPileDialog = {
        show: function(options) {
            var dialogDefaults = {
                titleContainer: "", //必填，父层的title
                insertContainer: $("#levityPlaceholder"), //可选，想要将dialog插入的容器
                referenceContainer: "", //必填，dialog要参考的容器，主要用于获取容器的宽度和位置
                addDialogFlagClass: "", //可选，想要在弹出框中添加的类名，一般用在有多个弹出框时能做操作，
                toHideContainer: "", //可选，要隐藏的容器，主要用于当弹框内容过少，无法完全遮盖已经存在的内容
                hideCloseIcon: false, //可选，隐藏关闭按钮，false不隐藏
                title: "", //必填，弹出框的title
                content: "", //必填，在弹出框中显示的内容，一般是html标签
                footer: "", //可选，在弹出框页脚中显示的按钮，html标签
                aside: "", //隐藏字段，在固定html结构中存放侧边栏弹框用
                close: null, //可选，当关闭的回调，关闭时自动将弹框销毁
                autoDestroy: true, //可选, 隐藏时自动销毁，默认销毁
                closeBefore: null, //可选，当关闭前的回调
                open: null, //可选，每次打开弹出框后的回调，不包括第一次的初始化
                openBefore: null, //可选，每次打开弹出框前的回调，不包括第一次的初始化
                ready: null, //可选，初始化并渲染完成的回调
                render: null //dom节点生成并插入页面时就调用，此时动画未完成
            };
            options = $.extend({}, dialogDefaults, options);
            showDialog(options);
        },
        resetPageFooter: function(options) {
            //当弹出框的高度发生变化时，重设页脚高度
            var dialogDefaults = {
                titleContainer: "", //可选，父层的title
                referenceContainer: "", //可选，想要将dialog插入的容器
                dialogContainer: "", //可选，弹出框容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            resetPageFooter(options);
        },
        //重设弹框的最小高度
        resetMinHeight: function(options) {
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            resetDialogMinHeight(options);
        },
        //重新设置弹框页脚的位置
        resetDialogFooter: function(options) {
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "" //可选，与弹出框关联的内容容器
            };
            options = $.extend({}, dialogDefaults, options);
            resetDialogFooter(options);
        },
        hide: function(options) {
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "", //可选，弹出框的guid
                isHideAll: false, //可选，true删除所有弹框
                ignoreAllCallback: false, //忽略所有的回调方法
                ignoreCloseCallback: false, //忽略close的回调方法
                ignoreCloseBeforeCallback: false, //忽略closeBefore的回调方法
                destroy: true //可选，值为true或false； true则在隐藏的同时将弹出框remove
            };
            options = $.extend({}, dialogDefaults, options);
            dialogHide(options);
        },
        destroy: function(options) {
            var dialogDefaults = {
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "", //可选，与弹出框关联的内容容器
                guid: "" //可选，弹出框的guid
            };
            options = $.extend({}, dialogDefaults, options);
            dialogDestroy(options);
        }
    };

    /**
     * titleContainer 必填，父层的title
     * referenceContainer 必填，想要将dialog插入的容器
     * addDialogFlagClass 可选，想要在弹出框中添加的类名，一般用在有多个弹出框时能做操作
     * title 必填，弹出框的title
     * content 必填，在弹出框中显示的内容，一般是html标签
     * footer 可选，在弹出框页脚中显示的按钮，html标签
     * close 可选，当关闭的回调
     * show 可选，每次打开弹出框后的回调，不包括第一次的初始化
     * ready 可选，初始化并渲染完成的回调
     */
    function showDialog(options) {
        var $body = $("body");
        $body.scrollTop(0);
        var $dialog = "";
        var $insertToDialog = getTheNewestOpenDialog();

        //重置titleContainer,referenceContainer,toHideContainer，使其兼容固定的html结构
        options = resetOptionContainer(options, $insertToDialog);

        if ($insertToDialog.length > 0) {
            //如果要加入的父层是paper对话框，将父层弹出框的边框去掉，对于多层弹框有用
            $insertToDialog.find(".bh-paper-pile-closeIcon").hide();
            $insertToDialog.find(".bh-paper-pile-dialog-container").addClass("bh-bg-transparent");
        }

        setTimeout(function() {
            //隐藏父层弹框的内容，避免子级弹框的内容过少，会看到父级的内容
            if ($insertToDialog.length > 0) {
                $insertToDialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").hide();
            } else {
                //将内容的border去掉
                var $layoutContainer = "";
                var fixedArticle = getFixedArticle();
                if (fixedArticle) {
                    $layoutContainer = fixedArticle;
                } else {
                    $layoutContainer = $("[bh-container-role=container]");
                }
                if ($layoutContainer && $layoutContainer.length > 0) {
                    $layoutContainer.addClass("bh-border-transparent").addClass("bh-bg-transparent");
                }
            }
        }, getAnimateTime());

        //给要遮盖的dom添加缩小动画，动画时间是基础时间的两倍
        options.titleContainer.addClass("bh-animated-doubleTime")
            .removeClass("bh-paper-pile-dialog-parentTitle-toRestore").addClass("bh-paper-pile-dialog-parentTitle-toSmall");

        setTimeout(function() {
            //动画即将结束时给父层弹出框的title加阴影
            options.titleContainer.addClass("bh-paper-pile-dialog-parentTitle-change");
        }, getAnimateTime() * 2 * 0.8);

        //若弹框之前创建过且没有remove，则直接显示，否则新建一个
        var existGuid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        if (existGuid) {
            $dialog = $("div[bh-paper-pile-dialog-role-guid=" + existGuid + "]");
            $dialog.removeClass("bh-negative-zIndex").show();
            $dialog.find("div.bh-paper-pile-dialog-container").removeClass("bh-paper-pile-dialog-outDown").addClass("bh-paper-pile-dialog-intoUp");

            setTimeout(function() {
                if (typeof options.open != 'undefined' && options.open instanceof Function) {
                    //执行再次打开的回调
                    options.open();
                }
            }, getAnimateTime() * 2);

            if (typeof options.openBefore != 'undefined' && options.openBefore instanceof Function) {
                //执行再次打开的回调
                options.openBefore();
            }
        } else {
            //创建guid与绑定的title容器和内容容器关联
            var guid = NewGuid();
            var dialogHtml = getDialogHtml();
            options = getContentHtml(options);
            var footerContentHtml = options.footer ? options.footer : "";
            var layoutRole = options.layoutRole ? options.layoutRole : "";
            var layoutClass = options.layoutClass ? options.layoutClass : "";

            //计算弹出框要显示的width、top、left
            var insertContWidth = options.referenceContainer.outerWidth();
            var titleOffset = options.titleContainer.offset();
            var titleTop = titleOffset.top;
            var titleLeft = titleOffset.left;
            //32是迷你头的高度
            var dialogTop = titleTop + 32;
            //设置弹框的位置和宽度
            var dialogStyle = "";
            dialogStyle += 'left:' + titleLeft + 'px;';
            dialogStyle += 'top:' + dialogTop + 'px;';
            dialogStyle += 'width:' + insertContWidth + 'px;';

            var heightData = getFrameHeight();

            dialogStyle += 'height:' + '-moz-calc(100% - ' + parseInt(dialogTop + heightData.footerHeight) + 'px);';
            dialogStyle += 'height:' + '-webkit-calc(100% - ' + parseInt(dialogTop + heightData.footerHeight) + 'px);';
            dialogStyle += 'height:' + 'calc(100% - ' + parseInt(dialogTop + heightData.footerHeight) + 'px);';

            //68是弹框的头部高度
            var dialogHeadHeight = options.title ? 68 : 0;
            var dialogBodyMinHeight = heightData.windowHeight - heightData.footerHeight - dialogTop - dialogHeadHeight;

            dialogHtml = dialogHtml.replace("@title", options.title).replace("@footer", footerContentHtml)
                .replace("@content", options.content).replace("@guid", guid).replace("@style", dialogStyle)
                .replace("@bodyStyle", 'min-height:' + dialogBodyMinHeight + 'px')
                .replace(/@layoutRole/g, layoutRole).replace("@layoutClass", layoutClass);

            //将弹框添加到body
            $dialog = $(dialogHtml);
            if (options.insertContainer.length === 0) {
                options.insertContainer = $body;
            }

            //当title没有的时候，隐藏title的div
            if (!options.title) {
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]").hide();
                if (!options.layoutRole || options.layoutRole.indexOf('navLeft') === -1) {
                    $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").css("margin-top", "24px");
                }
            }

            //隐藏关闭按钮
            if (options.hideCloseIcon) {
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogCloseIcon]").hide();
            }

            //将aside加入弹框结构中
            if (options.aside) {
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").before(options.aside);
            } else {
                $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").before('<aside bh-paper-pile-dialog-role="aside"></aside>');
            }

            options.insertContainer.append($dialog);

            //当出现多重弹框时，将已存在的弹框信息放到body上
            var dialogIndex = 1;
            var existDialogData = $body.data("bh-paper-pile-dialog");
            if (existDialogData) {
                dialogIndex = existDialogData.length + 1;
                existDialogData.push({
                    "guid": guid,
                    "index": dialogIndex
                });
            } else {
                existDialogData = [{
                    "guid": guid,
                    "index": dialogIndex
                }];
            }
            $body.data("bh-paper-pile-dialog", existDialogData);
            //设置当前弹框的index和高度
            $dialog.attr("bh-paper-pile-dialog-role-index", dialogIndex);

            //给title和内容容器添加guid
            options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid", guid);
            options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid", guid);
            //给要隐藏的容器加guid
            if (options.toHideContainer) {
                var hideContLen = options.toHideContainer.length;
                if (hideContLen > 1) {
                    for (var i = 0; i < hideContLen; i++) {
                        options.toHideContainer[i].attr("bh-paper-pile-dialog-role-hide-container-guid", guid);
                    }
                } else {
                    options.toHideContainer.attr("bh-paper-pile-dialog-role-hide-container-guid", guid);
                }
            }

            //若用户有要添加的样式类，则加入到弹框中
            if (options.addDialogFlagClass) {
                $dialog.addClass(options.addDialogFlagClass);
            }

            if (options.footer) {
                //当有页脚时，添加页脚距离，避免页脚覆盖内容
                var dialogFooterHeigth = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").outerHeight();
                var pageFooterHeight = $("[bh-footer-role=footer]").outerHeight();
                var dialogPaddingBottom = dialogFooterHeigth + pageFooterHeight;
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").css({
                    "padding-bottom": dialogPaddingBottom
                });
            }

            $dialog.data("closeFun", options.close);
            $dialog.data("closeBeforeFun", options.closeBefore);

            setTimeout(function() {
                //动画结束后再进行事件绑定，避免动画未结束时点击关闭，导致显示错误
                //弹出框事件绑定
                dialogEventListen($dialog, options);

                if (typeof options.ready != 'undefined' && options.ready instanceof Function) {
                    //获取该弹框的header，section，footer，aside的jquery对象
                    var dialogParts = getDialogPartDom($dialog);
                    //执行初始化完成事件，并将对应节点的jquery对象返回
                    options.ready(dialogParts.dialogHeader, dialogParts.dialogSection, dialogParts.dialogFooter, dialogParts.dialogAside);
                }

                $.bhPaperPileDialog.resetPageFooter(); //改变页面的页脚位置
                $.bhPaperPileDialog.resetDialogFooter(); //改变弹框的页脚位置   
            }, getAnimateTime() * 2 + 10);

            if (typeof options.render != 'undefined' && options.render instanceof Function) {
                var dialogParts = getDialogPartDom($dialog);
                //执行初始化完成事件，并将对应节点的jquery对象返回
                options.render(dialogParts.dialogHeader, dialogParts.dialogSection, dialogParts.dialogFooter, dialogParts.dialogAside);
            }
        }

        //将要隐藏的容器隐藏
        if (options.toHideContainer) {
            var hideContLen = options.toHideContainer.length;
            if (hideContLen > 1) {
                for (var i = 0; i < hideContLen; i++) {
                    options.toHideContainer[i].hide();
                }
            } else {
                options.toHideContainer.hide();
            }
        }

        setTimeout(function() {
            //给弹出框的页脚添加浮动属性
            dialogFooterToFixed($dialog, options);

            //移除弹框动画，避免fixed属性不可用
            $dialog.find("div.bh-paper-pile-dialog-container").removeClass("bh-paper-pile-dialog-intoUp");

            setCurrentFooterPosition($dialog);

            //给按钮添加水波纹效果
            BH_UTILS && BH_UTILS.wavesInit();

        }, getAnimateTime() * 2);
    }

    //获取该弹框的header，section，footer，aside的jquery对象
    function getDialogPartDom($dialog) {
        var $dialogHeader = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]");
        var $dialogBody = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
        var $dialogSection = $dialogBody.children("section");
        var $dialogAside = $dialog.find("[bh-paper-pile-dialog-role=aside]");
        var $dialogFooter = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]").children("footer");
        return {
            dialogHeader: $dialogHeader,
            dialogSection: $dialogSection,
            dialogFooter: $dialogFooter,
            dialogAside: $dialogAside
        };
    }

    /**
     * 重新设置option的container数据
     * @param options
     * @param $insertToDialog 当存在多层弹框时，该值是最新弹出的弹框层
     * @returns {*}
     */
    function resetOptionContainer(options, $insertToDialog) {
        if ($insertToDialog) {
            options = resetContainerHandle(options, $insertToDialog, true);
        } else {
            var fixedArticle = getFixedArticle();
            if (fixedArticle && fixedArticle.length > 0) {
                options = resetContainerHandle(options, fixedArticle, false);
            }
        }
        return options;
    }

    /**
     * 对option进行赋值
     * @param options
     * @param $dom
     * @param isDialogFlag true是存在多层弹框
     * @returns {*}
     */
    function resetContainerHandle(options, $dom, isDialogFlag) {
        if ($dom && $dom.length > 0) {
            if (!options.titleContainer) {
                if (isDialogFlag) {
                    options.titleContainer = $dom.find("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]");
                } else {
                    if ($dom.children("h2").length > 0) {
                        options.titleContainer = $dom.children("h2");
                    } else {
                        options.titleContainer = $dom.children("hgroup");
                    }
                }
            }
            if (!options.referenceContainer) {
                options.referenceContainer = isDialogFlag ? $dom.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]") : $dom;
            }
            if (!options.toHideContainer) {
                if (isDialogFlag) {
                    var $referenceDialog = options.referenceContainer.closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
                    options.toHideContainer = $referenceDialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
                } else {
                    var layoutType = $dom.attr("bh-layout-role");
                    if (layoutType === "navLeft") {
                        options.toHideContainer = [$dom.children('section'), $dom.children('nav')];
                    } else {
                        options.toHideContainer = $dom.children('section');
                    }
                }
            }
        }

        return options;
    }

    //获取固定结构的article
    function getFixedArticle() {
        var fixedArticle = null;
        var $body = $("body");
        if ($body.children("main").length > 0) {
            var tempFixedArticle = $body.children("main").children("article");
            if (tempFixedArticle.length > 0) {
                fixedArticle = tempFixedArticle;
            }
        }
        return fixedArticle;
    }

    //获取传入的content，若传入的content的article下的第一级子节点有h2，则将其移除
    function getContentHtml(options) {
        var contentHtml = options.content;
        var $contentHtml = $(contentHtml);
        var $title = $contentHtml.children("h2");
        var $footer = $contentHtml.children("footer");
        //判断是否是固定结构的dom
        var isFixedDom = false;
        if ($contentHtml[0].localName === "article" && $contentHtml.children("section").length > 0) {
            isFixedDom = true;
        }

        if (!options.title) {
            if ($title.length > 0) {
                $title.addClass("bh-paper-pile-dialog-headerTitle").attr("bh-paper-pile-dialog-role", "bhPaperPileDialogHeader");
                options.title = $title[0].outerHTML;
                $title.remove();
            }
        } else {
            //当通过属性传入的title时，默认在外面套上h2标签
            options.title = '<h2 class="bh-paper-pile-dialog-headerTitle" bh-paper-pile-dialog-role="bhPaperPileDialogHeader">' + options.title + '</h2>';
            if (isFixedDom) {
                $title.remove();
            }
        }

        if (!options.footer) {
            if ($footer.length > 0) {
                $footer.addClass('bh-clearfix');
                options.footer = $footer[0].outerHTML;
                $footer.remove();
            }
        } else {
            //当通过属性传入的footer时，默认在外面套上footer标签
            options.footer = '<footer class="bh-clearfix">' + options.footer + '</footer>';
            if (isFixedDom) {
                $footer.remove();
            }
        }

        if (isFixedDom) {
            var $dialogAside = $contentHtml.children("aside");
            if ($dialogAside.length > 0) {
                options.aside = $dialogAside[0].outerHTML;
                $dialogAside.remove();
            }
            options.layoutRole = $contentHtml.attr('bh-layout-role');
            options.layoutClass = $contentHtml.attr('class');
            options.content = $contentHtml[0].innerHTML;
        } else {
            options.content = '<section>' + options.content + '</section>';
            if (isFixedDom) {
                var $dialogAside = $contentHtml.children("aside");
                if ($dialogAside.length > 0) {
                    $dialogAside.attr('bh-paper-pile-dialog-role', 'aside');
                    options.aside = $dialogAside[0].outerHTML;
                    $dialogAside.remove();
                }
            }
        }

        return options;
    }

    /**
     * 给容器设定最小高度
     * @param $setContainer 要设置最小高度的容器
     * @param diff 去掉页头和页脚的偏移量
     * @param type type === "resetDialogMinHeight"是手动重设弹框高度时的处理
     */
    function setDialogContentMinHeight($dialogBody) {
        var heightData = getFrameHeight();
        var diffTop = $dialogBody.offset().top;
        var minHeight = heightData.windowHeight - heightData.footerHeight - diffTop;
        $dialogBody.css("min-height", minHeight + "px");
    }

    function getFrameHeight() {
        var windowHeight = $(window).height();
        var footerHeight = $("[bh-footer-role=footer]").outerHeight();
        var headerHeight = $("[bh-header-role=bhHeader]").outerHeight();
        return {
            "windowHeight": windowHeight,
            "footerHeight": footerHeight,
            "headerHeight": headerHeight
        };
    }

    /**
     * 隐藏弹出框
     * titleContainer 可选，与弹出框关联的title容器
     * referenceContainer 可选，与弹出框关联的内容容器
     * guid 可选，弹出框的guid
     * destroy 可选，值为true或false； true则在隐藏的同时将弹出框remove
     */
    function dialogHide(options) {
        var $dialog = "";
        var $titleContainer = "";
        var $referenceContainer = "";
        var guid = "";

        if (options.titleContainer) {
            $titleContainer = options.titleContainer;
            guid = $titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        } else if (options.referenceContainer) {
            $referenceContainer = options.titleContainer;
            guid = $referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        } else if (options.guid) {
            guid = options.guid;
        }

        if (!guid) {
            var $newestDialog = getTheNewestOpenDialog();
            if ($newestDialog) {
                $dialog = $newestDialog;
            } else {
                $dialog = $("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            }
            guid = $dialog.attr("bh-paper-pile-dialog-role-guid");
        }
        if (!$dialog) {
            $dialog = $("div[bh-paper-pile-dialog-role-guid=" + guid + "]");
        }

        if ($dialog.length > 0) {
            var dialogIndex = $dialog.attr("bh-paper-pile-dialog-role-index");
            dialogIndex = parseInt(dialogIndex, 10);
            var existDialogData = $("body").data("bh-paper-pile-dialog");
            var existDialogLen = existDialogData.length;
            //当传入关闭所有弹框时，将对话框指向最低一层
            if (options.isHideAll) {
                dialogIndex = 1;
            }
            //当点击父级弹框时，由高到低依次隐藏弹框
            if (dialogIndex < existDialogLen) {
                for (var i = existDialogLen; i >= dialogIndex; i--) {
                    var existItem = existDialogData[i - 1];
                    if (existItem) {
                        options = getCallbackFun(options, existItem);
                        var existGuid = existItem.guid;
                        guid = existGuid;
                        dialogToHide(existGuid, options);
                    }
                }
            } else {
                options = getCallbackFun(options, $dialog);
                dialogToHide(guid, options);
            }
        }

        if (options.toShowContainer) {
            options.toShowContainer.show();
        } else {
            $('body').find("[bh-paper-pile-dialog-role-hide-container-guid=" + guid + "]").show();
        }

        //三层纸质弹框关闭返回上次纸质弹框时  页脚位置不对
        if ($dialog.length > 0) {
            setTimeout(function() {
                $.bhPaperPileDialog.resetPageFooter(); //改变页面的页脚位置
                $.bhPaperPileDialog.resetDialogFooter(); //改变弹框的页脚位置    
            }, 1000);
        }
    }

    function getCallbackFun(options, $dialog) {
        if (!options.ignoreAllCallback) {
            if (!options.ignoreCloseCallback) {
                options.close = $dialog.data('closeFun');
            }
            if (!options.ignoreCloseBeforeCallback) {
                options.closeBefore = $dialog.data('closeBeforeFun');
            }
        }
        return options;
    }

    /**
     * 执行隐藏操作
     * @param guid
     * @param options
     */
    function dialogToHide(guid, options) {
        options.guid = guid;

        if (options.closeBefore && options.closeBefore instanceof Function) {
            var closeFlag = options.closeBefore();
            if (closeFlag) {
                doDialogHideHandle(guid, options);
            }
        } else {
            doDialogHideHandle(guid, options);
        }
    }

    function doDialogHideHandle(guid, options) {
        var $dialog = $("[bh-paper-pile-dialog-role-guid=" + guid + "]");
        var $titleContainer = $("[bh-paper-pile-dialog-role-title-guid=" + guid + "]");
        var $dialogContainer = $dialog.find("div.bh-paper-pile-dialog-container");
        $dialog.find('div[bh-paper-pile-dialog-role="bhPaperPileDialogFooter"]').remove();
        $dialogContainer.removeClass("bh-paper-pile-dialog-intoUp").addClass("bh-paper-pile-dialog-outDown");
        $titleContainer.removeClass("bh-paper-pile-dialog-parentTitle-toSmall").removeClass("bh-paper-pile-dialog-parentTitle-change").addClass("bh-paper-pile-dialog-parentTitle-toRestore");

        var $insertToDialog = $titleContainer.closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]");

        setTimeout(function() {
            //将父级弹框的内容显示出来
            if ($insertToDialog.length > 0) {
                $insertToDialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]").show();
            } else {
                //将内容的border去掉
                var fixedArticle = getFixedArticle();
                var $layoutContainer = "";
                if (fixedArticle) {
                    $layoutContainer = fixedArticle;
                } else {
                    $layoutContainer = $("[bh-container-role=container]");
                }
                if ($layoutContainer && $layoutContainer.length > 0) {
                    $layoutContainer.removeClass("bh-border-transparent").removeClass("bh-bg-transparent");
                }
            }

            $dialogContainer.removeClass("bh-bg-transparent");
            //隐藏弹框时重置一下页脚
            resetPageFooter({
                titleContainer: "", //可选，父层的title
                referenceContainer: "", //可选，想要将dialog插入的容器
                dialogContainer: "", //可选，弹出框容器
                guid: "" //可选，弹出框的guid
            });
            resetDialogFooter({
                titleContainer: "", //可选，与弹出框关联的title容器
                referenceContainer: "" //可选，与弹出框关联的内容容器
            });
        }, getAnimateTime());

        //弹出框的头部透明度变成0时，使其隐藏起来，避免出现文字重叠
        setTimeout(function() {
            if ($insertToDialog.length > 0) {
                $insertToDialog.find(".bh-paper-pile-closeIcon").show();
            }
            $dialog.addClass("bh-negative-zIndex").hide();

            setPageFooterToRelative();
            //if(!isHasParent){
            //    setPageFooterToRelative();
            //}else{
            //    resetPageFooter({guid: parentGuid});
            //}

            if (options.close && options.close instanceof Function) {
                //获取该弹框的header，section，footer，aside的jquery对象
                var dialogParts = getDialogPartDom($dialog);
                //执行初始化完成事件，并将对应节点的jquery对象返回
                options.close(dialogParts.dialogHeader, dialogParts.dialogSection, dialogParts.dialogFooter, dialogParts.dialogAside);
            }

            //当传入destroy是true，或autoDestroy是false时，将弹框移除
            if ((options && options.destroy) || (options && options.autoDestroy)) {
                dialogDestroy(options);
            }
        }, getAnimateTime() * 2);
    }

    //获取最新打开的弹框对象
    function getTheNewestOpenDialog() {
        var $newestDialog = "";
        var insertToDialogIndex = 0;
        var hasOpenDialogs = $("body").find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
        if (hasOpenDialogs.length > 0) {
            hasOpenDialogs.each(function() {
                var $itemDialog = $(this);
                var dialogIndex = parseInt($itemDialog.attr("bh-paper-pile-dialog-role-index"), 10);
                if (dialogIndex > insertToDialogIndex) {
                    $newestDialog = $itemDialog;
                }
            });
        }
        return $newestDialog;
    }

    function setPageFooterToRelative() {
        var $footer = $("[bh-footer-role=footer]");
        var footerNormalStyle = $footer.attr("bh-footer-role-normal-style");
        $footer.attr("style", footerNormalStyle);
    }

    function resetPageFooter(options) {
        $("[bh-footer-role=footer]").css("top", 0);
        var guid = "";
        if (options.titleContainer) {
            guid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        } else if (options.referenceContainer) {
            guid = options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        } else if (options.guid) {
            guid = options.guid;
        }
        var $dialog = "";
        if (!guid) {
            if (options.dialogContainer) {
                $dialog = options.dialogContainer;
            } else {
                $dialog = getTheNewestOpenDialog();
                //$dialog = $("[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            }
        } else {
            $dialog = $("[bh-paper-pile-dialog-role-guid=" + guid + "]");
        }
        //当弹框存在时才执行
        if ($dialog) {
            var positionAndHeight = getPositionAndHeight($dialog);
            //设置页面页脚style，使其绝对定位到页面底部
            setPageFooterToAbsolute(positionAndHeight);
        }
    }

    /**
     * 动画的执行的基础时间
     * @returns {number}
     */
    function getAnimateTime() {
        return 450;
    }

    /**
     * 将弹框销毁，不传任何值，则将所有的弹出框删除
     * titleContainer 可选，与弹出框关联的title容器
     * referenceContainer 可选，与弹出框关联的内容容器
     * guid 可选，弹出框的guid
     */
    function dialogDestroy(options) {
        var guid = getDialogGuid(options);

        if (guid) {
            removeDialogAttr(guid);
        } else {
            var $dialogs = $("body").find("div[bh-paper-pile-dialog-role=bhPaperPileDialog]");
            $dialogs.each(function() {
                var guid = $(this).attr("bh-paper-pile-dialog-role-guid");
                removeDialogAttr(guid);
            });
        }
    }

    /**
     * 移除对话框及与其关联的容器属性
     * @param guid
     */
    function removeDialogAttr(guid) {
        var $dialog = $("div[bh-paper-pile-dialog-role-guid=" + guid + "]");
        if ($dialog.length === 0) {
            return;
        }
        var dialogIndex = $dialog.attr("bh-paper-pile-dialog-role-index");
        dialogIndex = parseInt(dialogIndex, 10);
        $("[bh-paper-pile-dialog-role-title-guid=" + guid + "]").removeAttr("bh-paper-pile-dialog-role-title-guid").off("click");
        $("[bh-paper-pile-dialog-role-container-guid=" + guid + "]").removeAttr("bh-paper-pile-dialog-role-container-guid");
        $dialog.remove();

        var existDialogData = $("body").data("bh-paper-pile-dialog");
        var existDialogLen = existDialogData.length;
        if (existDialogLen === 1) {
            $("body").removeData("bh-paper-pile-dialog");
        } else {
            var newDialogData = [];
            for (var i = 0; i < existDialogLen; i++) {
                var existItem = existDialogData[i];
                var existIndex = existItem.index;
                if (existIndex != dialogIndex) {
                    if (existIndex > dialogIndex) {
                        existItem.index = existIndex - 1;
                        newDialogData.push(existItem);
                    } else {
                        newDialogData.push(existItem);
                    }
                }
            }
            $("body").data("bh-paper-pile-dialog", newDialogData);
        }
    }

    /**
     * 弹出框的结构html
     * @returns {string}
     */
    function getDialogHtml() {
        var _html =
            '<div class="bh-paper-pile-dialog @layoutRole" style="@style" bh-paper-pile-dialog-role="bhPaperPileDialog" bh-paper-pile-dialog-role-guid="@guid">' +
            '<div class="bh-paper-pile-dialog-container bh-animated-doubleTime bh-paper-pile-dialog-intoUp">' +
            '<i class="iconfont icon-close bh-pull-right bh-paper-pile-closeIcon" bh-paper-pile-dialog-role="bhPaperPileDialogCloseIcon"></i>' +
            //'<div class="bh-paper-pile-dialog-headerTitle" bh-paper-pile-dialog-role="bhPaperPileDialogHeader">' +
            '@title' +
            //'</div>' +
            '<div class="bh-paper-pile-body bh-card bh-card-lv1 @layoutClass" bh-paper-pile-dialog-role="bhPaperPileDialogBody" bh-layout-role="@layoutRole" style="@bodyStyle">' +
            '@content' +
            '</div>' +
            '<div class="bh-paper-pile-dialog-footer bh-border-v" bh-paper-pile-dialog-role="bhPaperPileDialogFooter">@footer</div>' +
            '</div>' +
            '</div>';
        return _html;
    }

    /**
     * 判断弹出框是否有页脚，有则显示页脚
     * @param $dialog
     * @param data
     * @param flag flag=get那就直接返回样式
     */
    function dialogFooterToFixed($dialog, data, flag) {
        var footerStyle = '';
        if (data.footer) {
            var dialogWidth = $dialog.outerWidth();
            var dialogLeft = $dialog.offset().left;
            footerStyle = 'left:' + dialogLeft + 'px;width:' + dialogWidth + 'px;position:fixed;bottom:0;top:auto;display:block;';
            if (flag !== 'get') {
                $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]")
                    .css({
                        "left": dialogLeft + "px",
                        "width": dialogWidth + "px",
                        "position": "fixed",
                        "bottom": "0",
                        "top": "auto",
                        "display": "block"
                    })
                    .removeClass('bh-paper-pile-dialog-footer-relative');
            }
        }
        return footerStyle;
    }

    /**
     * 获取浏览器和对话框的相关位置和高度等
     * @param $dialog
     * @returns {{}}
     */
    function getPositionAndHeight($dialog) {
        var data = {};
        var $window = $(window);
        var $body = $("body");
        var scrollTop = $window.scrollTop();
        var windowHeight = $window.height();

        var bodyHeight = $body.get(0).scrollHeight;

        var footerHeight = $("[bh-footer-role=footer]").outerHeight();

        if ($dialog) {
            var $dialogBody = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
            var dialogBodyHeight = $dialogBody.outerHeight(true);
            var dialogHeight = $dialog.outerHeight();
            var dialogOffset = $dialog.offset();
            var dialogBodyOffset = $dialogBody.offset();
            var dialogFooterHeight = 0;
            var $dialogFooter = $dialog.find('div[bh-paper-pile-dialog-role="bhPaperPileDialogFooter"]');
            if ($dialogFooter.length > 0) {
                dialogFooterHeight = $dialogFooter.outerHeight(true);
            }

            data.dialogBodyHeight = dialogBodyHeight;
            data.dialogBodyOffset = dialogBodyOffset;
            data.dialogOffset = dialogOffset;
            data.dialogHeight = dialogHeight;
            data.dialogFooterHeight = dialogFooterHeight;
        }

        data.windowHeight = windowHeight;
        data.scrollTop = scrollTop;
        data.bodyHeight = bodyHeight;
        data.footerHeight = footerHeight;
        return data;
    }

    /**
     * 设置页面和对话框页脚style
     * @param $dialog
     */
    function setCurrentFooterPosition($dialog) {
        //重置页脚前，将页面的页脚top清零，否则有子级弹框时，重设高度无效
        $("[bh-footer-role=footer]").css({
            "top": 0,
            "z-index": -1
        });
        var positionAndHeight = getPositionAndHeight($dialog);

        var $dialogFooter = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]");
        //var dialogFooterFixedStyle = $dialogFooter.attr("style");
        var dialogFooterFixedStyle = dialogFooterToFixed($dialog, {
            footer: true
        }, 'get');
        $dialogFooter.attr("bh-paper-pile-dialog-role-footer-fixed", dialogFooterFixedStyle);

        //设置页面页脚style，使其绝对定位到页面底部
        setPageFooterToAbsolute(positionAndHeight);
        var footerPositionTop = positionAndHeight.bodyHeight - positionAndHeight.footerHeight;

        //对话框高度小于浏览器高度，则让对话框页脚取消浮动
        var dialogShowHeight = positionAndHeight.dialogBodyHeight + positionAndHeight.dialogOffset.top;
        if (dialogShowHeight < positionAndHeight.windowHeight) {
            //如果弹出框的显示高度达不到页脚的top，则将页脚的位置下移，避免出现超出的侧边框线
            if (dialogShowHeight < footerPositionTop) {
                setDialogFooterRelative($dialogFooter, "low");
            } else {
                setDialogFooterRelative($dialogFooter);
            }
        }
    }

    function setPageFooterToAbsolute(positionAndHeight) {
        //设置页面页脚style，使其绝对定位到页面底部
        var $pageFooter = $("[bh-footer-role=footer]");
        if (!$pageFooter.attr("bh-footer-role-normal-style")) {
            var pageFooterNormalStyle = $pageFooter.attr("style");
            if (!pageFooterNormalStyle) {
                pageFooterNormalStyle = " ";
            }
            $pageFooter.attr("bh-footer-role-normal-style", pageFooterNormalStyle);
        }
        //当弹出框的高度大于浏览器的高度时，让body的高度再额外增加页脚高度。因为在弹框出现时页脚已经变成了绝对定位，且重设页脚前将页脚的top变为了0
        var footerPositionTop = positionAndHeight.bodyHeight;
        if (positionAndHeight.dialogBodyHeight + positionAndHeight.dialogBodyOffset.top > positionAndHeight.windowHeight) {
            footerPositionTop = positionAndHeight.dialogOffset.top + positionAndHeight.dialogBodyHeight;
        } else {
            footerPositionTop = positionAndHeight.windowHeight - positionAndHeight.footerHeight;
        }
        var footerPositionLeft = $("header[bh-header-role=bhHeader]").find("div.bh-headerBar-content").offset().left;
        $pageFooter.css({
            "top": footerPositionTop,
            "left": footerPositionLeft,
            "width": "100%",
            "position": "absolute",
            "z-index": "9999"
        });
    }

    /**
     * 滚动条滚动时，设置页脚样式
     * @param $dialog
     */
    function scrollToSetFooterPosition($dialog) {
        var positionAndHeight = getPositionAndHeight($dialog);

        var $dialogFooter = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogFooter]");
        if (positionAndHeight.windowHeight + positionAndHeight.scrollTop + positionAndHeight.footerHeight >= positionAndHeight.bodyHeight) {
            setDialogFooterRelative($dialogFooter, "low");
        } else {
            var dialogFooterFixedStyle = $dialogFooter.attr("bh-paper-pile-dialog-role-footer-fixed");
            $dialogFooter.attr("style", dialogFooterFixedStyle);
        }
    }

    /**
     * 将对话框页脚设成相对定位
     * @param $dialogFooter
     * @param flag  low
     */
    function setDialogFooterRelative($dialogFooter, flag) {
        //当弹出框的页脚没有任何内容时，不做任何处理
        if ($dialogFooter.contents().length === 0) {
            return;
        }

        var footerHeight = $("[bh-footer-role=footer]").outerHeight();
        var $dialog = $dialogFooter.closest('div[bh-paper-pile-dialog-role="bhPaperPileDialog"]');
        var $dialogBody = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
        var $dialogHeader = $dialog.find("[bh-paper-pile-dialog-role=bhPaperPileDialogHeader]");
        var dialogFooterHeight = $dialogFooter.outerHeight();
        var dialogFooterBottom = dialogFooterHeight + footerHeight;
        if (flag === "low") {
            dialogFooterBottom = dialogFooterHeight;
        }

        var dialogBodyHeight = 0;
        var layoutType = '';
        $dialogBody.children().each(function() {
            var $item = $(this);
            //先判断该布局是不是左右布局，是左右布局则继续读取它里面的子结构然后取高度大的nav或section的高度做dialogBodyHeight高度
            if ($item[0].localName === "nav") {
                layoutType = 'navLeft';
            }

            if (layoutType === 'navLeft') {
                var navContentHeight = 0;
                $item.children().each(function() {
                    navContentHeight += $(this).outerHeight();
                });
                if (navContentHeight > dialogBodyHeight) {
                    dialogBodyHeight = navContentHeight;
                }
            } else {
                var itemHeight = $item.outerHeight();
                dialogBodyHeight += itemHeight;
            }
        });

        var dialogBodyMinHeight = parseInt($dialogBody.css("min-height"), 10);
        dialogBodyMinHeight = dialogBodyMinHeight ? dialogBodyMinHeight : 0;

        //当弹出框的内容高度比弹出框的最小高度还小的时候，让弹出框的页脚能自适应高度
        if ((dialogBodyHeight + dialogFooterHeight) < dialogBodyMinHeight) {
            $dialogFooter.removeAttr("style");
            /**
             * 24是对话框页脚距离内容的间距
             * dialogBodyMinHeight是页面页脚高度和对话框页脚高度的和
             * 页面页脚的高度是32，所以24是安全距离可以直接加
             */

            var dialogHeaderHeight = $dialogHeader.length > 0 ? $dialogHeader.outerHeight() : 0;
            dialogBodyHeight += dialogHeaderHeight;
            //40 是设计给出的页脚与内容的距离, 16 是footer的padding-top值,故真实的页脚与内容的间距是40 - 16
            dialogBodyHeight += 40 - 16;
            // dialogBodyHeight += 24;
            // dialogBodyHeight += $dialogHeader.outerHeight();

            $dialogFooter.css({
                "top": dialogBodyHeight + "px",
                "bottom": "auto"
            }).addClass('bh-paper-pile-dialog-footer-relative');
        } else {
            if ($dialogFooter.css('position') !== 'absolute') {
                $dialogFooter.css({
                    "left": 0,
                    "bottom": dialogFooterBottom + "px",
                    "position": "relative"
                });
            } else {
                $dialogFooter.css({
                    "top": "auto",
                    "bottom": "0"
                });
            }
        }
        $dialogFooter.show();
    }

    /**
     * 弹出框的关闭事件监听
     * @param $dialog
     * @param data
     */
    function dialogEventListen($dialog, data) {
        //点击关闭按钮
        $dialog.on("click", "i[bh-paper-pile-dialog-role=bhPaperPileDialogCloseIcon]", function() {
            var guid = $(this).closest("[bh-paper-pile-dialog-role=bhPaperPileDialog]").attr("bh-paper-pile-dialog-role-guid");
            data.guid = guid;
            dialogHide(data);
        });

        //当关闭按钮不隐藏时，给头部title添加点击事件
        if (!data.hideCloseIcon) {
            //点击弹框头部条隐藏弹框
            data.titleContainer.on("click", function() {
                var guid = $(this).attr("bh-paper-pile-dialog-role-title-guid");
                data.guid = guid;
                dialogHide(data);
            });
        } else {
            data.titleContainer.css({
                "cursor": "default"
            });
        }

        //监听浏览器滚动事件，设置页脚样式
        if (data.footer) {
            $(window).scroll(function(e) {
                scrollToSetFooterPosition($dialog);
            });
        }
    }

    //重新设置弹框页脚的位置
    function resetDialogFooter(options) {
        var guid = getDialogGuid(options);
        if (guid) {
            setTimeout(function() {
                var $dialog = $("div[bh-paper-pile-dialog-role-guid=" + guid + "]");
                if (!$dialog.find('[bh-paper-pile-dialog-role="bhPaperPileDialogFooter"]').html()) {
                    return;
                }
                var positionAndHeight = getPositionAndHeight($dialog);
                var dialogShowHeight = positionAndHeight.dialogBodyHeight + positionAndHeight.dialogOffset.top;
                //对话框高度小于浏览器高度，则让对话框页脚取消浮动
                if (dialogShowHeight < positionAndHeight.windowHeight) {
                    setCurrentFooterPosition($dialog);
                } else {
                    //给弹出框的页脚添加浮动属性
                    dialogFooterToFixed($dialog, {
                        "footer": true
                    });
                }
            }, 50);
        }
    }

    function NewGuid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    //重设弹框的最小高度
    function resetDialogMinHeight(options) {
        var guid = getDialogGuid(options);
        if (guid) {
            var $dialog = $("div[bh-paper-pile-dialog-role-guid=" + guid + "]");
            var $dialogBody = $dialog.find("div[bh-paper-pile-dialog-role=bhPaperPileDialogBody]");
            setDialogContentMinHeight($dialogBody);
        }
    }

    //获取弹框的guid
    function getDialogGuid(options) {
        var guid = "";
        if (options.titleContainer) {
            guid = options.titleContainer.attr("bh-paper-pile-dialog-role-title-guid");
        } else if (options.referenceContainer) {
            guid = options.referenceContainer.attr("bh-paper-pile-dialog-role-container-guid");
        } else if (options.guid) {
            guid = options.guid;
        } else {
            var $insertToDialog = getTheNewestOpenDialog();
            if ($insertToDialog.length > 0) {
                guid = $insertToDialog.attr('bh-paper-pile-dialog-role-guid');
            }
        }
        return guid;
    }
})(jQuery);
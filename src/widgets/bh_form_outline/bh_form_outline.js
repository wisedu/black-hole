(function($) {
    $.bhFormOutline = {
        show: function(options) {
            var formOutlineDefaults = {
                insertContainer: "", //必填，要插入的容器
                width: 0,
                className: "",
                offset: {}, //可选，大纲的偏移量{ top, left, right, bottom}，默认是右对齐
                scrollOffsetTop: $('header[bh-header-role="bhHeader"]').outerHeight(), //可选，锚点定位的位置的top偏移量
                statistics: true, //可选，是否对表单输入进行统计， true默认进行统计,
                affix: false,
                bottom: null,
                customClass: ''
            };
            options = $.extend({}, formOutlineDefaults, options);
            formOutlineShow(options);
        },
        hide: function(options) {
            var formOutlineDefaults = {
                insertContainer: "", //可选，要插入的容器
                destroy: true //可选，隐藏时是否要删除该大纲，默认删除
            };
            options = $.extend({}, formOutlineDefaults, options);
            formOutlineHide(options);
        }
    };

    /***
     * 表单填写大纲
     * @param insertContainer 要插入的容器
     * @param offset 大纲的偏移量{ top, left, right, bottom}，默认是右对齐
     * @param scrollOffsetTop 锚点定位的位置偏移量
     * @param statistics 是否对表单输入进行统计， true默认进行统计
     */
    function formOutlineShow(options) {
        var formOutlineGuid = options.insertContainer ? options.insertContainer.attr("bh-form-outline-role-form-guid") : "";
        if (formOutlineGuid) {
            $("div[bh-form-outline-role-outline-guid=" + formOutlineGuid + "]")
                .removeClass("bh-fadeOut").addClass("bh-fadeIn").show();
            return;
        }

        //目前对左侧表单新增了滚动的事件监听，如果是点击outline引起的滚动，则跳过相应的事件处理
        var outlineItemClickAnimate = false;

        var outlineItemClickTimeout = null;

        //为内容块和大纲创建guid
        formOutlineGuid = NewGuid();
        //大纲外框html
        var formOutlineHtml = getFormOutlineHtml();
        //大纲子元素html
        var formOutlineItemHtml = getFormOutlineItemHtml();
        var outlineList = [];
        //获取生成大纲的title
        options.insertContainer.find("[bh-role-form-outline=title]").each(function() {
            var guid = NewGuid();
            var $item = $(this);
            var title = $item.text();
            $item.attr("bh-role-form-outline-item-title-guid", guid);
            outlineList.push({
                "title": title,
                "guid": guid
            });
        });

        //获取生成大纲的表单块
        options.insertContainer.find("[bh-role-form-outline=container]").each(function(index) {
            var guid = outlineList[index].guid;
            var $item = $(this);
            $item.attr("bh-role-form-outline-item-guid", guid);

            var statisticsData = {};
            statisticsData.editBoxCount = 0;
            statisticsData.enterEditBoxCount = 0;
            statisticsData = statisticsEditBox($item, "input", statisticsData);
            statisticsData = statisticsEditBox($item, "textarea", statisticsData);
            statisticsData = statisticsEditBox($item, "select", statisticsData);

            outlineList[index].statistics = statisticsData;
        });

        //生成大纲展示html
        var formOutlineContent = "";
        var outlineLength = outlineList.length;
        if (outlineLength > 0) {
            for (var i = 0; i < outlineLength; i++) {
                var outlineItem = outlineList[i];
                var active = "";
                if (i === 0) {
                    active = "bh-active";
                }
                var statistics = outlineItem.statistics;
                var count = "";
                var success = "";
                if (statistics) {
                    if (statistics.editBoxCount) {
                        if (options.statistics) {
                            count = statistics.enterEditBoxCount + "/" + statistics.editBoxCount;
                            success = statistics.enterEditBoxCount === statistics.editBoxCount ? "bh-success" : "";
                        }
                    }
                }

                formOutlineContent += formOutlineItemHtml.replace("@active", active).replace("@index", i + 1).replace("@text", outlineItem.title)
                    .replace("@success", success).replace("@count", count).replace("@guid", outlineItem.guid);
            }
        }

        //设置大纲位置
        var _style = "";
        if (options.offset) {
            var offset = options.offset;
            if (offset.left === 0 || offset.left) {
                _style += "left:" + offset.left + "px;";
            }
            if (offset.right === 0 || offset.right) {
                _style += "right:" + offset.right + "px;";
            }
            if (offset.top === 0 || offset.top) {
                _style += "top:" + offset.top + "px;";
            }
            if (offset.bottom === 0 || offset.bottom) {
                _style += "bottom:" + offset.bottom + "px;";
            }
        }

        //将大纲插入页面
        formOutlineHtml = formOutlineHtml.replace("@content", formOutlineContent).replace("@style", _style)
            .replace("@outlineGuid", formOutlineGuid).replace("@customClass", options.customClass);
        var hideBlockId = "bhFormOutline_hide_" + NewGuid();
        var $formOutline = $(formOutlineHtml);
        //添加一个隐藏块，用来计算文本是否超出div的宽度，超出则加上title
        $formOutline.append('<div id="' + hideBlockId + '" style="display: none;" class="bh-form-outline-itemText"></div>');

        if (options.width) {
            $formOutline.css({
                'width': options.width
            });
        }

        if (options.className) {
            $formOutline.addClass(options.className);
        }

        options.insertContainer.append($formOutline).attr("bh-form-outline-role-form-guid", formOutlineGuid);

        //计算和判断是否要添加title属性
        var hideBlock = $('#' + hideBlockId);
        $formOutline.find('.bh-form-outline-itemText').each(function() {
            var $item = $(this);
            var itemWidth = $item.width();
            var itemText = $item.text();
            hideBlock.html(itemText);
            var hideWidth = hideBlock.width();
            if (hideWidth > itemWidth) {
                $item.attr('title', itemText);
            }
        });

        //大纲表单输入事件监听
        if (options.statistics) {
            //对输入框进行输入或点击（针对非输入项的，如radio，checkbox）的事件监听
            options.insertContainer.on({
                "keydown": function(e) {
                    setTimeout(function() {
                        getEnterTagObj(e);
                    }, 50);
                },
                "click": function(e) {
                    getEnterTagObj(e);
                }
            });

            //监听 下拉列表 dropdownlist
            options.insertContainer.find(".jqx-dropdownlist-state-normal").each(function() {
                var $item = $(this);
                $item.on('select', function(event) {
                    var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                    checkAndRefreshCount($parentBlock);
                });
            });

            //监听 时间 datetimeinput
            options.insertContainer.find(".jqx-datetimeinput").each(function() {
                var $item = $(this);
                $item.on('valueChanged', function(event) {
                    var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                    checkAndRefreshCount($parentBlock);
                });
            });

            //监听 combobox
            options.insertContainer.find(".jqx-combobox").each(function() {
                var $item = $(this);
                $item.on('change', function(event) {
                    setTimeout(function() {
                        var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                        checkAndRefreshCount($parentBlock);
                    }, 50);
                });
            });

            //监听 文件上传
            options.insertContainer.find("[xtype=uploadfile],[xtype='uploadsingleimage'],[xtype='uploadmuiltimage']").each(function() {
                var $item = $(this);
                $item.on('bh.file.upload.done', function(event) {
                    setTimeout(function() {
                        var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                        checkAndRefreshCount($parentBlock);
                    }, 50);
                });

                $item.on('bh.file.upload.delete', function(event) {
                    setTimeout(function() {
                        var $parentBlock = $item.closest("[bh-role-form-outline=container]");
                        checkAndRefreshCount($parentBlock);
                    }, 50);
                });
            });
        }

        //浮动块的监听
        $formOutline.on("click", "div.bh-form-outline-item", function() {
            var $item = $(this);
            var $formOutline = $item.closest("div[bh-role-form-outline-fixed=bhFormOutline]");
            var guid = $item.attr("bh-role-form-outline-fixed-item-guid");
            var $title = options.insertContainer.find("[bh-role-form-outline-item-title-guid=" + guid + "]");
            var fixedTop = $title.offset().top;
            if (options.scrollOffsetTop) {
                fixedTop = fixedTop - parseInt(options.scrollOffsetTop, 10);
            }

            $("html, html body").animate({
                scrollTop: (fixedTop)
            }, 450);

            $formOutline.find("div.bh-form-outline-item").removeClass("bh-active");
            $item.addClass("bh-active");

            //outlineItemClickAnimate = true目的是让点击右侧outline切换时，跳过window上的scroll事件处理，配合
            //outlineItemClickTimeout使用，保证在快速切换时，中间也跳过window上的scroll事件处理；
            clearTimeout(outlineItemClickTimeout);
            outlineItemClickAnimate = true;
            outlineItemClickTimeout = setTimeout(function() {
                outlineItemClickAnimate = false;
            }, 700);
            if (options.affix) {
                resetOutlinePosition($item);
            }
        });

        var _style = $formOutline.attr("style");

        function scrollEvent() {
            var $window = $(window);
            var hostOffset = options.insertContainer.offset();
            var hostTop = hostOffset.top;
            var scrollTop = $window.scrollTop();

            setOutlineToFixed();

            //insertContainer在dom节点中销毁后，在内存中依然存在，如果滚动的时候为隐藏状态，则认为已经销毁
            if ($(options.insertContainer[0]).css('display') == 'none') {
                $(window).unbind('scroll', scrollEvent);
            }

            if (outlineItemClickAnimate || outlineList.length == 0) {
                return;
            }

            if (options.insertContainer.find('[bh-role-form-outline-item-title-guid="' + outlineList[0].guid + '"]').css('display') == 'none') {
                return;
            }

            for (var i = 0; i < outlineList.length; i++) {
                var offset = options.insertContainer.find('[bh-role-form-outline-item-title-guid="' + outlineList[i].guid + '"]').offset();
                if (offset && (offset.top - document.body.scrollTop > 0)) {
                    $formOutline.find("div.bh-form-outline-item").removeClass("bh-active");
                    $('[bh-role-form-outline-fixed-item-guid="' + outlineList[i].guid + '"]').addClass("bh-active");
                    resetOutlinePosition($('[bh-role-form-outline-fixed-item-guid="' + outlineList[i].guid + '"]'));
                    break;
                }
            }
        }

        function setOutlineToFixed() {
            var hostOffset = options.insertContainer.offset();
            var hostTop = hostOffset.top;
            var fixedContOffset = $formOutline.offset();
            var fixedLeft = fixedContOffset.left;
            var fixedContTop = fixedContOffset.top;
            var diffHeight = fixedContTop - hostTop;
            var scrollTop = $(window).scrollTop();

            if (scrollTop >= hostTop || $formOutline.data('bhAffixFlag') === undefined) {
                if ($formOutline.data('bhAffixFlag') !== true) {

                    var fixedStyleData = {
                        "left": fixedLeft + "px",
                        "position": "fixed",
                        "top": diffHeight
                    };

                    $formOutline.css(fixedStyleData).data("bhAffixFlag", true).data('bhfixedStyle', fixedStyleData);
                }
            } else {
                $formOutline.attr("style", _style).data("bhAffixFlag", false);
            }
        }

        function max(a, b) {
            return a < b ? b : a;
        }

        function min(a, b) {
            return a > b ? b : a;
        }

        var constant = {
            //outlineList 底部距离浏览器底部的最小距离（当移动到最底部的时候）
            'OUTLINE_BOTTOM_TO_BROWER_BOTTOM': options.bottom || 100,

            //outline大纲 可视区域的下方 点击何处触发outline上移（相对于浏览器底部的距离）
            'BOTTOM_POSITION_TRIGGER_MOVE_UP': 100,

            //outline大纲 可视区域的上方 点击何处触发outline下移（相对于浏览器顶部的距离）
            'TOP_POSITION_TRIGGER_MOVE_DOWN': 100,

            //outline大纲往下移动时每次移动的距离
            'TOP_POSITION_TRIGGER_MOVE_DOWN_DISTANCE': 100,

        };

        var maxOutlineTop, minOutlineTop;

        function resetOutlinePosition(outlineItem) {
            setOutlineToFixed();

            //当前选择大纲项距离浏览器顶部的距离
            var currentItemToScreenTop = outlineItem.offset().top - document.body.scrollTop;

            //当前选择大纲项距离浏览器底部的距离
            var currentItemToScreenBottom = $(window).height() - currentItemToScreenTop;

            //outline top的最小值
            minOutlineTop = ($(window).height() - $formOutline.height() - constant['OUTLINE_BOTTOM_TO_BROWER_BOTTOM']);

            //outline top的最大值
            maxOutlineTop = maxOutlineTop === undefined ? $formOutline.data('bhfixedStyle').top : maxOutlineTop;

            //当前outline的top值
            var currentOutlineTop = +$formOutline.css('top').replace('px', '');

            if (currentItemToScreenBottom < constant['BOTTOM_POSITION_TRIGGER_MOVE_UP']) {
                var realOutlineTop = currentOutlineTop - currentItemToScreenBottom;
                $formOutline.css('top', max(realOutlineTop, minOutlineTop));
            }

            if (currentItemToScreenTop < constant['TOP_POSITION_TRIGGER_MOVE_DOWN']) {
                var realOutlineTop = currentOutlineTop + currentItemToScreenTop + constant['TOP_POSITION_TRIGGER_MOVE_DOWN_DISTANCE'];
                $formOutline.css('top', min(realOutlineTop, maxOutlineTop));
            }

            if ($(document).scrollTop() + $(window).height() >= $(document).height() && ($formOutline.height() + constant['OUTLINE_BOTTOM_TO_BROWER_BOTTOM'] >= $(window).height())) {
                $formOutline.css('top', minOutlineTop);
            }
        }

        if (options.affix) {
            $(window).bind('scroll', scrollEvent);
            $(window).trigger('scroll');
        }

    }

    function formOutlineHide(options) {
        var $formOutline = "";
        var guid = "";
        if (options.insertContainer) {
            guid = options.insertContainer.attr("bh-form-outline-role-form-guid");
            $formOutline = options.insertContainer.find("div[bh-form-outline-role-outline-guid=" + guid + "]");
        } else {
            $formOutline = $("[bh-role-form-outline-fixed=bhFormOutline]");
            guid = $formOutline.attr("bh-form-outline-role-outline-guid");
        }
        $formOutline.removeClass("bh-fadeIn").addClass("bh-fadeOut");
        if (options.destroy) {
            //当大纲被销毁时，将绑定的guid也一并销毁
            var $insertContainer = options.insertContainer ? options.insertContainer : $("[bh-form-outline-role-form-guid=" + guid + "]");
            $insertContainer.removeAttr("bh-form-outline-role-form-guid");
            $formOutline.remove();
        }
    }

    function getFormOutlineHtml() {
        var _html = '<div class="bh-form-outline bh-animated-doubleTime bh-fadeIn @customClass" bh-role-form-outline-fixed="bhFormOutline" bh-form-outline-role-outline-guid="@outlineGuid" style="@style">@content</div>';
        return _html;
    }

    function getFormOutlineItemHtml() {
        var _html =
            '<div class="bh-form-outline-item @active" bh-role-form-outline-fixed-item-guid="@guid">' +
            '<div class="bh-form-outline-itemIndex">@index</div>' +
            '<div class="bh-form-outline-itemText bh-str-cut">@text</div>' +
            '<div class="bh-form-outline-itemCount @success">@count</div>' +
            '</div>';
        return _html;
    }

    function getEnterTagObj(e) {
        var $target = $(e.target || e.srcElement);
        var tagName = $target[0].localName;
        var $parentBlock = $target.closest("[bh-role-form-outline=container]");

        if (e.type === "click") {
            if (tagName === "input") {
                if ($target.attr("type") === "radio" || $target.attr("type") === "checkbox") {
                    checkAndRefreshCount($parentBlock);
                }
            }
        } else {
            if (tagName === "input" || tagName === "textarea" || tagName === "select") {
                checkAndRefreshCount($parentBlock);
            }
        }

    }

    function checkAndRefreshCount($editBox) {
        var statisticsData = {};
        statisticsData.editBoxCount = 0;
        statisticsData.enterEditBoxCount = 0;
        statisticsData = statisticsEditBox($editBox, "input", statisticsData);
        statisticsData = statisticsEditBox($editBox, "textarea", statisticsData);
        statisticsData = statisticsEditBox($editBox, "select", statisticsData);

        var $count = $("div[bh-role-form-outline-fixed=bhFormOutline]").find("div[bh-role-form-outline-fixed-item-guid=" + $editBox.attr("bh-role-form-outline-item-guid") + "]")
            .find(".bh-form-outline-itemCount");
        var countText = $.trim($count.text());
        var newCount = statisticsData.enterEditBoxCount + "/" + statisticsData.editBoxCount;
        if (countText != newCount) {
            if (statisticsData.enterEditBoxCount === statisticsData.editBoxCount) {
                $count.addClass("bh-success");
            } else {
                $count.removeClass("bh-success");
            }
            $count.html(newCount);
        }

        $editBox.data("formOutlineKeyUpCount", 0);
    }

    //统计输入框和已编辑的项
    function statisticsEditBox($container, tagName, statisticsData) {
        if (tagName === "input") {
            //存放radio和checkbox，一组radio或checkbox是一个输入项
            var radioCheckboxGroupData = {};
            //存放其他的input
            var inputData = [];
            $container.find(tagName).each(function() {
                var $item = $(this);
                if (!$item.closest(".bh-row").attr("hidden")) {
                    var type = this.type;
                    //radio和checkbox时，将name放入json对象中
                    if (type === "radio" || type === "checkbox") {
                        var name = this.name;
                        radioCheckboxGroupData[name] = name;
                    } else {
                        if (type !== 'hidden') {
                            inputData.push($item);
                        } else {
                            if ($item.parent().attr('xtype') === 'select') {
                                return;
                            }
                            if ($item.closest('.jqx-dropdownlist-state-normal').length > 0) {
                                inputData.push($item);
                            }
                        }
                    }
                }
            });

            //统计其他input的输入项
            var inputDataLen = inputData.length;
            if (inputDataLen > 0) {
                for (var i = 0; i < inputDataLen; i++) {
                    statisticsData.editBoxCount++;
                    var $item = inputData[i];
                    if ($.trim($item.val()).length != 0) {
                        statisticsData.enterEditBoxCount++;
                    } else if ($item.attr('type') === 'file' && $item.closest('.bh-file-img-container').length > 0) {
                        if ($item.closest('.bh-file-img-container').hasClass('saved') || $item.closest('.bh-file-img-container').hasClass('success')) {
                            statisticsData.enterEditBoxCount++;
                        }
                    } else {
                        //文件上传统计
                        var $uploadFile = $item.closest('[xtype=uploadfile]');
                        if ($uploadFile.length > 0) {
                            if ($uploadFile.find('a.bh-file-upload-name-a').length > 0) {
                                statisticsData.enterEditBoxCount++;
                            }
                        }
                    }
                }
            }

            //统计radio和checkbox的输入项
            for (var key in radioCheckboxGroupData) {
                statisticsData.editBoxCount++;
                var value = $container.find("input[name='" + key + "']:checked").val();
                if (value) {
                    statisticsData.enterEditBoxCount++;
                }
            }
        } else if (tagName == 'select') {
            // 如果是表单的select的话，没有select标签的
            $container.find('[xtype=select]').each(function() {
                var $item = $(this);
                if (!$item.closest(".bh-row").attr("hidden")) {
                    statisticsData.editBoxCount++;
                    var selectValue = $item.jqxDropDownList('getSelectedItem');
                    if (selectValue && selectValue.value != '') {
                        statisticsData.enterEditBoxCount++;
                    }
                }
            });
        } else {
            $container.find(tagName).each(function() {
                var $item = $(this);
                if (!$item.closest(".bh-row").attr("hidden")) {
                    statisticsData.editBoxCount++;
                    if ($.trim($item.val()).length != 0) {
                        statisticsData.enterEditBoxCount++;
                    }
                }
            });
        }

        return statisticsData;
    }


    function NewGuid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

})(jQuery);
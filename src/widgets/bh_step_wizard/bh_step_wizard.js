/**
 * 可折叠面板
 *
 */
(function($) {
    /**
     * 定义一个插件
     */
    var Plugin;

    var g = {};

    /**
     * 这里是一个自运行的单例模式。
     */
    Plugin = (function() {
        /**
         * 插件实例化部分，初始化时调用的代码可以放这里
         */
        function Plugin(element, options) {
            //将插件的默认参数及用户定义的参数合并到一个新的obj里
            this.settings = $.extend({}, $.fn.bhStepWizard.defaults, options);
            //将dom jquery对象赋值给插件，方便后续调用
            this.$element = $(element);
            init(this.settings, this.$element);
        }

        Plugin.prototype.addItem = function(i, item, total) {
            addItem(i, item, total);
        };
        Plugin.prototype.resetActiveItem = function(stepId) {
            resetActiveItem(stepId);
        };
        Plugin.prototype.resetFinishedItems = function(stepIds) {
            g.finishedItemStepIds = stepIds;
            for (var i = 0; i < g.finishedItemStepIds.length; i++) {
                var finishedStepId = g.finishedItemStepIds[i];
                var finishedIndex = getIndexByStepId(finishedStepId);
                refreshElementByIndex(finishedIndex);
            }
        };
        Plugin.prototype.activeNextItem = function() {
            activeNextItem();
        };
        Plugin.prototype.activePrevItem = function() {
            activePrevItem();
        };

        /**
         * 把指定的步骤切成active状态
         * @param stepId
         */
        Plugin.prototype.changeToActive = function(stepId) {
            changeToActive(stepId);
        };
        Plugin.prototype.changeToFinished = function(finishedStepId) {
            if (finishedStepId == undefined || finishedStepId == null) {
                finishedStepId = g.activeItemStepId;
            }
            //1、设置指定的步骤为finished
            if (isExistInFinisheds(finishedStepId)) return;
            addToFinisheds(finishedStepId);
            var finishedIndex = getIndexByStepId(finishedStepId);
            refreshElementByIndex(finishedIndex);
        };

        Plugin.prototype.resetWidth = function() {
            resetItemWidth();
        };

        Plugin.prototype.isLastStep = function() {
            var lastStepId = g.items[g.items.length - 1]["stepId"];
            var result = false;
            if (g.activeItemStepId == lastStepId) {
                result = true;
            } else {
                result = false;
            }
            return result;
        };
        Plugin.prototype.getFinishedIndexs = function() {
            var result = [];
            if (g.finishedItemStepIds && g.finishedItemStepIds.length > 0) {
                for (var i = 0; i < g.finishedItemStepIds.length; i++) {
                    result.push(getIndexByStepId(g.finishedItemStepIds[i]));
                }
            }
            return result;

        };
        Plugin.prototype.getStepIdByIndex = function(index) {
            var result = -1;
            if (g.items && g.items.length > 0 && g.items[index]) {
                result = g.items[index]["stepId"];
            }
            return result;
        };
        Plugin.prototype.deleteItem = function(stepId) {
            resizeWizard(function($item){
                $item.remove();
            });
        };
        Plugin.prototype.showItem = function(stepId) {
            resizeWizard(stepId, function($item){
                $item.show();
            });
        };
        Plugin.prototype.hideItem = function(stepId) {
            resizeWizard(stepId, function($item){
                $item.hide();
            });
        }

        return Plugin;

    })();

    function init(options, dom) {
        g.items = options.items;
        g.activeItemStepId = options.active;
        g.finishedItemStepIds = options.finished;
        g.wizardContainer = dom;
        g.contentContainer = options.contentContainer;
        g.change = options.change;

        $(options.items).each(function(i, item) {
            addItem(i, item, options.items.length);
        });

        g.wizardElement = $(g.wizardContainer).children(".bh-wizard-item");

        $(options.items).each(function(i, item) {
            refreshElementByIndex(i);
        });

        if (options.isAddClickEvent) {
            //绑定点击事件
            addClickEvent();
        }

        resetItemWidth();

        g.wizardElement.each(function(index, m) {
            if (g.wizardElement && g.wizardElement.length > 0) {
                if ($(m).hasClass("active")) {
                    //打开对应的step的信息区域
                    $("#" + $(m).attr("stepid")).removeClass("bh-hide");
                } else {
                    $("#" + $(m).attr("stepid")).addClass("bh-hide");
                }

            }
        });

    }

    function resetItemWidth(){
        var itemLen = g.wizardElement.length;
        if(itemLen > 0){
            var $wizardContainer = g.wizardContainer;
            var sumWidth = $wizardContainer.width();
            var hiddenCount = $(".bh-wizard-item:hidden", $wizardContainer).length;
            var count = itemLen - hiddenCount;
            var itemWidth = Math.floor(sumWidth / count);
            //40是左右两个箭头的宽度
            g.wizardElement.find('.title').width(itemWidth - 40);
        }
    }

    function resetActiveItem(stepId) {
        g.activeItemStepId = stepId;
    }

    function activePrevItem() {
        //重置上一个激活项的样式
        var prevActiveItemIndex = getActiveItemIndex();
        var stepId = getPrevVisiableStepId(prevActiveItemIndex);
        if(stepId != null){
            changeToActive(stepId);
        }
    }

    /**
     * 获取上一个显示的步骤ID
     */
    function getPrevVisiableStepId(_index) {
        var result = null;
        var newActiveItemIndex = _index - 1;
        if (g.items[newActiveItemIndex] != null) {
            var stepId = g.items[newActiveItemIndex]["stepId"];
            if(g.wizardElement.parent().find("[stepid='"+stepId+"']").is(":hidden")){
                result = getPrevVisiableStepId(newActiveItemIndex);

            }else{
                result = stepId;
            }
        }
        return result;
    }
    /**
     * 获取上一个显示的步骤ID
     */
    function getNextVisiableStepId(_index) {
        var result = null;
        var newActiveItemIndex = _index + 1;
        if (g.items[newActiveItemIndex] != null) {
            var stepId = g.items[newActiveItemIndex]["stepId"];
            if(g.wizardElement.parent().find("[stepid='"+stepId+"']").is(":hidden")){
                result = getNextVisiableStepId(newActiveItemIndex);
            }else{
                result = stepId;
            }
        }
        return result;
    }

    function activeNextItem() {
        //重置上一个激活项的样式
        var prevActiveItemIndex = getActiveItemIndex();
        var stepId = getNextVisiableStepId(prevActiveItemIndex);
        if(stepId != null){
            changeToActive(stepId);
        }
    }

    function changeToActive(stepId) {
        //1、取消上一个步骤处于激活状态
        var prevActiveItemStepId = g.activeItemStepId;
        var prevActiveItemIndex = getActiveItemIndex();

        resetActiveItem(stepId);

        refreshElementByIndex(prevActiveItemIndex);
        g.contentContainer.find("#" + prevActiveItemStepId).addClass("bh-hide");

        //2、设置指定的步骤的项为激活状态
        var newActiveItemIndex = getActiveItemIndex();
        refreshElementByIndex(newActiveItemIndex);
        g.contentContainer.find("#" + g.activeItemStepId).removeClass("bh-hide");

        if (typeof g.change != 'undefined' && g.change instanceof Function) {
            g.change({ "stepId": stepId });
        }
    }

    function addItem(i, item, total) {
        var newItem = $('<div class="bh-wizard-item" stepid="' + item.stepId + '">' +
            '<div class="left-arrow"></div>' +
            '<div class="title bh-str-cut" title="' + item.title + '"><i></i>' + item.title + '</div>' +
            '<div class="right-arrow"></div>' +
            '</div>');
        if (i == 0) {
            $(newItem).addClass("bh-wizard-item-first");
        } else if (i == (total - 1)) {
            $(newItem).addClass("bh-wizard-item-last");
        }
        g.wizardContainer.append(newItem);
    }
    /**
     * 判断步骤项是否在已完成列表中
     * @param stepId
     * @returns {boolean}
     */
    function isExistInFinisheds(stepId) {
        var isExist = false;
        for (var i = 0; i < g.finishedItemStepIds.length; i++) {
            if (g.finishedItemStepIds[i] == stepId) {
                isExist = true;
                break;
            }
        }
        return isExist;
    }

    function addToFinisheds(finishedStepId) {
        if (g.finishedItemStepIds) {
            var maxLen = g.finishedItemStepIds.length;
            if (maxLen > 0) {
                g.finishedItemStepIds[maxLen] = finishedStepId;
            } else {
                g.finishedItemStepIds[0] = finishedStepId;
            }
        }
    }

    function isActive(index) {
        var activeIndex = getIndexByStepId(g.activeItemStepId);
        if (activeIndex == index) {
            return true;
        }
        return false;
    }

    function isFinished(index) {
        var finishedCount = g.finishedItemStepIds.length;
        var result = false;
        if (finishedCount > 0) {
            for (var i = 0; i < finishedCount; i++) {
                if (index == getIndexByStepId(g.finishedItemStepIds[i])) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    function refreshElementByIndex(index) {
        var targetElement = g.wizardElement[index];
        var icon = $("i", $(targetElement));
        icon.removeClass();
        if (isFinished(index)) {
            $(targetElement).addClass("finished");
            icon.addClass("iconfont icon-checkcircle");
        } else {
            $(targetElement).removeClass("finished");
        }
        if (isActive(index)) {
            $(targetElement).addClass("active");
            icon.addClass("iconfont icon-edit");
        } else {
            $(targetElement).removeClass("active");
        }
    }

    function isActiveItem(stepId) {
        if (stepId == g.activeItemStepId) {
            return true;
        } else {
            return false;
        }
    }

    function addClickEvent() {
        g.wizardElement.unbind("click").click(function() {
            var thisElement = $(this);
            var stepId = thisElement.attr("stepid");
            if (isActiveItem(stepId)) return;
            changeToActive(stepId);
        })
    }

    function getIndexByStepId(stepId) {
        var index = -1;
        for (var i = 0; i < g.items.length; i++) {
            if (g.items[i]["stepId"] == stepId) {
                index = i;
                break;
            }
        }
        return index;
    }

    function getActiveItemIndex() {
        var index = 0;
        for (var i = 0; i < g.items.length; i++) {
            if (g.items[i]["stepId"] == g.activeItemStepId) {
                index = i;
                break;
            }
        }
        return index;
    }

    function resizeWizard(stepId, callback) {
        if (stepId == null || stepId == undefined) return;
        var firstStepId = g.items[0]["stepId"];
        var lastStepId = g.items[g.items.length - 1]["stepId"];

        var $item = g.wizardContainer.find(".bh-wizard-item[stepid=" + stepId + "]");
        if ($item.length > 0) {
            callback($item);
        }
        g.wizardElement = $(g.wizardContainer).children(".bh-wizard-item");
        if (stepId == firstStepId) {
            g.wizardElement.eq(0).addClass("bh-wizard-item-first")
        } else if (stepId == lastStepId) {
            g.wizardElement.last().addClass("bh-wizard-item-last");
        }

        resetItemWidth();
    }
    /**
     * 这里是关键
     * 定义一个插件 plugin
     */
    $.fn.bhStepWizard = function(options, params) {
        var instance;
        instance = this.data('bhStepWizard');
        /**
         * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
         */
        if (!instance) {
            return this.each(function() {
                //将实例化后的插件缓存在dom结构里（内存里）
                return $(this).data('bhStepWizard', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        /**
         * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
         * 如 $('#id').plugin('doSomething') 则实际调用的是 $('#id).plugin.doSomething();
         * doSomething是刚才定义的接口。
         * 这种方法 在 juqery ui 的插件里 很常见。
         */
        if ($.type(options) === 'string') {
            var result = instance[options](params);
            return result;
        }
        //return this;
    };

    /**
     * 插件的默认值
     */
    $.fn.bhStepWizard.defaults = {
        items: [], //步骤参数集合 title,stepId,active,finished
        active: '', //当前激活项的stepId
        finished: [], //当前已完成项的stepId数组
        isAddClickEvent: true, //步骤条是否可点
        contentContainer: $("body"), //正文的容器选择器
        change: null
    };
})(jQuery);

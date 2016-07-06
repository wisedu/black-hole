+(function() {
    if (typeof(Waves) !== "undefined") {
        Waves.attach('.bh-btn:not(.bh-disabled):not([disabled])');
        Waves.init();
    }

    var $body = $('body');
    //选择按钮组点击事件监听
    $body.on('click', '[bh-btn-role="bhSelectBtnGroup"]', function(e) {
        var $targetObj = $(e.target || e.srcElement);
        if ($targetObj.hasClass('bh-btn')) {
            var $group = $(this);
            $group.find('.bh-btn').removeClass('bh-active');
            $targetObj.addClass('bh-active');
        }
    });
})();


/* ========================================================================
 * Bootstrap: tab.js v3.3.4
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+ function($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function(element) {
        this.element = $(element)
    };

    Tab.VERSION = '3.3.4';

    Tab.TRANSITION_DURATION = 150;

    Tab.prototype.show = function() {
        var $this = this.element;
        var $ul = $this.closest('ul:not(.dropdown-menu)');
        var selector = $this.data('target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        if ($this.parent('li').hasClass('bh-active')) {
            return;
        }

        var $previous = $ul.find('.bh-active:last a');
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        });
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        });

        $previous.trigger(hideEvent);
        $this.trigger(showEvent);

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
            return;
        }

        var $target = $(selector);

        this.activate($this.closest('li'), $ul);
        this.activate($target, $target.parent(), function() {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            });
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            })
        })
    };

    Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find('> .bh-active');
        var transition = callback && $.support.transition && (($active.length && $active.hasClass('bh-fade')) || !!container.find('> .bh-fade').length);

        function next() {
            $active
                .removeClass('bh-active')
                .find('> .dropdown-menu > .bh-active')
                .removeClass('bh-active')
                .end()
                .find('[data-toggle="bhTab"]')
                .attr('aria-expanded', false);

            element
                .addClass('bh-active')
                .find('[data-toggle="bhTab"]')
                .attr('aria-expanded', true);

            if (transition) {
                element[0].offsetWidth; // reflow for transition
                element.addClass('bh-in');
            } else {
                element.removeClass('bh-fade');
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('bh-active')
                    .end()
                    .find('[data-toggle="bhTab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
            .one('bsTransitionEnd', next)
            .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next();

        $active.removeClass('bh-in')
    };


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('bs.tab');

            if (!data) $this.data('bs.tab', (data = new Tab(this)));
            if (typeof option == 'string') data[option]();
        })
    }

    var old = $.fn.tab;

    $.fn.tab = Plugin;
    $.fn.tab.Constructor = Tab;


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function() {
        $.fn.tab = old;
        return this;
    };


    // TAB DATA-API
    // ============

    var clickHandler = function(e) {
        e.preventDefault();
        Plugin.call($(this), 'show')
    };

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="bhTab"]', clickHandler);

}(jQuery);


+ function($) {
    'use strict';

    $(document).on("click", ".bh-table tr", function(e) {
        if (e.target.nodeName == "INPUT") {
            return;
        }
        var _self = $(this);
        var table = _self.closest("table.bh-table");
        var tbody = table.children("tbody");

        if (_self.hasClass("bh-ch-active")) {
            _self.removeClass("bh-ch-active");
            ampTableGetColTds(_self, 0, "bh-ch-active");
        } else {
            table.find("tr.bh-ch-active, td.bh-ch-active").removeClass("bh-ch-active");
            _self.addClass("bh-ch-active");
            ampTableGetColTds(_self, 1, "bh-ch-active");
        }
    }).on("mouseover", ".bh-table td", function() {
        var _self = $(this);
        _self.parent("tr").addClass("bh-ch-hover");
        ampTableGetColTds(_self, 1, "bh-ch-hover");

    }).on("mouseout", ".bh-table td", function() {
        var _self = $(this);
        _self.parent("tr").removeClass("bh-ch-hover");
        ampTableGetColTds(_self, 0, "bh-ch-hover");
    });

    function ampTableGetColTds($ele, type, className) {
        /*var table = $ele.closest("table.bh-table-cross-highlight");
        var index = $ele.index();
        table.find("tr").each(function(){
            var td = $(this).children("td:eq(" + index + ")");
            if (type) {
                td.addClass(className);
            }else {
                td.removeClass(className);
            }
        });*/
    }

}(jQuery);

/**
 * bhDialog插件
 */
(function() {
    $.bhDefaults = $.bhDefaults || {};
    $.bhDefaults.Dialog = {
        type: '', //可以传三个值，success/warning/danger
        title: '',
        content: '',
        className: '',
        buttons: [{
            text: '确定',
            className: 'bh-btn-primary',
            callback: null
        }],
        width: 370,
        height: "auto"
    };
    /**
     *
     * @param options
     * options.iconType: '',
     * options.title:'标题',
     * options.content:'内容',
     * options.buttons:[{text:'确定',className:'bh-btn-primary'}]
     */
    $.bhDialog = function(options) {
        var bodyHtml = $("body");
        var params = $.extend({}, $.bhDefaults.Dialog, options || {});
        var g = {};
        var po = {
            _init: function() {
                var dialog = $("<div></div>");
                var dialogId = po.NewGuid();
                dialog.attr("id", "dialog" + dialogId);

                var dialogModal = $("<div class='bh-modal'></div>");

                var dialogWin = $("<div class='bh-pop bh-card bh-card-lv4 bh-dialog-con'></div>");
                if (params.width) {
                    dialogWin.width(params.width);
                }
                if (params.className) {
                    dialogWin.addClass(params.className);
                }

                //根据iconType添加icon相应的dom
                po._createDialogIcon(dialogWin);

                //根据内容和按钮，添加对话框正文相应的dom
                po._createDialogBody(dialogWin, dialogId);

                dialogModal.append(dialogWin);

                dialog.append(dialogModal);

                //灰色的蒙版层
                dialog.append($('<div class="bh-modal-backdrop"></div>'));
                bodyHtml.append(dialog);
                po._resetPos(dialogWin);
                po._checkScrollbar();
                bodyHtml.addClass("bh-has-modal-body");
            },
            _resetPos: function(dialogWin) {
                //重新计算dialogWin的位置，让其垂直方向居中
                var _clientHeight = document.documentElement.clientHeight; //可视区域的高度
                var _contentHeight = dialogWin.height();

                dialogWin.css("margin-top", (_clientHeight - _contentHeight) / 2);
            },
            _checkScrollbar: function() {
                var fullWindowWidth = window.innerWidth;
                if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
                    var documentElementRect = document.documentElement.getBoundingClientRect();
                    fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
                }
                var bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
                var scrollbarWidth = po._measureScrollbar();
                po._setScrollbar(bodyIsOverflowing, scrollbarWidth);
            },
            _setScrollbar: function(bodyIsOverflowing, scrollbarWidth) {
                var bodyPad = parseInt((bodyHtml.css('padding-right') || 0), 10);
                g.originalBodyPad = document.body.style.paddingRight || '';
                if (bodyIsOverflowing) bodyHtml.css('padding-right', bodyPad + scrollbarWidth);
            },
            _resetScrollbar: function() {
                bodyHtml.css('padding-right', g.originalBodyPad);
            },
            _measureScrollbar: function() { // thx walsh
                var scrollDiv = document.createElement('div');
                scrollDiv.className = 'bh-modal-scrollbar-measure';
                bodyHtml.append(scrollDiv);
                var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                bodyHtml[0].removeChild(scrollDiv);
                return scrollbarWidth;
            },
            _removeDialog: function(dialogId) {
                $("#dialog" + dialogId).remove();
                po._resetScrollbar();
                bodyHtml.removeClass("bh-has-modal-body");
            },
            _createDialogBody: function(dialogWin, dialogId) {
                //组装body
                var dialogBody = $("<div class='bh-dialog-content'></div>");

                //设置对话框的正文
                var dialogContent = $('<div class="content"></div>');
                dialogContent.html(params.content);

                dialogBody.append(dialogContent);

                po._createDialogBtn(dialogBody, dialogId);

                dialogWin.append(dialogBody);

                if (params.content == '') {
                    dialogWin.find('.content').css('height', '80px');
                    dialogWin.addClass('bh-dialog-minHeight');
                }
            },

            _createDialogBtn: function(dialogBody, dialogId) {
                var dialogBtnContainer = $('<div class="bh-dialog-center"></div>');
                if (params.buttons && params.buttons.length > 0) {
                    var btnLen = params.buttons.length;
                    for (var i = 0; i < btnLen; i++) {
                        var btn = po._createBtn(params.buttons[i], dialogId);
                        dialogBtnContainer.append(btn);
                    }
                } else {
                    //页面必须有一个按钮
                    var btn = po._createBtn({
                        text: "确定",
                        className: "bh-btn-primary"
                    }, dialogId);
                    dialogBtnContainer.append(btn);
                }

                dialogBody.append(dialogBtnContainer);
            },
            /**
             * 单个按钮的创建方法
             * @param btnInfo
             * @param dialogId
             * @returns {*|jQuery|HTMLElement}
             * @private
             */
            _createBtn: function(btnInfo, dialogId) {
                var btn = $("<a href='javascript:void(0);' class='bh-btn'></a>");
                if (btnInfo && btnInfo.text) btn.text(btnInfo.text);
                if (btnInfo && btnInfo.className) btn.addClass(btnInfo.className);
                btn.click(function() {
                    po._removeDialog(dialogId);
                    btnInfo.callback && btnInfo.callback();
                });
                return btn;
            },
            /**
             * 根据iconType，把icon相应的dom加到dialogWin中
             * @param dialogWin
             * @private
             */
            _createDialogIcon: function(dialogWin) {
                if (params.type != '') {
                    var dialogHtml = po._getDialogIconDom(params.type);
                    dialogWin.append(dialogHtml);
                }
            },
            /**
             * 根据icon类型，返回构造成icon的dom字符串
             * @param iconType
             * @returns {string}
             * @private
             */
            _getDialogIconDom: function(type) {
                var iconClass = '';
                if (type == 'success') {
                    iconClass = 'checkcircle';
                } else if (type == 'warning') {
                    iconClass = 'error';
                } else if (type == 'danger') {
                    iconClass = 'cancel';
                }
                var iconDomString = '<div class="bh-dialog-title-con">' +
                    '<i class="iconfont icon-setstyle icon-' + iconClass + ' bh-dialog-icon-color' + type + '"></i>' +
                    '<h2 class="bh-dialog-title-text">' + params.title + '</h2>' +
                    '</div>';

                return iconDomString;
            },
            /**
             * 生成随机字符串
             * @returns {string}
             * @constructor
             */
            NewGuid: function() {
                return (po.S4() + po.S4() + "-" + po.S4() + "-" + po.S4() + "-" + po.S4() + "-" + po.S4() + po.S4() + po.S4());
            },
            S4: function() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
        }
        if (params.type == "" && params.iconType) {
            params.type = params.iconType;
        }

        // 兼容 content为空的处理
        if (params.content === '' || params.content === undefined) {
            params.content = params.title;
            params.title = "提示";
            // if (params.type == 'success') {
            //     params.title = "提示";
            // } else if (params.type == 'warning') {
            //     params.title = "警告";
            // } else if (params.type == 'danger') {
            //     params.title = "提示";
            // }
        }
        po._init();
    };
}).call(this);

/**
 * radio型的label的点击样式切换
 */
+ function($) {
    'use strict';
    $(document).on("click", ".bh-label-radio", function(e) {
        var $item = $(this);
        $item.closest(".bh-label-radio-group").find(".bh-label-radio").removeClass("bh-active");
        $item.addClass("bh-active");
    });
}(jQuery);

/**
 * 给单列的表单的行添加背景
 */
+ function($) {
    'use strict';
    $(document).on("click", "input.bh-form-control", function(e) {
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "textarea.bh-form-control", function(e) {
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "input[type='radio']", function(e) {
        changeFormLineBgColor($(this));
    });
    $(document).on("click", "input[type='checkbox']", function(e) {
        changeFormLineBgColor($(this));
    });


    function changeFormLineBgColor($item) {
        var $form = $item.closest("[bh-form-role=bhForm]");
        if ($form.length > 0 && !$form.hasClass('bh-form-S')) { // 竖直表单不添加行高亮样式
            $form.find(".bh-row").removeClass("bh-active");
            $item.closest(".bh-row").addClass("bh-active");
        }
    }
}(jQuery);


/**
 * 下拉按钮点击事件
 */
+ (function($) {
    'use strict';

    $(document).on("click", "[bh-dropdown-role=bhDropdownBtn]", function() {
        var $dropdown = $(this).closest("[bh-dropdown-role=bhDropdown]");
        $dropdown.find("[bh-dropdown-role=bhDropdownMenu]").toggleClass("bh-dropdown-open");
    });
})(jQuery);
;
(function($) {

    $.bh_choose = function(options) {
        return new chooseWidget(options);
    };

    $.bh_choose.default = {
        leftSourceUrl: '',
        leftSourceAction: '',
        leftLocalData: null,
        rightSourceUrl: '',
        rightSourceAction: '',
        rightLocalData: null,
        localSearchField: '',
        id: '',
        type: 'post',
        multiSelect: true,
        showOrder: false,
        title: '添加应用',
        showSelectedTip: true,
        placeholder: '输入关键字搜索',
        maxSelect: null,
        height: '500px',
        width: '900px',
        topHtml: '',
        callback: function() {},
        rightcellsRenderer: function() {},
        leftcellsRenderer: function() {},
        afterDelete: function() {}
    };

    function chooseWidget(options) {
        this.options = $.extend({}, $.bh_choose.default, options);
        this.$element = this.getChooseLayout();
        this.selectedRecords = [];
    }

    chooseWidget.prototype = {
        /**
         * 获取右侧选中的记录
         * @return {[array]} [选中记录]
         */
        getSelectedRecords: function() {
            return this.$rightGrid.jqxDataTable('getRows');
        },

        /**
         * 显示choose弹框
         * @return {[null]} [null]
         */
        show: function() {
            this.showJqxWindow();
            this.initSelectedRecords(this.options.rightLocalData);
            this.initLeftTable();
            this.initRightTable();
            this.bindSearchEvent();
        },

        showJqxWindow: function() {
            var self = this;
            $('body').append(this.$element);
            this.$leftGrid = this.$element.find('.leftGrid');
            this.$rightGrid = this.$element.find('.rightGrid');

            this.$element.on("open", function() {
                $('body').getNiceScroll().remove();
                $('body').css({
                    overflow: 'hidden',
                    'overflow-x': 'hidden',
                    'overflow-y': 'hidden'
                });
            });

            var height = self.options.height || '500px';

            height = parseInt(height.replace('px', '')) / 2 + 'px';

            this.$element.jqxWindow($.extend({
                resizable: false,
                isModal: true,
                modalOpacity: 0.3,
                height: self.options.height || '500px',
                width: self.options.width || '900px',
                autoOpen: false
            }, {})).jqxWindow('open');

            this.$element.css({
                position: 'fixed',
                top: '50%',
                'margin-top': '-' + height

            });

            this.$element.on('close', function() {
                self.$element.jqxWindow('destroy');
                $('body').niceScroll();
            });
        },

        /**
         * *初始化selectedRecords 
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        initSelectedRecords: function(data) {
            if (!data) {
                return;
            }

            this.selectedRecords = data;
        },

        /**
         * 绑定左侧搜索事件
         * @return {[type]} [description]
         */
        bindSearchEvent: function() {
            var self = this;
            var debounced = window._ && _.debounce(function() {
                self.reloadLeftTable();
            }, 500);
            this.$element.find('.leftSearch').on('keyup', function(e) {
                if (e.keyCode == 13) {
                    self.reloadLeftTable();
                    window._ && debounced.cancel();
                } else {
                    window._ && debounced();
                }
            });
        },

        /**
         * 初始化左侧表格
         * @return {[type]} [description]
         */
        initLeftTable: function() {
            var self = this;
            this.leftSource = this.getLeftSource();
            var dataAdapter = null;

            if (this.leftSource.url) {
                dataAdapter = new $.jqx.dataAdapter(this.leftSource, {
                    formatData: function(data) {
                        data.pageSize = data.pagesize;
                        data.pageNumber = data.pagenum + 1;
                        $.extend(data, self.options.leftSourceParams);
                        delete data.pagesize;
                        delete data.pagenum;
                        delete data.filterslength;
                        return data;
                    },
                    downloadComplete: function(data) {
                        var action = self.options.leftSourceAction;
                        var sourceDatas = action ? data.datas[action] : data.datas;

                        self.leftSource.totalRecords = sourceDatas.totalSize;
                        data.recordsTotal = sourceDatas.totalSize;
                        data.data = sourceDatas.rows;
                        delete data.datas;
                        delete data.code;
                        return data;
                    }
                });
            } else if (this.leftSource.localdata) {
                dataAdapter = new $.jqx.dataAdapter(this.leftSource);
            }

            var options = $.extend({}, this.getNormalWindowOptions(), {
                source: dataAdapter,
                pageable: this.leftSource.localdata ? false : true,
                height: 308,
                columns: self.options.leftColumns || [{
                    dataField: 'onlineDate',
                    cellsRenderer: function(row, column, value, rowData) {
                        var html = $(self.options.leftcellsRenderer(row, column, value, rowData));
                        $(html.children()[0]).addClass('gm-member-user');
                        return html.prop('outerHTML');
                    }
                }],
                rendered: function() {
                    self.leftRenderEventListener();
                }
            });

            self.$element.find('.leftGrid').jqxDataTable(options);
        },

        /**
         * 获取左右表格公共配置
         * @return {[type]} [description]
         */
        getNormalWindowOptions: function() {
            return {
                showHeader: false,
                pagerButtonsCount: 3,
                serverProcessing: true,
                showStatusbar: false,
                showToolbar: false,
                pagerMode: 'advanced',
                localization: Globalize.culture('zh-CN'),
                pageSizeOptions: ['10', '20', '50', '100'],
                width: '100%',
                pagerHeight: 28
            };
        },

        /**
         * 获取左侧数据源
         * @return {[type]} [description]
         */
        getLeftSource: function() {
            var leftSource = null;
            if (this.options.leftLocalData) {
                leftSource = {
                    localdata: this.options.leftLocalData,
                    datatype: 'array'
                };
            } else {
                leftSource = {
                    id: 'id',
                    datatype: 'json',
                    url: this.options.leftSourceUrl,
                    type: this.options.type
                };
            }

            return leftSource;
        },

        /**
         * 左侧表格新增全选按钮
         * @return {[type]} [description]
         */
        addSelectAllButton: function() {
            var self = this;

            if (this.options.multiSelect === false || this.options.maxSelect !== null) {
                return;
            }
            var leftPager = this.$element.find('.leftGrid').find('.jqx-grid-pager');
            if (leftPager.find('.leftgrid-select-all').length > 0) {
                return;
            }
            leftPager.append('<div class="select-all-wrap"><div class="leftgrid-select-all" style="display:inline-block"></div><div class="select-all-text">全选</div></div>');
            leftPager.find('.leftgrid-select-all').jqxCheckBox().on('change', function(e) {
                var val = e.args.checked;
                var obj = self.$element.find('.leftGrid .gm-member-user');
                if (val) {
                    obj.jqxCheckBox('check');
                } else if (val === false) {
                    obj.jqxCheckBox('uncheck');
                }
            });
        },

        /**
         * 左侧渲染结束后添加事件监听
         * @return {[type]} [description]
         */
        leftRenderEventListener: function() {
            //return;
            var self = this,
                id = this.options.id,
                $leftGrid = this.$leftGrid,
                $rightGrid = this.$rightGrid,
                selected = self.selectedRecords,
                obj = self.$element.find('.leftGrid .gm-member-user');

            $leftGrid.find('tr').removeAttr('data-key');

            this.addSelectAllButton();
            this.leftGridRows = $leftGrid.jqxDataTable('getRows');
            this.rightGridRows = $rightGrid.jqxDataTable('getRows');

            if (obj.length > 0) {
                obj.jqxCheckBox().on('change', function(e) {
                    var selected = self.selectedRecords;
                    var val = e.args.checked,
                        index = e.target.getAttribute('row'),
                        currentId = self.leftGridRows[index][id],
                        hasSelected = false,
                        data = self.leftGridRows[index];

                    if (val) {
                        _.each(selected, function(item) {
                            if (item[id] + '' == data[id] + '') {
                                hasSelected = true;
                                return false;
                            }
                        });

                        if (hasSelected) {
                            return;
                        }

                        if (self.options.multiSelect === false) {
                            self.$element.find('.rightgrid-delete').trigger('click');
                            //selected.pop();
                        }
                        if (self.options.maxSelect !== null && self.options.maxSelect <= selected.length) {
                            $.bhTip({
                                content: '最多只能选中' + self.options.maxSelect + "条记录"
                            });
                            $(this).jqxCheckBox('uncheck');
                            return;
                        }
                        selected.push(data);
                        $rightGrid.jqxDataTable('addRow', null, data);

                    } else {

                        _.each(selected, function(item, index) {
                            if (item[id] + '' == currentId + '') {
                                selected.splice(index, 1);
                                return false;
                            }
                        });

                        /*_.each($rightGrid.jqxDataTable('getRows'), function(item, index) {
                            if (item[id] == currentId) {
                                $rightGrid.jqxDataTable('deleteRow', index);
                                return false;
                            }
                        });*/

                        self.refreshTable($rightGrid);

                        self.resetSelectALLStatus();
                    }
                    self.options.showSelectedTip && $rightGrid.prev().html("已选中 " + selected.length);
                });
            }
            for (var j = 0; j < selected.length; j++) {
                for (var i = 0; i < this.leftGridRows.length; i++) {
                    if (self.selectedRecords[j][id] + '' == this.leftGridRows[i][id] + '') {
                        $(obj[i]).jqxCheckBox("check");
                    }
                }
            }
            self.resetSelectALLStatus();
        },

        getRightSource: function() {
            var rightSource = null;
            if (this.options.rightLocalData) {
                rightSource = {
                    localdata: this.options.rightLocalData,
                    datatype: 'array'
                };
            } else if (this.options.rightSourceUrl) {
                rightSource = {
                    id: 'id',
                    datatype: 'json',
                    url: this.options.rightSourceUrl,
                    type: this.options.type
                };
            } else {
                rightSource = {
                    localdata: this.selectedRecords,
                    datatype: 'array'
                };
            }

            return rightSource;
        },

        initRightTable: function() {
            var self = this;
            var id = this.options.id;
            var rightSource = this.getRightSource();

            var dataAdapter = [];
            if (rightSource.url) {
                dataAdapter = new $.jqx.dataAdapter(rightSource, {
                    formatData: function(data) {
                        data.pageSize = data.pagesize;
                        data.pageNumber = data.pagenum + 1;
                        delete data.pagesize;
                        delete data.pagenum;
                        delete data.filterslength;
                        return data;
                    },
                    downloadComplete: function(data) {
                        var action = self.options.rightSourceAction;
                        var sourceData = action ? data.datas[action] : data.datas;

                        rightSource.totalRecords = sourceData.totalSize;
                        $.extend(data, self.options.leftSourceParams);
                        data.recordsTotal = sourceData.totalSize;
                        data.data = sourceData.rows;
                        self.initSelectedRecords(sourceData.rows);
                        delete data.datas;
                        delete data.code;
                        return data;
                    }
                });
            } else if (rightSource.localdata) {
                dataAdapter = new $.jqx.dataAdapter(rightSource);
            }

            var options = $.extend({}, this.getNormalWindowOptions(), {
                source: dataAdapter,
                pagerMode: 'advanced',
                height: 315,
                pageable: false,
                columns: self.options.rightColumns || [{
                    dataField: 'onlineDate',
                    cellsRenderer: function(row, column, value, rowData) {
                        var html = $(self.options.rightcellsRenderer(row, column, value, rowData));
                        var orderhtml = self.options.showOrder ? '<i class="iconfont icon-keyboardarrowup rightgrid-up"></i><i class="iconfont icon-keyboardarrowdown rightgrid-down"></i>' : '';

                        var deleteHtml = html.append('<a class="gm-member-delete" data-x-id="' + rowData[id] + '" href="javascript:void(0)">' + orderhtml + '<i class="iconfont icon-delete rightgrid-delete"></i></a>');
                        return deleteHtml.prop('outerHTML');
                    }
                }],
                rendered: function() {
                    self.rightRenderEventListener();
                }
            });

            self.$element.find('.rightGrid').jqxDataTable(options);
        },

        rightRenderEventListener: function() {
            var self = this;
            var id = this.options.id;
            var $rightGrid = self.$element.find('.rightGrid');
            $rightGrid.find('tr').removeAttr('data-key');
            self.$element.find('.rightgrid-down').on('click', function() {
                var row = $(this).parent();
                var currentId = row.attr('data-x-id');
                for (var i = 0; i < self.selectedRecords.length; i++) {
                    if (self.selectedRecords[i][id] + '' == currentId + '') {
                        if (i < self.selectedRecords.length - 1) {
                            var temp = self.selectedRecords[i];
                            self.selectedRecords[i] = self.selectedRecords[i + 1];
                            self.selectedRecords[i + 1] = temp;
                            break;
                        }
                    }
                }
                self.refreshTable(self.$element.find('.rightGrid'));
            });
            self.$element.find('.rightgrid-up').on('click', function() {
                var row = $(this).parent();
                var currentId = row.attr('data-x-id');
                for (var i = 0; i < self.selectedRecords.length; i++) {
                    if (self.selectedRecords[i][id] + '' == currentId + '') {
                        if (i > 0) {
                            var temp = self.selectedRecords[i];
                            self.selectedRecords[i] = self.selectedRecords[i - 1];
                            self.selectedRecords[i - 1] = temp;
                            break;
                        }
                    }
                }
                self.refreshTable(self.$element.find('.rightGrid'));
            });
            self.$element.find('.rightgrid-delete').on('click', function() {
                var $leftGrid = self.$element.find('.leftGrid');
                var row = $(this).parent();
                var currentId = row.attr('data-x-id');
                var memberRows = self.leftGridRows;
                var existInLeft = false;
                var selected = self.selectedRecords;
                var obj = $leftGrid.find('.gm-member-user');
                for (var i = 0; i < obj.length; i++) {
                    var val = $(obj[i]).jqxCheckBox('val');
                    if (val && memberRows[i][id] + '' == currentId + '') {
                        self.options.afterDelete(memberRows[i]);
                        for (var j = 0; j < self.selectedRecords.length; j++) {
                            if (self.selectedRecords[j][id] + '' == currentId) {
                                $(obj[i]).jqxCheckBox('uncheck');
                                self.resetSelectALLStatus();
                                existInLeft = true;
                            }
                        }
                    }
                }

                if (!existInLeft) {
                    _.each(selected, function(item, index) {
                        if (item[id] + '' == currentId + '') {
                            selected.splice(index, 1);
                            return false;
                        }
                    });

                    self.refreshTable(self.$rightGrid);
                    self.options.showSelectedTip && $rightGrid.prev().html("已选中 " + selected.length);
                }
            });
        },

        resetSelectALLStatus: function() {
            if (this.options.multiSelect === false || this.options.maxSelect !== null) {
                return;
            }
            var leftPager = this.$element.find('.leftGrid').find('.jqx-grid-pager');
            var $leftGrid = this.$element.find('.leftGrid');
            var obj = $leftGrid.find('.gm-member-user');

            var selectedLength = 0;
            for (var i = 0; i < obj.length; i++) {
                if ($(obj[i]).jqxCheckBox("val")) {
                    selectedLength++;
                }
            }

            if (selectedLength == 0 && leftPager.find('.leftgrid-select-all').jqxCheckBox('val') !== false) {
                leftPager.find('.leftgrid-select-all').jqxCheckBox('uncheck');
            } else if (selectedLength == obj.length) {
                leftPager.find('.leftgrid-select-all').jqxCheckBox('check');
            } else if (leftPager.find('.leftgrid-select-all').jqxCheckBox('val') === true) {
                leftPager.find('.leftgrid-select-all').jqxCheckBox('indeterminate');
            }
        },

        reload: function(querySetting) {
            this.reloadLeftTable(querySetting);
        },

        reloadLeftTable: function(querySetting) {
            var self = this;
            var searchKey = $.trim(self.$element.find('.leftSearch').val()).toLowerCase();
            var localSearchField = this.options.localSearchField.split(',');
            var localData = this.options.leftLocalData;

            if (localData) {
                var newArray = [];
                for (var i = 0; i < localData.length; i++) {
                    for (var j = 0; j < localSearchField.length; j++) {
                        var field = localData[i][localSearchField[j]];
                        if (!field) {
                            continue;
                        }
                        field = field.toLowerCase();
                        if (field.indexOf(searchKey) >= 0) {
                            newArray.push(localData[i]);
                            break;
                        }
                    }
                }
                self.leftSource.localdata = newArray;
            } else {
                self.leftSource.data = {
                    SEARCHKEY: searchKey,
                    querySetting: this.querySetting
                };
            }

            self.refreshTable(self.$element.find('.leftGrid'));
        },

        refreshTable: function($table) {
            if (!$table.jqxDataTable('goToPage', 0)) {
                $table.jqxDataTable('updateBoundData');
            }
        },

        getChooseLayout: function() {
            var self = this;
            var selectedLength = this.options.rightLocalData ? this.options.rightLocalData.length : 0;
            var $dom = $('<div style="padding-bottom:72px;">' +
                '<div class="head"></div>' +
                '<div>' +
                '<div class="content">' +
                '   <div class="content-top">' + this.options.topHtml + '</div>' +
                '   <div class="gm-add-block bh-clearfix">' +
                '        <div class="bh-col-md-6" style="background: #fff;padding-left:0px;padding-right:0px;">' +
                '            <div class="gm-add-search bh-mb-8" style="margin:7px 8px 0 8px">' +
                '                <input class="leftSearch" type="text" placeholder="' + this.options.placeholder + '">' +
                '              <a href="javascript:void(0)"><i class="iconfont">&#xe895;</i></a>' +
                '          </div>' +
                '         <div class="noBorderGrid leftGrid leftgrid-container"></div>' +
                '      </div>' +
                '     <div class="bh-col-md-6 rightgrid-container">' +
                (this.options.showSelectedTip === false ? '<h3>已选择字段</h3>' : ('<h3>已选中 ' + selectedLength + '</h3>')) +
                '           <div class="noBorderGrid transparentGrid rightGrid"></div>' +
                '      </div>' +
                '</div>' +
                '<div class="content-bottom"></div>' +
                '<div id="buttons" style="position: absolute;bottom:32px;width: 100%;left: 0;float: right;padding: 0 24px;">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');


            $(".head", $dom).append($("<h2></h2>").append(this.options.title));

            var btns = [{
                text: '确定',
                className: 'bh-btn-primary',
                callback: function() {
                    return self.options.callback(self.getSelectedRecords());
                }

            }, {
                text: '取消',
                className: 'bh-btn-default',
                callback: function() {
                    $dom.jqxWindow('close');
                }
            }];

            for (var i = btns.length - 1; i >= 0; i--) {
                var btn = $('<button class="bh-btn ' + btns[i].className + ' bh-pull-right">' + btns[i].text + '</button>');
                if (btns[i].callback) {
                    var cb = btns[i].callback;
                    btn.data("callback", cb);
                    btn.click(function() {
                        var cb = $(this).data("callback");
                        var needClose = cb.apply($dom, [$dom]);
                        if (needClose !== false)
                            $dom.jqxWindow('close');
                    });
                }
                $("#buttons", $dom).append(btn);
            }

            return $dom;
        }
    };

})(jQuery);
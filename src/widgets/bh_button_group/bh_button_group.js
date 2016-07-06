(function () {
    var Plugin, _init,_renderItem;
    Plugin = (function () {
        function Plugin(element, options) {
            this.options = $.extend({}, $.fn.bhButtonGroup.defaults, options);
            this.$element = $(element);
            _init(this.$element, this.options);
        }

        Plugin.prototype.setValue = function (val) {
            var value;
            if (!val || val == null || val == '') {
                value = 'ALL';
            }
            $('.bh-label-radio.bh-active', this.$element).removeClass('bh-active');
            $('.bh-label-radio[data-id=' + value + ']').addClass('bh-active');
        };

        Plugin.prototype.getValue = function () {
            var value = $('.bh-label-radio.bh-active', this.$element).data('id');
            return (value == 'ALL' ? '' : value);
        };

        return Plugin;
    })();

    _init = function (element, options) {

        if (options.data && options.data != null && options.data.length > 0) {
            _renderItem(options.data, element, options);
        } else if (options.url) {
            var source =
            {
                datatype: "json",
                root: "datas>code>rows",
                datafields: [
                    {name: 'id'},
                    {name: 'name'}
                ],
                id: 'id',
                url: options.url
            };
            var dataAdapter = new $.jqx.dataAdapter(source, {
                loadComplete: function (Array) {
                    var buttonGroupData = Array.datas.code.rows;
                    _renderItem(buttonGroupData, element, options);
                    element.trigger('bhInputInitComplete', element);
                }
            });
            dataAdapter.dataBind();
        }

    };

    _renderItem = function(arr, element, options) {
        var itemHtml = '';
        if (options.allOption) {
            itemHtml = '<div class="bh-active bh-label-radio" data-id="ALL">全部</div>';
        }
        $(arr).each(function () {
            itemHtml += '<div class="bh-label-radio" data-id="' + this.id + '">' + this.name + '</div>';
        });
        element.html(itemHtml);
    };

    $.fn.bhButtonGroup = function (options) {
        var instance;
        instance = this.data('plugin');
        if (!instance) {
            return this.each(function () {
                return $(this).data('plugin', new Plugin(this, options));
            });
        }
        if (options === true) return instance;
        if ($.type(options) === 'string') return instance[options]();
        return this;
    };

    $.fn.bhButtonGroup.defaults = {
        allOption: true
    };

}).call(this);
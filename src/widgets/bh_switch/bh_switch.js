(function($) {
	/**
	 * 这里是一个自运行的单例模式。
	 */
	var Switch = (function() {
		/**
		 * 插件实例化部分，初始化时调用的代码可以放这里
		 */
		function Switch(element, options) {
			//将插件的默认参数及用户定义的参数合并到一个新的obj里
			this.settings = $.extend({}, $.fn.bhSwitch.defaults, options);
			//将dom jquery对象赋值给插件，方便后续调用
			this.$element = $(element);
			init(this.settings, this.$element);
		}
		/**
         * 获取开关当前状态
         */
		Switch.prototype.getState = function() {
			return getState(this.$element);
		};
		/**
         * 打开开关
         */
		Switch.prototype.open = function() {
			openSwitch(this.$element);
		};
		/**
         * 关闭开关
         */
		Switch.prototype.close = function() {
			closeSwitch(this.$element);
		};
		return Switch;
	})();

	$.fn.bhSwitch = function(options, params) {
		var instance;
		instance = this.data('bhSwitch');
		/**
		 * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
		 */
		if (!instance) {
			return this.each(function() {
				//将实例化后的插件缓存在dom结构里（内存里）
				return $(this).data('bhSwitch', new Switch(this, options));
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
	$.fn.bhSwitch.defaults = {
		type: 'Normal'
	};
	/**
	 * 按钮开闭配置
	 */
	var stateConf = {
		on: ' on',
		off: 'off'
	};
	//初始化插件
	function init(options, dom) {
		//根据配置初始化switch
		var _switch = '';
		var type2Class = {
			'Normal': {
				background: 'Theme_Lv4',
				button: 'Card_Lv2 bhButtonOff',
				font: 'Caption_Default',
				label: '关闭',
				state: stateConf.off
			},
			'Keep': {
				background: 'Success',
				button: 'Card_Lv2 bhButtonOn',
				font: 'Caption_Success',
				label: '打开',
				state: stateConf.on
			},
			'Disable_off': {
				background: 'Theme_Lv4',
				button: 'Card_Lv0 bhButtonOff Theme_Lv3',
				font: 'Caption_Default',
				label: '关闭',
				state: stateConf.off
			},
			'Disable_on': {
				background: 'Success_Lv3',
				button: 'Card_Lv0 bhButtonOn',
				font: 'Caption_Success',
				label: '打开',
				state: stateConf.on
			}
		};
		_switch += '<div class="bhSwitchBody ' + type2Class[options.type].background + '">';
		_switch += '	<i class="bhSwitchButton ' + type2Class[options.type].button + '"></i>';
		_switch += '</div>';
		_switch += '<span class="bhSwitchLabel ' + type2Class[options.type].font + '">' + type2Class[options.type].label + '</span>';
		$(dom).addClass('bhSwitchContainer');
		setState(dom, type2Class[options.type].state);
		$(dom).empty().append(_switch);
		//根据是否有disable来bindclick
		if(options.type.indexOf('Disable') === -1){
			bindclick(dom, options);
		}
	}

	//click事件
	function bindclick(dom, options) {
		$(dom).bind('click', function() {
			var state = getState(this);
			//按钮改变前回调
			if(options.onChangeStart) options.onChangeStart(state);
			if (state === stateConf.on) {
				closeSwitch(this);
			} else if(state === stateConf.off) {
				openSwitch(this);
			}
			//按钮改变后回调
			if(options.onChangeEnd) options.onChangeEnd(getState(this));
		});
	}

	//获取开关状态
	function getState(dom) {
		return $(dom).attr('state');
	}

	//修改开关状态
	function setState(dom, state) {
		return $(dom).attr('state', state);
	}
	//打开开关
	function openSwitch(dom) {
		var state = getState(dom);
		var _dom = $(dom);
		if (state === stateConf.off) {
			setState(dom, stateConf.on);
			_dom.find('i').removeClass('bhButtonOff').addClass('bhButtonOn');
			_dom.find('div').removeClass('Theme_Lv4').addClass('Success');
			_dom.find('span').text('打开');
			_dom.find('span').removeClass('Caption_Default').addClass('Caption_Success');
		}
	}
	//关闭开关
	function closeSwitch(dom) {
		var state = getState(dom);
		var _dom = $(dom);
		if (state === stateConf.on) {
			setState(dom, stateConf.off);
			_dom.find('i').removeClass('bhButtonOn').addClass('bhButtonOff');
			_dom.find('div').removeClass('Success').addClass('Theme_Lv4');
			_dom.find('span').text('关闭');
			_dom.find('span').removeClass('Caption_Success').addClass('Caption_Default');
		}
	}
})(jQuery)
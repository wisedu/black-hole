;
(function($) {

	/*初始化flowState**/

	function ProgressBar(element, options) {
		this.options = $.extend({}, $.fn.flowState.defaultOptions, options);
		//将dom jquery对象赋值给插件，方便后续调用
		this.$element = $(element);
		appendHtml(this.options, this.$element);
		settingWidth(this.options, this.$element);
		openPopover(this.options);
	}

	ProgressBar.prototype = {

		resetFlowStatus: function(options) {
			options = $.extend({}, {
				index: NaN, //元素从1开始算起
				resetStatus: 'success', //状态为成功：success; 失败：fail; 操作中：operation ; 未开始： not started
				resetStatusDecription: '成功'
			}, options);
			resetFlowStatus(options, this);
		}

	};

	function openPopover(options) {
		//鼠标悬浮
		var length = options.flowStateData.length;
		for (var i = 0; i < length; i++) {
			openToolTip(options.flowStateData[i], i, length);
		}
	}
	// 如果当前的元素的index为0的话就加一个96的做编剧，如果是最后一个话就加一个-96的做编剧
	function openToolTip(data, index, length) {

		var left = 0;
		var toolTipDiv = ($('.bh-flowState-box')[index]);

		if (index === 0) {
			left = 96;
		} else if (index === (length - 1)) {
			left = -96;
		}

		$(toolTipDiv).jqxTooltip('destroy');

		if (data.isShowPop) {
			$(toolTipDiv).jqxTooltip({
				position: 'bottom',
				autoHide: false,
				top: 10,
				left: left,
				showArrow: false,
				closeOnClick: false,
				content: data.popHtml
			});
			$('.jqx-tooltip-main').css({
				'background-color': '#ffffff',
				'box-shadow': '0 4px 20px #bbb'

			});
			$(toolTipDiv).on('mouseout', function() {
				$(toolTipDiv).jqxTooltip('close');
			});
		}
	}

	function appendHtml(options, $element) {
		var stateData = getData(options);
		var boxHtml = addBoxContainer(stateData);
		var flowStateHtml = '<div class="bh-flowState bh-clearfix">' + boxHtml + '</div>';
		$element.html(flowStateHtml);
	}

	function addBoxContainer(stateData) {
		if (stateData) {
			var stateDataLen = stateData.length;
			var containerHtml = "";
			if (stateDataLen !== 0) {
				for (var i = 0; i < stateDataLen; i++) {
					containerHtml += getContentFromData(stateData, i + 1, stateDataLen);
				}
			}
			return containerHtml;
		}
	}
	//根据数据加载模板以及样式
	function getContentFromData(data, index, num) {
		var currentData = data[index - 1];
		var prevData = data[index - 2];
		var lineNum = num - 1;
		var circleStatus = getCircleStatusClass(currentData);
		var lineStatus = getLineStatueClass(currentData);
		var cls = [];
		//去掉第一个的before和最后一个的after
		if (index === 1) {
			cls.push('bh-flowState-hideLeft');
		} else if (index === num) {
			cls.push('bh-flowState-hideRight');
		}
		if (prevData && prevData.status === 'success') {
			cls.push('bh-flowState-prev-success');
		}
		var html = '<div class="bh-flowState-box ' + cls.join(' ') + '">' +
			'<div class="bh-flowState-num-circle ' + circleStatus + '">' + index + '</div>' +
			'<div class="bh-flowState-word">' +
			'<div class="bh-flowState-detail">' + currentData.content + '</div>' +
			'<a class="bh-flowState-status ' + circleStatus + '">' + currentData.statusDescription + '</a>' +
			'</div>' +
			'</div>' +
			'<div class="bh-flowState-line ' + lineStatus + ' " style="width:calc((100% - 96*' + num + 'px) / ' + lineNum + ')">' +
			'</div>';
		return html;

	}

	function getCircleStatusClass(data) {
		var map = {
			'success': 'bh-flowState-success',
			'fail': 'bh-flowState-fail',
			'operation': 'bh-flowState-operation'
		};
		return map[data.status || data.resetStatus];
	}
	// 除了成功的时候，横线有颜色，其他时候都没有颜色
	function getLineStatueClass(data) {
		var lineMap = {
			'success': 'bh-flowState-line-succes'
		};
		return lineMap[data.status || data.resetStatus];
	}
	// 获取reset之前的circle和状态说明文字的样式
	function getElePreClass($circle) {
		var preClass = "";
		if ($circle.hasClass("bh-flowState-success")) {
			preClass = "bh-flowState-success";
		} else if ($circle.hasClass("bh-flowState-fail")) {
			preClass = "bh-flowState-fail";
		} else if ($circle.hasClass("bh-flowState-operation")) {
			preClass = "bh-flowState-operation";
		}
		return preClass;
	}
	// 获取reset之前的横线的样式
	function getLinePreClass($circle) {
		var preLineClass = "";
		if ($circle.hasClass("bh-flowState-line-succes")) {
			preLineClass = "bh-flowState-line-succes";
		}
		return preLineClass;
	}

	function getData(options) {
		return options.flowStateData;
	}

	function settingWidth(options, $element) {
		$element.css('width', options.width);
		$element.find('.bh-flowState-line:last').css('width', '0');
	}

	function resetFlowStatus(options, progrossBar) {
		var index = options.index - 1;
		var boxEle = progrossBar.$element.find('.bh-flowState-box');
		var circleEle = progrossBar.$element.find('.bh-flowState-num-circle');
		var statusEle = progrossBar.$element.find('.bh-flowState-status');
		var lineEle = progrossBar.$element.find('.bh-flowState-line');
		var resetCircleColor = getCircleStatusClass(options);
		var resetLineColor = getLineStatueClass(options);
		var elePreColor = getElePreClass($(circleEle[index])); //因为circle和status用同一种颜色，所以如果获取到circle以前的颜色就能获取到staus以前的颜色
		var linePreColor = getLinePreClass($(lineEle[index]));
		$(statusEle[index]).text(options.resetStatusDecription);
		if (options.resetStatus === 'success') {
			$(boxEle[index + 1]).addClass('bh-flowState-prev-success');
		} else {
			$(boxEle[index + 1]).removeClass('bh-flowState-prev-success');
		}
		$(circleEle[index]).removeClass(elePreColor);
		$(statusEle[index]).removeClass(elePreColor);
		$(lineEle[index]).removeClass(linePreColor);
		$(circleEle[index]).addClass(resetCircleColor);
		$(statusEle[index]).addClass(resetCircleColor);
		$(lineEle[index]).addClass(resetLineColor);
		openToolTip(options, index, circleEle.length);
	}

	function flowState(options, params) {
		var instance;
		instance = this.data('flowState');
		/**
		 * 判断插件是否已经实例化过，如果已经实例化了则直接返回该实例化对象
		 */
		if (!instance) {
			return this.each(function() {
				//将实例化后的插件缓存在dom结构里（内存里）
				return $(this).data('flowState', new ProgressBar(this, options));
			});
		}
		if (options === true) return instance;
		/**
		 * 优雅处： 如果插件的参数是一个字符串，则 调用 插件的 字符串方法。
		 * 如 $('#id').ProgressBar('doSomething') 则实际调用的是 $('#id).ProgressBar.doSomething();
		 * doSomething是刚才定义的接口。
		 * 这种方法 在 juqery ui 的插件里 很常见。
		 */
		if ($.type(options) === 'string') instance[options](params);
		return this;
	}

	$.fn.flowState = flowState;
	/** status: 成功：success; 失败：fail; 操作中：operation ; 未开始： not started
		statusDescription：成功，失败，审核中，还没开始（为空）
	*/
	$.fn.flowState.defaultOptions = {
		width: '100%',
		flowStateData: [{
			id: "1",
			content: "个人提交",
			status: "success",
			statusDescription: "提交成功",
			popHtml: "<div class='bh-flowState-time'>审核时间：<span></span></div><div class='bh-flowState-suggestion'>审核意见：<span></span></div>",
			isShowPop: true
		}]
	};


})(jQuery);
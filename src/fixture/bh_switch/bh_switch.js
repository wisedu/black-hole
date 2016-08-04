//初始状态关闭，不可用
$('#test').bhSwitch({
	type: 'Disable_off'
});
//初始状态打开，不可用
$('#test2').bhSwitch({
	type: 'Disable_on'
});
//初始状态关闭
$('#test3').bhSwitch({
	type: 'Normal',
	//按钮改变前回调
	onChangeStart: function(state) {
		alert('按钮改变前回调，此时按钮状态为' + state);
	},
	//按钮改变后回调
	onChangeEnd: function(state) {
		alert('按钮改变后回调，此时按钮状态为' + state);

	}
});
//初始状态打开
$('#test4').bhSwitch({
	type: 'Keep'
});


//方形

////初始状态关闭，不可用
$('#test-square').bhSwitch({
	type: 'Disable_off',
	shape: 'square'
});
//初始状态打开，不可用
$('#test2-square').bhSwitch({
	type: 'Disable_on',
	shape: 'square'
});
//初始状态关闭
$('#test3-square').bhSwitch({
	type: 'Normal',
	shape: 'square',
	//按钮改变前回调
	onChangeStart: function(state) {
		alert('按钮改变前回调，此时按钮状态为' + state);
	},
	//按钮改变后回调
	onChangeEnd: function(state) {
		alert('按钮改变后回调，此时按钮状态为' + state);

	}
});
//初始状态打开
$('#test4-square').bhSwitch({
	type: 'Keep',
	shape: 'square'
});



//无标签
//初始状态关闭，不可用
$('#test-nolabel').bhSwitch({
	type: 'Disable_off',
	label: false,
});
//初始状态打开，不可用
$('#test2-nolabel').bhSwitch({
	type: 'Disable_on',
	label: false,
});
//初始状态关闭
$('#test3-nolabel').bhSwitch({
	type: 'Normal',
	label: false,
	//按钮改变前回调
	onChangeStart: function(state) {
		alert('按钮改变前回调，此时按钮状态为' + state);

	},
	//按钮改变后回调
	onChangeEnd: function(state) {
		alert('按钮改变后回调，此时按钮状态为' + state);

	}
});
//初始状态打开
$('#test4-nolabel').bhSwitch({
	type: 'Keep',
	label: false,
});


$('#getstate').click(function() {
	//获取开关状态
	alert($('#test').bhSwitch('getState'));
});
$('#test').bhSwitch({
	type: 'Disable_off'
});
$('#test2').bhSwitch({
	type: 'Disable_on'
});
$('#test3').bhSwitch({
	type: 'Normal',
	onChangeStart: function(state) {
		console.log(state);
	},
	onChangeEnd: function(state) {
		console.log(state);
	}
});
$('#test4').bhSwitch({
	type: 'Keep'
});
function colorpicker(){
	"use strict";
	$(document).ready(function() {
		$("input:radio[name=type_radio]").click(function() {
			var type = $(this).val();
			var shape = $("input:radio[name=shape_radio]:checked").val();
			//filterGraph(type, shape);
		});
		$("input:radio[name=shape_radio]").click(function() {
			var type = $("input:radio[name=type_radio]:checked").val();
			var shape = $(this).val();
			//filterGraph(type, shape);
		});
		$("#radio1").prop("checked", true);
		$("#radio5").prop("checked", true);

		$('#color-picker').ColorPicker({
			color : '#0000ff',
			onShow : function(colpkr) {
				$(colpkr).fadeIn(500);
				return false;
			},
			onHide : function(colpkr) {
				$(colpkr).fadeOut(500);
				return false;
			},
			onChange : function(hsb, hex, rgb) {
				var ix = -1;
				var shape = $("input:radio[name=shape_radio]:checked").val();
				d3.select("svg").selectAll(shape).style("fill", '#' + hex);
				var r1 = $("#radio1").prop("checked");
				var r2 = $("#radio2").prop("checked");
				var r3 = $("#radio3").prop("checked");
				var r4 = $("#radio4").prop("checked");
				if (r1 == true) {
					ix = 0;
				} else if (r2 == true) {
					ix = 1;
				} else if (r3 == true) {
					ix = 2;
				} else if (r4 == true) {
					ix = 3;
				}
				DATA_COLORS[ix] = '#' + hex;
			}
		});
		$('#color-picker-label').ColorPicker({
			color : '#0000ff',
			onShow : function(colpkr) {
				$(colpkr).fadeIn(500);
				return false;
			},
			onHide : function(colpkr) {
				$(colpkr).fadeOut(500);
				return false;
			},
			onChange : function(hsb, hex, rgb) {
				d3.selectAll(".label").style("fill", '#' + hex);
				TEXT_COLOR = '#' + hex;
			}
		});
	});
}
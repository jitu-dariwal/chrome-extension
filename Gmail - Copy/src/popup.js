// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 	
});


$('.tempClass').on('change', '.searchOption', function(){
	var optionValue = $(this).val();
	
	if(optionValue == 'after' || optionValue == 'before' || optionValue == 'older' || optionValue == 'newer'){
		$("input.searchValue").attr('placeholder', 'Select date');
		
		$('input.searchValue').attr('readonly', true).datepicker({
			format: 'yyyy/mm/dd',
			autoclose: true,
			immediateUpdates: true,
			todayBtn: true,
			todayHighlight: true,
			endDate: "today"
		}).datepicker("setDate", "0");
	}else if(optionValue == 'older_than' || optionValue == 'newer_than'){
		$("input.searchValue").addClass('olderNewer').attr('placeholder', 'Ex:1d (d->day, m->month, y->year)');
		
		$(".tempClass").on('keypress', 'input.olderNewer', function (e) {
			
			if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57) && (e.which != 68 && e.which != 100) && (e.which != 77 && e.which != 109) && (e.which != 68 && e.which != 100) && (e.which != 89 && e.which != 121)) {
				return false;
			}
		});
		$('input.searchValue').datepicker('destroy').attr('readonly', false).val('');
	}else if(optionValue == 'size' || optionValue == 'larger' || optionValue == 'smaller'){
		$('input.searchValue').removeClass('olderNewer').datepicker('destroy').attr('readonly', false).attr('placeholder', 'Size in bytes( m->MB)').val('');
	}else{
		$('input.searchValue').removeClass('olderNewer').datepicker('destroy').attr('readonly', false).attr('placeholder', 'Type here...').val('');
	}
});

$('.search').click(function(){
	var value = $('.searchValue').val();
	var optionValue = $('.searchOption').val();
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code: 'document.querySelectorAll(\'[name="q"]\')[0].value = \''+optionValue+':'+value+'\';document.querySelectorAll("button").forEach(item => {if(item.getAttribute(\'aria-label\') == \'Search Mail\'){item.click();}});'
			});
	});
});

document.querySelectorAll('.filterMail').forEach(item => {
	item.addEventListener('click', event => {
		var key = event.target.getAttribute("data-key");
		var value = event.target.getAttribute("data-value");
		//alert(key+' and '+value)
		
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(
				tabs[0].id,
				{code: 'document.querySelectorAll(\'[name="q"]\')[0].value = \''+key+': '+value+'\';document.querySelectorAll("button").forEach(item => {if(item.getAttribute(\'aria-label\') == \'Search Mail\'){item.click();}});'}
			);
		});
	})
})

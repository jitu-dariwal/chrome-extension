// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var backgroundPage = chrome.extension.getBackgroundPage();

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 
	
	if(backgroundPage.isFirstRun){
		$('#welcomeBox').show();
		backgroundPage.isFirstRun = false;
	}
	
	chrome.storage.local.get(null, function(result){
		//console.log("call", result);
		
		if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('alertTime'))
			$('#alertTime').val(result.settings.alertTime)
		
		if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('numberOfDays'))
			$('#numberOfDays').val(result.settings.numberOfDays)
	});
	
	$('.nav-tabs a').on('shown.bs.tab', function(event){
		var tab = $(event.target).data('id');
		
		if(tab == 'setting'){
			//console.log(backgroundPage.websitesToTrack);
			setWebSitesInputs();
		}
	});
	
	$(document).on('click', '.addMore', function(){
		var str = '<tr>';
			str += '<td width="80%">';
				str += '<input class="form-control form-control-sm" name="websites[]"/>';
			str += '</td>';
			str += '<td width="20%">';
				str += '<button class="btn btn-sm btn-success addMore"><i class="fa fa-plus"></i></button>';
			str += '</td>';
		str += '</tr>';
		
		$(this).removeClass('addMore btn-success').addClass('removeMore btn-danger').html('<i class="fa fa-minus"></i>');
		
		$('#websiteTd').find('table').append(str);
	});
	
	$(document).on('click', '.removeMore', function(){
		if($('#websiteTd').find('table tr').length > 1)
			$(this).closest('tr').remove();
	});
	
	$(document).on('click', '.saveOptions', function(){
		var alertTime = $('#alertTime').val();
		var numberOfDays = $('#numberOfDays').val();
		var websites = $("input[name='websites[]']").map(function(){return $(this).val();}).get();
		
		if(alertTime == null || alertTime == ''){
			$('<small class="text-danger">Please enter the value</small>').insertAfter($('#alertTime'));
			$('#alertTime').focus();
		}else{
			$('#alertTime').nextAll('small').remove();
			
			var validateKeyArray = ['settings'];
			validateKeyArray.push("DataOf-" + backgroundPage.dateStr(new Date(), 'dmy', ''));
			
			for(var j=1; j <= Number(numberOfDays); j++){
				var dateObj = new Date();
				
				dateObj.setDate(dateObj.getDate() - j);
				
				var keyStr = "DataOf-" + backgroundPage.dateStr(dateObj, 'dmy', '');
				
				validateKeyArray.push(keyStr);
			}
			
			chrome.storage.local.get(null, function(result){
				$.each(result, function(k,v){
					if ($.inArray(k, validateKeyArray) == -1){
						chrome.storage.local.remove(k)
					}
				});
			});
				
			var settings = {};
			
			settings['alertTime'] = alertTime;
			settings['numberOfDays'] = numberOfDays;
			
			var websitesObj = {};
			
			var i = 0;
			$.each(websites, function(k,v){
				if(v != null && v != '')
					websitesObj[i++] = backgroundPage.extractDomain(v);
			});
			
			settings['websitesToTrack'] = JSON.stringify(websitesObj);
			
			chrome.storage.local.set({'settings' : settings});
			
			backgroundPage.updateWebSites();
			
			alert("Option save successfully.")
		}
	});
	
	$(document).on('click', '.reSet', function(){
		/* Bellow code for clear chrome local data */
		chrome.storage.local.clear();
		
		/* Bellow code for reset local stogare value */
		
		backgroundPage.todayStorageName = "DataOf-" + backgroundPage.todayStr('dmy', '');
        backgroundPage.totalTimeOnWebsites = 0;
        
		backgroundPage.websitesToTrack = backgroundPage.defaultFixDomains;
		
		// Initialize the data objec that is to be placed in the localStorage
        var data = {};
		
		data['settings'] = {};
		
		data['settings']['alertTime'] = 30; // time in seconds
		data['settings']['numberOfDays'] = 3; // Number of days, to hold data of that days 
		data['settings']['websitesToTrack'] = JSON.stringify(backgroundPage.websitesToTrack);
		
		/* Below code for set test row data */
			var demoDate = "DataOf-06032020";
			
			data[demoDate] = {};
			
			// Store the values in the localStorage
			data[demoDate]['totalTime'] = 0;
			data[demoDate]["today"] = backgroundPage.today;
			data[demoDate]["todayStr"] = backgroundPage.todayStr('dmy', '');
			data[demoDate]["trackData"] = {};
			data[demoDate]["sitesLocked"] = false;
		
		/* End code for set test row data */
		
		data[backgroundPage.todayStorageName] = {};
		
        // Store the values in the localStorage
        data[backgroundPage.todayStorageName]['totalTime'] = 0;
        data[backgroundPage.todayStorageName]["today"] = backgroundPage.today;
        data[backgroundPage.todayStorageName]["todayStr"] = backgroundPage.todayStr('dmy', '');
        data[backgroundPage.todayStorageName]["trackData"] = {};
        data[backgroundPage.todayStorageName]["sitesLocked"] = false;
		
        chrome.storage.local.set(data, function(){});
		
		backgroundPage.startUp();
		
		setWebSitesInputs();
		
		alert("Data reset successfully.")
	});
	
	function setWebSitesInputs(){
		chrome.storage.local.get(null, function(result){
			//console.log("call", result);
			
			if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('alertTime'))
				$('#alertTime').val(result.settings.alertTime)
			
			if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('numberOfDays'))
				$('#numberOfDays').val(result.settings.numberOfDays)
		});
		
		var str = '<table class="table">';
			
		$.each(backgroundPage.websitesToTrack, function(k,v){
			str += '<tr>';
				str += '<td width="80%">';
					if ($.inArray(v, backgroundPage.defaultFixDomains) != -1)
						str += '<input class="form-control form-control-sm" value="'+v+'" name="websites[]" readonly/>';
					else
						str += '<input class="form-control form-control-sm" value="'+v+'" name="websites[]"/>';
				str += '</td>';
				str += '<td width="20%">';
					if ($.inArray(v, backgroundPage.defaultFixDomains) != -1)
						str += '&nbsp;';
					else
						str += '<button class="btn btn-sm btn-danger removeMore"><i class="fa fa-minus"></i></button>';
				str += '</td>';
			str += '</tr>';
		});
		
		str += '<tr>';
			str += '<td width="80%">';
				str += '<input class="form-control form-control-sm" name="websites[]"/>';
			str += '</td>';
			str += '<td width="20%">';
				str += '<button class="btn btn-sm btn-success addMore"><i class="fa fa-plus"></i></button>';
			str += '</td>';
		str += '</tr>';
		
		str += '</table>';
		
		$('#websiteTd').html(str);
	}
	
	$('#check').click(function(){
		//alert(backgroundPage.getActiveWebsite());
		
		alert(backgroundPage.getTimeOnFbTwitter());
		
		chrome.storage.local.get(null, function(result){
			console.log("call", result);
		});
	});
});


/*
* Function : getReadableTime();
* Usage : var readableTime = getReadableTime(2000);
* --------------------------------------------------
* This function takes in the number of seconds as arguments and then
* converts those number of seconds into hours and minutes respectively
* and returns a string that holds the proper time in the format of '3 hours 45 minutes and 3 seconds'
*/
function getReadableTime(totalSeconds) {
    var seconds = totalSeconds % 60;
    var minutes = (Math.floor(totalSeconds/60))%60;
    var hours = (Math.floor(totalSeconds/3600));
    var readableTime = '';
    if (hours > 1) 
        readableTime += hours + ' hours ';
    else if(hours == 1)
        readableTime += hours + ' hour '
    if (minutes > 1)
        readableTime += minutes + ' minutes and ' ;
    else if(minutes == 1)
        readableTime += minutes + ' minute and '
    if(seconds == 1){
        readableTime += seconds + ' second ';
    }else{
        readableTime += seconds + ' seconds ';
    }
    return readableTime;
}

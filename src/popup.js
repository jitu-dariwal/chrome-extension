// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var backgroundPage = chrome.extension.getBackgroundPage();

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 
	
	if(backgroundPage.isFirstRun)
		$('#welcomeBox').show();
	
	chrome.storage.local.get(null, function(result){
		//console.log(result);
	});
	
	$('.nav-tabs a').on('shown.bs.tab', function(event){
		var tab = $(event.target).data('id');
		
		if(tab == 'setting'){
			//console.log(backgroundPage.websitesToTrack);
			
			var str = '<table>';
			
			$.each(backgroundPage.websitesToTrack, function(k,v){
				str += '<tr>';
					str += '<td>';
						str += '<input class="form-control form-control-sm" value="'+v+'" readonly/>';
					str += '<td>';
				str += '<tr>';
			});
			
			str += '<tr>';
				str += '<td>';
					str += '<input class="form-control form-control-sm" readonly/>';
					str += '<span class="rounded-circle bg-red"><b>+</b></span>';
				str += '<td>';
			str += '<tr>';
			
			str += '</table>';
			
			$('#websiteTd').html(str);
		}
	});
	
	$('#check').click(function(){
		alert(backgroundPage.getActiveWebsite());
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

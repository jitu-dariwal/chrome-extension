// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


let getData = document.getElementById('getData');
let clearData = document.getElementById('clearData');

let redirectSite = document.getElementById('redirectSite');

let changeColor = document.getElementById('changeColor');
let removeColor = document.getElementById('removeColor');

chrome.storage.sync.get('color', function(data) {
	changeColor.style.backgroundColor = data.color;
	changeColor.setAttribute('value', data.color);
});

getData.onclick = function(element) {
	var pageNumber = document.getElementById('pageNumber').value;
	
	if(pageNumber == ''){
		alert("Enter page number")
	}else{
		const data = JSON.stringify({
			example_1: 123,
			example_2: 'Hello, world!',
		});
		
		fetch('https://reqres.in/api/users?page='+pageNumber, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			//body: data,
		}).then(response => {
			if (response.ok) {
				response.text().then(response => {
					var data = JSON.parse(response);
					//console.log(data);
					
					var str = '<b>Total page : </b>'+ data.total_pages + '<br/>';
					str += '<b>Page number : </b>'+ data.page + '<br/>';
					str += '<b>Number of records per-page: </b>'+ data.per_page + '<br/>';
					
					str += '<table border="2" cellspacing="5" cellpadding="5">';
					
					str += '<tr>';
						str += '<th>ID:</th>';
						str += '<th>Name:</th>';
						str += '<th>Email:</th>';
					str += '</tr>';
					
					var details = data.data;
					//console.log(details[0]);
					
					if(details.length > 0){
						Object.keys(details).forEach(function(key) {
							str += '<tr>';
								str += '<td>'+ details[key].id +'</td>';
								str += '<td>'+ details[key].first_name +' '+ details[key].last_name +'</td>';
								str += '<td>'+ details[key].email +'</td>';
							str += '</tr>';
						})
					}else{
						str += '<tr>';
							str += '<td colspan="3"><center>No data found...</center></td>';
						str += '</tr>';
					}
					
					str += '</table>';
					
					document.getElementById('details').innerHTML = str;
				});
			}
		});
	}
};

clearData.onclick = function(element) {
	document.getElementById('pageNumber').value = '';
	document.getElementById('details').innerHTML = '<h3>Details come here....</h3>';
};

redirectSite.onclick = function(element) {
	alert('https:google.com');
};

changeColor.onclick = function(element) {
	let color = element.target.value;
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code: 'document.body.style.backgroundColor = "' + color + '";'}
		);
	});
};

removeColor.onclick = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code: 'document.body.style.backgroundColor = "";'}
		);
	});
};

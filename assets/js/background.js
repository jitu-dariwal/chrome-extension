// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Global variable to store the active tab url
var activeTabUrl = "";

// Global variable that stores the amount of time spent by the user on facebook.com and twitter.com
var totalTimeOnWebsites;

// Global variable to track whether the user is active or not
var isUserActive;

// Stores the current date or the days that have passed since the UTC till today
var today;

// Stores the name of the key that stores the data for the current date 
var todayStorageName;

// An array of strings that hold the domain names of the websites that are supposed to be checked
var websitesToTrack;

var isFirstRun = false;

// Returns the current website being used
function getActiveWebsite() {
    return extractDomain(activeTabUrl);
}

// Returns whether the user is active right now or not
function isUserActiveNow() {
    return isUserActive;
}

chrome.runtime.onInstalled.addListener(function(details) {
	
	//console.log("Details : ", details);
	if(details.reason == "install"){
		
		isFirstRun = true;
        
        // Assign initial values to the variables
        today = new Date();
		
		var getDate = String(today.getDate()).padStart(2, '0');
		var getMonth = String((today.getMonth() + 1)).padStart(2, '0');
		var getYear = String(today.getFullYear());
		
		var todayStr = getDate+getMonth+getYear;
		
		todayStorageName = "DataOf-" +todayStr;
        totalTimeOnWebsites = 0;
        websitesToTrack = ["twitter.com", "facebook.com", "instagram.com"];
		
		// Initialize the data objec that is to be placed in the localStorage
        var data = {};
		
		data[todayStorageName] = {};
		
        // Store the values in the localStorage
        data[todayStorageName]['totalTime'] = totalTimeOnWebsites;
        data[todayStorageName]["today"] = today;
        data[todayStorageName]["todayStr"] = todayStr;
        data[todayStorageName]["trackData"] = JSON.stringify(websitesToTrack);
        data[todayStorageName]["sitesLocked"] = false;
		
        chrome.storage.local.set(data, function(){});
	}else{
		chrome.storage.local.get(null, function(result){
			console.log("Result : ", result);
		});
	}
});


//For highlighted tab as well
chrome.tabs.onHighlighted.addListener(checkForValidUrl);

function checkForValidUrl(tabId, changeInfo, tab) {
	//alert(chrome.runtime.getURL('/'));
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // The argument of the call back function is an array of tabs
		
        if (tabs.length > 0) {
            //tabs[0].url;
			chrome.pageAction.show(tabId.tabIds['0']);
        }
    });
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        chrome.pageAction.show(tabId);
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  var activeWindowId = activeInfo.windowId;
  var activeTabId = activeInfo.tabId;
  
  //alert('window : '+activeWindowId+'tab id : '+ activeTabId)
});

/*
* Function : numDaysSinceUTC()
* var numDaysSinceUTC = currentDate();
* ------------------------------------
* Returns the number of days that have passed since 
* January 1 1970, used in the process of checking 
* days that have passed
*/
function numDaysSinceUTC(){
    var NUM_MILI_IN_A_DAY = 86400000;
    var today = new Date();
    var utcMili = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()); // miliseconds since UTC
    return (utcMili/ NUM_MILI_IN_A_DAY);
}

/*
* Function : isNewDay()
* -----------------------
* Checks if a new day is dawned upon us, 
*/

function isNewDay(){
    return (numDaysSinceUTC() - today >= 1);
}

function todayTimeData(){
    return todayStorageName;
}


// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Global fix domains for user don't has permission for change it.
var defaultFixDomains = ["twitter.com", "facebook.com", "instagram.com"];

// Global variable to store the active tab url
var activeTabUrl = "";

// Global variable that stores the amount of time spent by the user on facebook.com and twitter.com
var totalTimeOnWebsites;

// Global variable to track whether the user is active or not
var isUserActive;

// Stores the current date or the days that have passed since the UTC till today
var today = new Date();

// Stores the name of the key that stores the data for the current date 
var todayStorageName = "DataOf-" + todayStr('dmy', '');

// An array of strings that hold the domain names of the websites that are supposed to be checked
var websitesToTrack;

// Set counter for set domains
var runningCounter;

var isFirstRun = false;


chrome.runtime.onInstalled.addListener(function(details) {
	
	//console.log("Details : ", details);
	if(details.reason == "install"){
		
		isFirstRun = true;
        
		todayStorageName = "DataOf-" + todayStr('dmy', '');
        totalTimeOnWebsites = 0;
        
		websitesToTrack = defaultFixDomains;
		
		// Initialize the data objec that is to be placed in the localStorage
        var data = {};
		
		data['settings'] = {};
		
		data['settings']['alertTime'] = 30; // time in seconds
		data['settings']['numberOfDays'] = 3; // Number of days, to hold data of that days 
		data['settings']['websitesToTrack'] = JSON.stringify(websitesToTrack);
		
		/* Below code for set test row data */
			var demoDate = "DataOf-06032020";
			
			data[demoDate] = {};
			
			// Store the values in the localStorage
			data[demoDate]['totalTime'] = 0;
			data[demoDate]["today"] = today;
			data[demoDate]["todayStr"] = todayStr('dmy', '');
			data[demoDate]["trackData"] = {};
			data[demoDate]["sitesLocked"] = false;
		
		/* End code for set test row data */
		
		data[todayStorageName] = {};
		
        // Store the values in the localStorage
        data[todayStorageName]['totalTime'] = 0;
        data[todayStorageName]["today"] = today;
        data[todayStorageName]["todayStr"] = todayStr('dmy', '');
        data[todayStorageName]["trackData"] = {};
        data[todayStorageName]["sitesLocked"] = false;
		
        chrome.storage.local.set(data, function(){});
		
		startUp();
		
		console.log(data);
	}else{
		//chrome.storage.local.get(null, function(data){ console.log(data) });
	}
});

startUp();

// Do all the startup tasks
function startUp() {
	
	updateWebSites();
	
    // Updating the ActiveTabUrl during initialization
    updateActiveTabUrl();

    // Register Events
    registerEvents(); // This one is important better left untouched

    // Setting isUserActive as true while starting up
    isUserActive = true;
	
	updateData();
	
    // Setting up the listener that will check if a new day is there
    setInterval(function(){
		updateData();
    }, 1000);
}

function updateWebSites(){
	//Initialize the totalTimeOnWebsites variable to the data gained from the local storage of the user
    chrome.storage.local.get(null, function(result){
        //console.log("Result : ", result);
        //console.log("Setting : ", result.settings);
		
		if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('websitesToTrack'))
			websitesToTrack = JSON.parse(result.settings.websitesToTrack);
    });
}

function registerEvents() {
    // Registering for onActivated event
    // This is fired when the active tab changes
    chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.pageAction.show(activeInfo.tabId);
        
		updateActiveTabUrl()
		
		//changeTabAction()
    });

    // Registering for onChanged event
    // This is fired when the url of a tab changes
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.url)
			chrome.pageAction.show(tabId);
		
		if(updateActiveTabUrl())
			changeTabAction()
    });
	
	//For highlighted tab as well
	// Registering for highlighted the tab on chnage tab
    // This is fired when the tab is change
	chrome.tabs.onHighlighted.addListener(function(tabId, changeInfo, tab){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // The argument of the call back function is an array of tabs
			
			if (tabs.length > 0){
				if(updateActiveTabUrl())
					changeTabAction()
				
				chrome.pageAction.show(tabId.tabIds['0']);
			}
		});
	});

    // Registering for onFocusChanged event
    // This is fired when the active chrome window is changed.
    chrome.windows.onFocusChanged.addListener(function(windowId) {
		
        // This happens if all the windows are out of focus
        // Using this condition to infer that the user is inactive
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            isUserActive = false;
        } else {
            isUserActive = true;
        }
		
        updateActiveTabUrl();
    });
}

function updateData(){
	chrome.storage.local.get(null, function(result){
		var validateKeyArray = ['settings'];
		validateKeyArray.push(todayStorageName);
		
		if (result.hasOwnProperty('settings') && result.settings.hasOwnProperty('numberOfDays')){
			for(var j=1; j <= Number(result.settings.numberOfDays); j++){
				var dateObj = new Date();
				
				dateObj.setDate(dateObj.getDate() - j);
				
				var keyStr = "DataOf-" + dateStr(dateObj, 'dmy', '');
				
				validateKeyArray.push(keyStr);
			}
		}
		
		var checkTodayStorageName = "DataOf-" + dateStr(new Date(), 'dmy', '');
		
		if (!validateKeyArray.includes(checkTodayStorageName)){
			
			today = new Date();
			todayStorageName = checkTodayStorageName;
			
			// Initialize the data objec that is to be placed in the localStorage
			var data = {};
			
			data[checkTodayStorageName] = {};
				
			// Store the values in the localStorage
			data[checkTodayStorageName]['totalTime'] = 0;
			data[checkTodayStorageName]["today"] = today;
			data[checkTodayStorageName]["todayStr"] = dateStr(today, 'dmy', '');
			data[checkTodayStorageName]["trackData"] = {};
			data[checkTodayStorageName]["sitesLocked"] = false;
			
			chrome.storage.local.set(data);
			
			updateData();
		}else{
			chrome.storage.local.get(null, function(result){
				for(var k in result){
					if (!validateKeyArray.includes(k)){
						chrome.storage.local.remove(k)
					}
				}
				
				/* $.each(result, function(k,v){
					if ($.inArray(k, validateKeyArray) == -1){
						chrome.storage.local.remove(k)
					}
				}); */
			});
		}
	});
}

function changeTabAction(){
	var currentDomain = getActiveWebsite();
	updateTotalTime()
	if(hasValueDeep(websitesToTrack, currentDomain)){
		runningCounter = setInterval(function(){ runCounter () }, 1000);
		timmerCounter = setInterval(function(){ timeSpendCounter () }, 1000);
	}else{
		clearInterval(runningCounter);
	}
}

function runCounter(){
	chrome.storage.local.get(null, function(result){
		if (result.hasOwnProperty(todayStorageName)){
			var currentDomain = getActiveWebsite();
			
			if(currentDomain && hasValueDeep(websitesToTrack, currentDomain)){
				if(result[todayStorageName]['trackData'].hasOwnProperty(currentDomain)){
					result[todayStorageName]['trackData'][currentDomain] += 1;
					totalTimeOnWebsites += 1;
				}else{
					result[todayStorageName]['trackData'][currentDomain] = 1;
					totalTimeOnWebsites += 1;
				}
				chrome.storage.local.set(result);
			}
		}
	});
}

function updateTotalTime(){
	var totalTimeSpend = 0;
	chrome.storage.local.get(null, function(result){
		for(var k in result){
			if(k != 'settings'){
				for(var j in result[k]['trackData']){
					totalTimeSpend += Number(result[k]['trackData'][j]);
				}
			}
		}
		totalTimeOnWebsites = totalTimeSpend;
	});
}

function timeSpendCounter(){
	chrome.storage.local.get(null, function(result){
		if(totalTimeOnWebsites == Number(result.settings.alertTime)){
			alert("Exxced the time.")
		}
	});
}

function hasValueDeep(json, findValue) {
    const values = Object.values(json);
    let hasValue = values.includes(findValue);
    values.forEach(function(value) {
        if (typeof value === "object") {
            hasValue = hasValue || hasValueDeep(value, findValue);
        }
    })
    return hasValue;
}

// Returns the current website being used
function getActiveWebsite() {
	if(activeTabUrl != null || activeTabUrl != '')
		return extractDomain(activeTabUrl);
	else
		return false;
}

// Returns whether the user is active right now or not
function isUserActiveNow() {
    return isUserActive;
}

// Finds the current tab in the current window
// Updates the activeTabUrl global variable
function updateActiveTabUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // The argument of the call back function is an array of tabs
        if (tabs.length < 1) { // If there are no tabs in the window, how the fuck is that possible ? let us see
            activeTabUrl = null;
        } else {
            activeTabUrl = tabs[0].url;
        }
    });
	
	return true;
}

/*
* Function  : extractDomain(url of the website)
* Usage : currentDomain = extractDomain("http://www.google.com/gmail/")
* ----------------------------------------------------------------------
* Extracts the domain name of the website and returns it as a string.
* E.g. extractDomain("http://www.google.com/gmail/") would return "google.com"
*/
function extractDomain(str) {
    if(str == '' || str == null)
		return false;
	
	// Removing the protocol and www prefixes
    var strList = str.split(":\/\/");
    if (strList.length > 1) {
        str = strList[1];
    } else {
        str = strList[0];
    }
    str = str.replace(/www\./g,'');
    
    // Extracting the domain name from full URL
    var domainName = str.split('\/')[0];
    return domainName;
}

/* 
* Function : getTimeOnTwitter()
* -------------------------------
* Returns the amount of time in seconds spent on 
* the website www.twitter.com and www.facebook.com
*/

function getTimeOnFbTwitter(){
    return totalTimeOnWebsites;
}

/*
* Function : numDaysSinceUTC()
* var numDaysSinceUTC = currentDate();
* ------------------------------------
* Returns the number of days that have passed since 
* January 1 1970, used in the process of checking 
* days that have passed
*/
function numDaysSinceUTC(todayDate = new Date()){
    var NUM_MILI_IN_A_DAY = 86400000;
    var utcMili = Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()); // miliseconds since UTC
    return (utcMili/ NUM_MILI_IN_A_DAY);
}

/*
* Function : dateStr()
* -----------------------
* This function return date string formate, date formate is given.
*/

function dateStr(date, formate, separator = '-'){
	var getDate = String(date.getDate()).padStart(2, '0');
	var getMonth = String((date.getMonth() + 1)).padStart(2, '0');
	var getYear = String(date.getFullYear());
	
	if(formate == 'dmy')
		return getDate + separator + getMonth + separator + getYear;
	else if(formate == 'mdy')
		return getMonth + separator + getDate + separator + getYear;
	else if(formate == 'ymd')
		return getYear + separator + getMonth + separator + getDate;
}

/*
* Function : todayStr()
* -----------------------
* This function return today date string formate, date formate is given.
*/

function todayStr(formate, separator = '-'){
	var getDate = String(today.getDate()).padStart(2, '0');
	var getMonth = String((today.getMonth() + 1)).padStart(2, '0');
	var getYear = String(today.getFullYear());
	
	if(formate == 'dmy')
		return getDate + separator + getMonth + separator + getYear;
	else if(formate == 'mdy')
		return getMonth + separator + getDate + separator + getYear;
	else if(formate == 'ymd')
		return getYear + separator + getMonth + separator + getDate;
}

/*
* Function : isNewDay()
* -----------------------
* Checks if a new day is dawned upon us, 
*/

function isNewDay(){
	var todayDate = numDaysSinceUTC();
	var todayVarDate = numDaysSinceUTC(today);
	
	return (todayDate - todayVarDate >= 1);
}

function todayTimeData(){
    return todayStorageName;
}


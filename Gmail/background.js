// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var count = 1;

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("The color is green.");
		//alert("The color is set.");
	});
	
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'mail.google.com'},
				//pageUrl: {schemes: ['https', 'http']},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

function checkForValidUrl(tabId, changeInfo, tab) {
	//alert(chrome.runtime.getURL('/'));
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // The argument of the call back function is an array of tabs
        if (tabs.length < 1) { // If there are no tabs in the window, how the fuck is that possible ? let us see
            //alert(2133);
        } else {
            //tabs[0].url;
			
			if(tabs[0].url){
				var loc = new URL(tabs[0].url);
				if(loc.host == 'mail.google.com'){
					/* alert(tabId.tabIds['0']);
					alert(chrome.runtime.getURL('/')); */
					
					chrome.pageAction.show(tabId.tabIds['0']);
				}
			}
        }
    });
};

// Listen for any changes to the URL of any tab.
//chrome.tabs.onUpdated.addListener(checkForValidUrl);
//For highlighted tab as well
chrome.tabs.onHighlighted.addListener(checkForValidUrl);

chrome.tabs.onActivated.addListener(function(activeInfo) {
  var activeWindowId = activeInfo.windowId;
  var activeTabId = activeInfo.tabId;
  
  //alert('window : '+activeWindowId+'tab id : '+ activeTabId)
});


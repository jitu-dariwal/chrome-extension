// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var count = 1;

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("The color is green.");
	});
	
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'mail.google.com'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

function checkForValidUrl(tabId, changeInfo, tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length < 1) {
        } else {			
			if(tabs[0].url){
				var loc = new URL(tabs[0].url);
				if(loc.host == 'mail.google.com'){
					chrome.notifications.create('', {
						title: 'Just wanted to notify you',
						message: 'You can use gmail searching filters extension!',
						iconUrl: 'assets/images/icons/48x48.png',
						type: 'basic'
					});
					
					chrome.pageAction.show(tabId.tabIds['0']);
				}
			}
        }
    });
};

// Listen for any changes to the URL of any tab.
//For highlighted tab as well
chrome.tabs.onHighlighted.addListener(checkForValidUrl);



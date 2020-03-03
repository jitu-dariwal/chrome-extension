chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("The color is green.");
	});
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostEquals: 'developer.chrome.com'},
				}),
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostEquals: 'local.notes.com'},
				}),
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostEquals: '192.168.5.109'},
				})
			],
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
				if(loc.host == 'developer.chrome.com' || loc.host == 'local.notes.com' || loc.host == '192.168.5.109'){
					//console.log(chrome);
					
					chrome.pageAction.setPopup({tabId: parseInt(tabId.tabIds['0']), popup: 'popup.html'});
					
					/* chrome.pageAction.getPopup(tabId.tabIds['0'], function(result){
						console.log(result)
					}); */
					
					chrome.notifications.create('', {
						title: 'Just wanted to notify you',
						message: 'You can use gmail searching filters extension!',
						iconUrl: 'images/get_started128.png',
						type: 'basic'
					});
					
					chrome.pageAction.show(tabId.tabIds['0']);
					
					var data = {};
					data.str = "Tab Change";
					
					chrome.tabs.executeScript(
						tabs[0].id,
						{code: 'setPopup('+JSON.stringify(data)+');setActions();'}
					);
				}
			}
        }
    });
};

// Listen for any changes to the URL of any tab.
//For highlighted tab as well
chrome.tabs.onHighlighted.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab) { alert('icon clicked')});

function alertString(string) { 
	alert(string);
}


chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.executeScript(null, {file: "js/content.js"});
});


chrome.runtime.onMessage.addListener(
	function(meta, sender, sendResponse)
{
	if (meta.func == 'get_url')
	{
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs)
		{
			sendResponse({data: tabs[0].url});

		});
	}
	return true;
});
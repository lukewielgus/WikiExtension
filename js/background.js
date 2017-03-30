chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.executeScript(null, {file: "js/content.js"});
    //chrome.tabs.executeScript(null, {file: "js/popup.js"});
});

var iFrame = document.createElement("iframe");
iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
document.body.insertBefore(iFrame, document.body.firstChild);
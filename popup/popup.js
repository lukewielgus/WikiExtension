

function get_url(callback)
{	
	chrome.runtime.sendMessage({func: "get_url"},function(response)
	{
		callback(String(response.data));
	});
}

function process_url(url)
{
	var tablink = url;

	var iFrame = document.createElement("iframe");
	iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
	iFrame.style = "border:3px solid grey;";

	if (tablink=="https://www.wikipedia.org/")
	{
		iFrame.width = (parseInt(document.body.clientWidth)-25).toString();
		iFrame.height = "250";
		iFrame.align = "center";


	}
	else
	{
		iFrame.width = "250";
		iFrame.height = "250";
		iFrame.align = "right";

	}

	document.body.insertBefore(iFrame, document.body.firstChild);
}

get_url(process_url);






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

	console.log(document)	

	// create iFrame element to insert later
	var iFrame = document.createElement("iframe");
	iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
	iFrame.style = "border:1px solid grey;";

	// if this is the home page, resize to a banner
	if (tablink=="https://www.wikipedia.org/" || tablink=="https://www.wikipedia.org")
	{
		iFrame.width = (parseInt(document.body.clientWidth)).toString();
		iFrame.height = "120";
		iFrame.align = "center";
		document.body.insertBefore(iFrame, document.body.firstChild);
		return;
	}

	// if this is the main page, skip
	if (tablink=="https://en.wikipedia.org/wiki/Main_Page")
	{
		return;
	}

	// if this is a talk page, skip
	if (tablink.indexOf("Talk:")!=-1)
	{
		return;
	}

	// if we get here, we know its an article page
	iFrame.width = "400";
	iFrame.height = "300";
	iFrame.align = "right";
	iFrame.hspace = "100";

	var content_handle = document.getElementById("content");
	
	console.log(content_handle);

	var insert_spot = content_handle.children[4];
	content_handle.insertBefore(iFrame,insert_spot);

}

get_url(process_url);






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

	//console.log(document)	

	var iFrame = document.createElement("iframe");
	iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
	iFrame.style = "border:1px solid grey;";

	if (tablink=="https://www.wikipedia.org/")
	{
		iFrame.width = (parseInt(document.body.clientWidth)-25).toString();
		iFrame.height = "250";
		iFrame.align = "center";
		document.body.insertBefore(iFrame, document.body.firstChild);
		return;
	}
	if (tablink=="https://en.wikipedia.org/wiki/Main_Page")
	{
		return;
	}

	iFrame.width = "500";
	iFrame.height = "300";
	iFrame.align = "right";
	iFrame.hspace = "100";

	var content_handle = document.getElementById("content");
	
	console.log(content_handle);

	var insert_spot = content_handle.children[4];
	content_handle.insertBefore(iFrame,insert_spot);


	//document.body.style.webkitTransform = "translateY(1000px)";
	//document.documentElement.appendChild(iFrame);
}

get_url(process_url);




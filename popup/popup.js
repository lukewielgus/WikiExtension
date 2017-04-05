
// low-level function to make a GET HTTPS request, returns response data
function get_http_xml(url)
{
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",url,false);
	xml_http.send(null);
	return xml_http.responseText;
}

// article name: (with underscores)
// increment: [daily,monthly]
// start: YYYYMMDD format
// end: YYYYMMDD format
function get_pageviews(article_name,increment,start,end)
{
	var url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/";
	url += "en.wikipedia.org/all-access/all-agents/"+article_name+"/";
	url += increment+"/"+start+"/"+end;
	var data = get_http_xml(url);
	return data;
}

// Gets the average daily views for a given article in a certain year
function get_daily_views(article_name,year)
{
	var start_date = String(year)+"0101";
	var end_date = String(year+1)+"1231";

	var data = get_pageviews(article_name,"monthly",start_date,end_date);

	var obj = JSON.parse(data);

	var total = 0;
	for (var i=0; i<obj.items.length; i++)
	{
		total += obj.items[i].views;
	}

	var daily = total/365;
	return daily;
}

// Provided a referenced to a callback function, finds the URL of the
// current tab and routes it to the callback function.
function get_url(callback)
{
	chrome.runtime.sendMessage({func: "get_url"},function(response)
	{
		callback(String(response.data));
	});
}

// Used as the callback function for get_url, figures out if we should
// display the iFrame structure on the current webpage.
function process_url(url)
{
	console.log(document) // write out for debugging (see chrome console)

	// create iFrame element to insert later
	var iFrame = document.createElement("iframe");
	iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
	iFrame.style = "border:1px solid #a6a6a6;";

	// if this is the home page, resize to a banner
	if (url=="https://www.wikipedia.org/" || url=="https://www.wikipedia.org")
	{
		iFrame.width = (parseInt(document.body.clientWidth)).toString();
		iFrame.height = "100";
		iFrame.align = "center";
		document.body.insertBefore(iFrame, document.body.firstChild);
		return;
	}

	// if this is the main page, skip
	if (url=="https://en.wikipedia.org/wiki/Main_Page")
	{
		return;
	}

	// if this is not an article page, skip
	if (url.split(".org")[1].indexOf(":")!=-1)
	{
		return;
	}

	// width is set to match the width of the existing box on the article page
	iFrame.width = "290";
	iFrame.height = "530";
	iFrame.align = "right";

	// 'content' is the id of the 'div' area used to hold the contents of the
	// wikipedia article, get a reference to it below
	var content_handle = document.getElementById("content");

	// 'body-content' is the element below 'content' that holds the actual article data
	var bodyContent = content_handle.children[4];

	// mw-content-text is all data below the title of the article
	var mw_content_text	= bodyContent.children[3];

	// write out mw-content-text for debugging
	console.log(mw_content_text);

	// initialize this value to -1 before loop, if we don't find a suitable
	// insert location among the children of mw-content-text we will know because
	// this value will still be -1
	var insert_spot = -1;

	// iterate over all children of mw-content-text portion of html
	for(var i=0; i<mw_content_text.children.length; i++)
	{
		// get the classname of the current child
		var current = mw_content_text.children[i].className;

		// check if the current item pertains to where we want to insert the iFrame above...
		if (current == "infobox vcard")
		{
			insert_spot = mw_content_text.children[i];
			break;
		}
		if (current == "infobox vevent")
		{
			insert_spot = mw_content_text.children[i];
			break;
		}

		if (current.indexOf("infobox")!=-1)
		{
			insert_spot = mw_content_text.children[i];
			break;
		}

		if (current.indexOf("vertical-navbox")!=-1)
		{
			insert_spot = mw_content_text.children[i];
			break;
		}

		if (current == "thumb tright")
		{
			insert_spot = mw_content_text.children[i];
			break;
		}

		if (current == "hatnote")
		{
			insert_spot = mw_content_text.children[i+1];
			break;
		}

		console.log(current.tag);
	}

	var insert_parent = document.getElementById("mw-content-text");

	if (insert_spot==-1)
	{
		var y = document.getElementsByTagName("p");
		console.log(y[0]);
		insert_spot = y[0];
		insert_parent.insertBefore(iFrame,insert_spot);
		return;
	}

	else
	{
		insert_parent = insert_spot.parentElement;
		insert_parent.insertBefore(iFrame,insert_spot);
		return;
	}
}

// Call get_url function with the process_url function being called
// after get_url has called callback. The value provided to callback
// by get_url will be routed as the input to process_url
get_url(process_url);

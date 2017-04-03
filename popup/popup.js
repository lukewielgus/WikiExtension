
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

function get_daily_views(article_name,year)
{
	var start_date = String(year)+"0101";
	var end_date = String(year+1)+"1231";

	var data = get_pageviews(article_name,"monthly",start_date,end_date);

	var obj = JSON.parse(data);
	//console.log(obj);
	
	var total = 0;
	for (var i=0; i<obj.items.length; i++)
	{
		total += obj.items[i].views;
	}

	var daily = total/365;
	return daily;
}


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

	// if this is not an article page, skip
	if (tablink.split(".org")[1].indexOf(":")!=-1)
	{
		return;
	}

	// if we get here, we know its an article page
	iFrame.width = "270";
	iFrame.height = "350";
	//iFrame.width = "1500";
	//iFrame.height = "1500";
	iFrame.align = "right";
	//iFrame.hspace = "100";

	/*
	var content_handle = document.getElementById("content");
	
	//console.log(content_handle);

	var insert_spot = content_handle.children[4];
	content_handle.insertBefore(iFrame,insert_spot);
	*/

	var content_handle = document.getElementById("content");

	var bodyContent = content_handle.children[4];
	var mw_content_text	= bodyContent.children[3];
	console.log(mw_content_text);

	var insert_spot = -1;

	for(var i=0; i<mw_content_text.children.length; i++)
	{
		var current = mw_content_text.children[i].className;
		console.log(current);
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

	//console.log(mw_content_text.children[0].className);
	//console.log(mw_content_text.children[1].className);
	//console.log(mw_content_text.children[2].className);


	//var insert_spot = mw_content_text.children[2];
	
	var insert_parent = document.getElementById("mw-content-text");

	if (insert_spot==-1)
	{
		var y = document.getElementsByTagName("p");
		console.log(y[0]);
		insert_spot = y[0];
		//insert_parent = y.parentElement;
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

get_url(process_url);




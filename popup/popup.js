
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
	iFrame.height = "400";
	//iFrame.width = "1500";
	//iFrame.height = "1500";
	iFrame.align = "right";
	iFrame.hspace = "100";

	var content_handle = document.getElementById("content");
	
	//console.log(content_handle);

	var insert_spot = content_handle.children[4];
	content_handle.insertBefore(iFrame,insert_spot);


}

get_url(process_url);




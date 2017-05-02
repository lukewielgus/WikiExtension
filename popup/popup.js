
// low-level function to make a GET HTTPS request, returns response data
function get_http_xml(url)
{
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",url,false);
	xml_http.send(null);
	return xml_http.responseText;
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

// places the blue logo on the top of the wikipedia globe
function set_top_logo()
{
	var div = document.createElement("DIV");
	div.id = "puzzle_piece_logo";
	var img = document.createElement("IMG");
	img.src = chrome.extension.getURL("/icons/wikilogo_new.png");

	var a = document.createElement("a");
	a.href = "http://www.wikiclassify.com";
	a.target = "_blank";
	a.appendChild(img);
	div.appendChild(a);
	document.body.appendChild(div);
}

// places the blue logo on the wikipedia globe on the home page
function set_middle_logo()
{
	var div = document.createElement("DIV");
	div.id = "puzzle_piece_logo_homepage";
	var img = document.createElement("IMG");
	img.src = chrome.extension.getURL("/icons/wikilogo_new.png");

	var a = document.createElement("a");
	a.href = "http://www.wikiclassify.com";
	a.target = "_blank";
	a.appendChild(img);
	div.appendChild(a);
	document.body.appendChild(div);
}

function set_list_elems()
{
	var panel = document.getElementById("mw-panel");
	var panel_logo = panel.children[0];
	var first_panel_elem = panel.children[1];

	console.log(first_panel_elem);

	var new_panel_elem = document.createElement("div");
	new_panel_elem.className = "portal";
	new_panel_elem.role = "navigation";
	new_panel_elem.id = "wikiclassify-panel";

	var panel_header = document.createElement("h3");
	panel_header.id = "wikiclassify-panel-header";
	panel_header.innerHTML =  "WikiClassify";
	new_panel_elem.appendChild(panel_header);

	var panel_body = document.createElement("div");
	panel_body.className = "body";
	new_panel_elem.appendChild(panel_body);

	var panel_list = document.createElement("ul");
	panel_list.id = "wikipanel-list";
	panel_body.appendChild(panel_list);

	var panel_list_entry = document.createElement("li");
	panel_list.appendChild(panel_list_entry);

	var panel_list_entry_link = document.createElement("a");
	panel_list_entry.appendChild(panel_list_entry_link);

	panel_list_entry_link.href = "http://www.wikiclassify.com";
	panel_list_entry_link.target = "_blank";
	panel_list_entry_link.innerText = "Visit WikiClassify";

	var panel_trending_entry = document.createElement("li");
	panel_list.appendChild(panel_trending_entry);

	var panel_trending_link = document.createElement("a");
	panel_trending_entry.appendChild(panel_trending_link);
	panel_trending_link.href = "http://www.wikiclassify.com/trending";
	panel_trending_link.target = "_blank";
	panel_trending_link.innerText = "Trending Articles";

	panel.insertBefore(new_panel_elem,first_panel_elem);

	console.log("here");
}

// gets the coordinates for the current article
function get_article_coords()
{
	return;
}

function add_sizing_elems()
{
	var panel_list = document.getElementById("wikipanel-list");

	var expand_elem_entry = document.createElement("li");
	panel_list.appendChild(expand_elem_entry);

	var collapse_elem_entry = document.createElement("li");
	panel_list.appendChild(collapse_elem_entry);

	var expand_link = document.createElement("a");
	var collapse_link = document.createElement("a");

	expand_link.innerText = "Expand Frame";
	collapse_link.innerText = "Collapse Frame";

	expand_link.onclick = function()
	{
		document.getElementById("wiki_frame").height=1000;
	}

	collapse_link.onclick = function()
	{
		document.getElementById("wiki_frame").height=300;
	}

	expand_elem_entry.appendChild(expand_link);
	collapse_elem_entry.appendChild(collapse_link);

}


// Used as the callback function for get_url, figures out if we should
// display the iFrame structure on the current webpage.
function process_url(url)
{
	//console.log(document) // write out for debugging (see chrome console)

	// if this is the home page
	if (url=="https://www.wikipedia.org/" || url=="https://www.wikipedia.org")
	{
		set_middle_logo();
		return;
	}

	// set the WikiClassify list elements in the left panel
	set_list_elems();

	var iframe_container = document.createElement("div");
	iframe_container.id = "wiki_frame_container";
	iframe_container.className = "resizeable";
	iframe_container.resize="both";
	iframe_container.overflow="auto";

	// create iFrame element to insert later
	var iFrame = document.createElement("iframe");
	iFrame.id="wiki_frame";
	//iFrame.setAttribute("id","wiki_frame");

	iframe_container.appendChild(iFrame);

	iFrame.src = chrome.extension.getURL("popup/popup_box.htm");
	iFrame.style = "border:1px solid #a6a6a6;";

	// place the top-of-globe logo
	set_top_logo();

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

	// get the coordinates of the current article (if they exist)
	//var coords = get_article_coords();

	// width is set to match the width of the existing box on the article page
	iFrame.width = "290";
	iFrame.height = "650";
	iFrame.align = "right";

	add_sizing_elems();

	while(true)
	{
		try
		{
			var mw_content_text = document.getElementById("mw-content-text");

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
				if (current == "toc")
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
			break;
		}
		catch(err)
		{
			break;
			continue;
		}
	}

	var insert_parent = document.getElementById("mw-content-text");

	if (insert_spot==-1)
	{
		var y = document.getElementsByTagName("p");
		console.log(y[0]);
		insert_spot = y[0];
		//insert_parent.insertBefore(iFrame,insert_spot);
		insert_parent.insertBefore(iframe_container,insert_spot);
		return;
	}

	else
	{
		insert_parent = insert_spot.parentElement;
		//insert_parent.insertBefore(iFrame,insert_spot);
		insert_parent.insertBefore(iframe_container,insert_spot);
		return;
	}
}

// Call get_url function with the process_url function being called
// after get_url has called callback. The value provided to callback
// by get_url will be routed as the input to process_url
get_url(process_url);
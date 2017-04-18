$(document).ready (jQueryMain);

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

// article name: (with underscores)
// increment: [daily,monthly]
// start: YYYYMMDD format
// end: YYYYMMDD format
function get_pageviews_agent(article_name,increment,start,end,agent)
{
	var url = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/";
	url += "en.wikipedia.org/all-access/"+agent+"/"+article_name+"/";
	url += increment+"/"+start+"/"+end;
	var data = get_http_xml(url);
	return data;
}

function get_daily_views(article_name,year)
{

	var num_days = 1;
	var interval = "monthly";

	if (String(year)=="last_30")
	{

		var d1 = new Date();
		var current_year = d1.getFullYear();
		var current_month = d1.getMonth()+1;
		if (current_month<10)
		{
			current_month = "0"+String(current_month);
		}

		var current_day = d1.getDate();
		if (current_day<10)
		{
			current_day = "0"+String(current_day);
		}

		var d0 = new Date();
		d0.setDate(d1.getDate()-30);
		var earlier_year = d0.getFullYear();
		var earlier_month = d0.getMonth()+1;
		if (earlier_month<10)
		{
			earlier_month = "0"+String(earlier_month);
		}
		var earlier_day = d0.getDate();
		if (earlier_day<10)
		{
			earlier_day = "0"+String(earlier_day);
		}

		var start_date = String(earlier_year)+String(earlier_month)+String(earlier_day);
		var end_date = String(current_year)+String(current_month)+String(current_day);

		interval = "daily";
		num_days = 30;
	}
	else
	{
		var start_date = String(year)+"0101";
		var end_date = String(year)+"1231";
		num_days = 365;
	}

	var data = get_pageviews(article_name,interval,start_date,end_date);
	var obj = JSON.parse(data);

	var total = 0;
	for (var i=0; i<obj.items.length; i++)
	{
		total += obj.items[i].views;
	}

	var daily = total/num_days;
	return daily;
}

function make_view_plot(article_name)
{
	var interval = "daily";
	var start_date = "20150101";

	var d1 = new Date();

	var current_year = d1.getFullYear();

	var current_month = d1.getMonth()+1;
	if (current_month<10){  current_month = "0"+String(current_month);  }

	var current_day = d1.getDate();
	if (current_day<10){  current_day = "0"+String(current_day);  }

	var end_date = String(current_year)+String(current_month)+String(current_day);

	var human_traffic 	  = get_pageviews_agent(article_name,interval,start_date,end_date,"user");
	var human_traffic_obj = JSON.parse(human_traffic);

	var human_traffic_data =
	{
		x: [],
		y: []
	};

	var n_days = 7;
	var cur_tot = 0;
	var cur_idx = 0;

	var total_views = 0;

	for (var i=0; i<human_traffic_obj.items.length; i++)
	{	
		if (i>=n_days)
		{
			var cur_sum = 0;
			for (var j=i-n_days; j<i; j++)
			{
				cur_sum += human_traffic_obj.items[j].views;
			}
			var moving_avg = cur_sum/n_days 
			var timestamp = String(human_traffic_obj.items[i].timestamp);
			timestamp 	  = timestamp.substr(0,4)+"-"+timestamp.substr(4,2)+"-"+timestamp.substr(6,2);

			human_traffic_data.y.push(moving_avg);
			human_traffic_data.x.push(timestamp);
		}
		total_views+=human_traffic_obj.items[i].views;
	}
	var average_views = total_views/human_traffic_obj.items.length;
	var len = human_traffic_obj.items.length;

	// trimming down to 365 days...
	human_traffic_data.y = human_traffic_data.y.slice(len-366,len-1);
	human_traffic_data.x = human_traffic_data.x.slice(len-366,len-1);

	var human_trace =
	{
		name: "Humans",
		x: human_traffic_data.x,
		y: human_traffic_data.y,
		type: 'scatter',
		line: {width: 1},
		fill: 'tozeroy'
		//type: 'tonexty'
	};

	var layout = {

		xaxis:
		{
			type: 'date',

			tickfont:
			{
				size: 10
			}

		},

		yaxis:
		{
			//range: [0,max_views],

			type: 'log',
			autorange: true,

			tickfont:
			{
				size: 10
			}
		},

		margin:
		{
			t: 10,
			r: 10,
			l: 25,
			b: 25
		},

		paper_bgcolor: "#f8f9fa",
		plot_bgcolor: "#f8f9fa",
	};

	$("body").append("<div id=\"plot\" style=\"width:263px;height:150px;\"></div>")

	var plot_spot = document.getElementById('plot');
	var data = [human_trace];

	Plotly.plot
	(
		plot_spot,
		data,
		layout,
		{displayModeBar: false}
	);
	return average_views;
}

// get data from our database for current article
function get_database_entry(article_name,callback)
{
	var url = "http://wikiclassify-env.juq3um3kg2.us-east-1.elasticbeanstalk.com/articles/"+article_name;
	chrome.runtime.sendMessage({func: "get_remote_data", url: url}, function(response)
	{
		callback(String(response.data));
	});
}

var new_tab_url = "";
function open_tab()
{

}

function add_remote_data(data)
{
	// parsing out the HTML element from returned string
	var parser = new DOMParser();
	var htmlDoc = parser.parseFromString(data,"text/html");
	var elems = htmlDoc.getElementsByTagName("strong");

	// getting data out of returned HTML element
	var categories = elems[1].nextSibling.data;
	var domains = elems[2].nextSibling.data;
	var authors = elems[3].nextSibling.data;
	var quality = elems[4].nextSibling.data;
	var importance = elems[5].nextSibling.data;

	// getting handles to prior defined insertion locations (defined in process_url)
	var quality_anchor = document.getElementById("quality_anchor");
	var importance_anchor = document.getElementById("importance_anchor");
	var domains_anchor = document.getElementById("domains_anchor");
	var authors_anchor = document.getElementById("authors_anchor");
	var category_anchor = document.getElementById("category_anchor");

	// directly inserting quality
	var quality_line = "<b>Quality</b> "+String(quality);
	$(quality_anchor).html("<p id=\"quality_anchor\">"+quality_line+"</p>");

	// directly inserting importance
	var importance_line = "<b>Importance</b> "+String(importance);
	$(importance_anchor).html("<p id=\"importance_anchor\">"+importance_line+"</p>");

	// Cleaning up authors by replacing "_" with " " and " | " with ","
	var authors_line = "<b>Cited Authors</b> ";
	var authors_clean = authors.split("_").join(" ");
	authors_clean = authors_clean.split(" | ").join(", ");
	authors_line += authors_clean;
	$(authors_anchor).html("<p id=\"authors_anchor\">"+authors_line+"</p>");

	// cleaning up domains
	var domains_line = "<b>Cited Domains</b> ";
	var domains_split = domains.split(" | ");

	// using a href item for domains to allow for clicking
	for (var i=0; i<domains_split.length; i++)
	{
		var cleaned_domain = domains_split[i].split(" ").join("");

		domains_line += "<a href=\"https://";
		domains_line += cleaned_domain+"\">"+domains_split[i];
		domains_line+="</a>";

		if (i!=domains_split.length-1)
		{
			domains_line += ", ";
		}
	}

	$(domains_anchor).html("<p id=\"domains_anchor\">"+domains_line+"</p>");

	// cleaning up categories the same
	var categories_line = "<b>Categories</b> ";
	var categories_clean = categories.split("Category:").join("");
	categories_clean = categories_clean.split("_").join(" ");
	categories_clean = categories_clean.split(" | ").join(", ");
	categories_line += categories_clean;
	$(category_anchor).html("<p id=\"category_anchor\">"+categories_line+"</p>");
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

function process_url(tablink)
{
	// if this will be a banner, don't add content
	if (tablink=="https://www.wikipedia.org" || tablink=="https://www.wikipedia.org/")
	{
		return;
	}

	//$("body").append("<hr>");
	$("body").append("<div class=\"bg-text_lite\">Information</div>");

	// get the article name
	var article = tablink.split("/wiki/")[1];
	var article_with_spaces = article.replace(/_/g," ");
	var article_line = "<b>Article</b>  "+article_with_spaces;

	// add the article title
	$("body").append("<p>"+article_line+"</p>");

	var quality_line = "<b>Quality</b> [article quality here]";
	$("body").append("<p id=\"quality_anchor\">"+quality_line+"</p>");

	var importance_line = "<b>Importance</b> [article importance here]";
	$("body").append("<p id=\"importance_anchor\">"+importance_line+"</p>");

	var categories_line = "<b>Categories</b> [categories here]";
	$("body").append("<p id=\"category_anchor\">"+categories_line);

	$("body").append("<hr>");

	var authors_line = "<b>Cited Authors</b> [authors here]";
	$("body").append("<p id=\"authors_anchor\">"+authors_line+"</p>");

	var domains_line = "<b>Cited Domains</b> [domains here]";
	$("body").append("<p id=\"domains_anchor\">"+domains_line);

	$("body").append("<div class=\"bg-text\">Popularity</div>");
	var avg_daily_views = make_view_plot(article);

	//$("body").append("<br>");
	//$("body").append("<div class=\"bg-text\">Average Views Per Day</div>");

	var avg_daily_views_pretty = String(avg_daily_views.toLocaleString('en-US',{minimumFractionDigits: 2})).split(".")[0];

	//var avg_daily_views_pretty = String(avg_daily_views).split(".")[0];
	var avg_daily_views_line = "<b>Views</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+avg_daily_views_pretty+" / day";

	$("body").append("<p>"+avg_daily_views_line+"</p>");

	// add data from our server
	get_database_entry(article,add_remote_data);
}

function jQueryMain () {
	get_url(process_url);
}

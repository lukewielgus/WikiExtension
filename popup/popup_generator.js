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

	var human_traffic 	= get_pageviews_agent(article_name,interval,start_date,end_date,"user");
	var all_traffic 	= get_pageviews(article_name,interval,start_date,end_date);
	
	var human_traffic_obj 	= JSON.parse(human_traffic);
	var all_traffic_obj 	= JSON.parse(all_traffic);
	
	var all_traffic_data = 
	{
		x: [],
		y: []
	};

	var human_traffic_data = 
	{
		x: [],
		y: []
	};

	var bot_traffic_data = 
	{
		x: [],
		y: []
	};

	var human_start_index = 0;
	var all_start_index = 0;
	var end_index = 0;

	if (human_traffic_obj.items.length<all_traffic_obj.items.length)
	{
		all_start_index = all_traffic_obj.items.length - human_traffic_obj.items.length;
		end_index = human_traffic_obj.items.length;
	}

	else
	{
		if (all_traffic_obj.items.length<human_traffic_obj.items.length)
		{
			human_start_index = human_traffic_obj.items.length - all_traffic_obj.items.length;
			end_index = all_traffic_obj.items.length;
		}
		else
		{
			end_index = all_traffic_obj.items.length;
		}
	}

	var max_views = -1;
	for (var i=0; i<end_index; i++)
	{
		var all_item = all_traffic_obj.items[i+all_start_index].views;
		var human_item = human_traffic_obj.items[i+human_start_index].views;

		all_traffic_data.y.push(all_item);
		human_traffic_data.y.push(human_item);
		bot_traffic_data.y.push(all_item-human_item);

		var timestamp = String(all_traffic_obj.items[i+all_start_index].timestamp);
		var fixed_timestamp = timestamp.substr(0,4)+"-"+timestamp.substr(4,2)+"-"+timestamp.substr(6,2);

		var human_timestamp = String(human_traffic_obj.items[i+human_start_index].timestamp);
		var all_timestamp = String(all_traffic_obj.items[i+all_start_index].timestamp);

		if (human_timestamp!=all_timestamp)
		{
			$("body").append("<p>ERROR</p>");
		}

		all_traffic_data.x.push(fixed_timestamp);
		human_traffic_data.x.push(fixed_timestamp);
		bot_traffic_data.x.push(fixed_timestamp);		

		if (all_item>max_views)
		{
			max_views = all_item+5;
		}
	}

	var all_trace = 
	{
		x: all_traffic_data.x,
		y: all_traffic_data.y,
		name: "All Traffic",
		type: 'scatter'
	};

	var human_trace = 
	{
		x: human_traffic_data.x,
		y: human_traffic_data.y,
		name: "Humans",
		type: 'scatter'
	};

	var bot_trace = 
	{
		x: bot_traffic_data.x,
		y: bot_traffic_data.y,
		name: "Bots",
		type: 'scatter'
	};

	var layout = {

		xaxis:
		{
			type: 'date',

			tickfont:
			{
				size: 8
			}

		},

		yaxis:
		{

			//range: [0,max_views],

			type: 'log',
			autorange: true,

			tickfont:
			{
				size: 8
			}
		},
		
		margin:
		{
			t: 0,
			r: 0,
			l: 25,
			b: 10
		},

		showlegend: true,

		legend: 
		{
			x: 50,
			y: 100,
			font:
			{
				size: 8
			},

			xanchor: "center",
			yanchor: "top"
			//orientation: "h"
		},

		paper_bgcolor: "#f8f9fa",
		plot_bgcolor: "#f8f9fa"

	};

	$("body").append("<div id=\"plot\" style=\"width:263px;height:150px;\"></div>")

	var plot_spot = document.getElementById('plot');
	var data = [human_trace,bot_trace];

	Plotly.plot
	(
		plot_spot,
		data,
		layout
	);
}

function jQueryMain () {

	chrome.tabs.getSelected(null,function(tab)
	{

		var tablink = tab.url;

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
		$("body").append("<p>"+quality_line+"</p>");

		$("body").append("<div class=\"bg-text\">Popularity</div>");

		make_view_plot(article);

		//$("body").append("<hr>");

		//daily views for 2015
		var daily_page_views_2015 = get_daily_views(article,2015);
		var page_views_2015_pretty = String(daily_page_views_2015).split(".")[0];
		var pageviews_2015_line = "<b>Views (2015)</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+page_views_2015_pretty+" / day";
		// add the daily views for 2015
		$("body").append("<p>"+pageviews_2015_line+"</p>");

		//daily views for 2016
		var daily_page_views_2016 = get_daily_views(article,2016);
		var page_views_2016_pretty = String(daily_page_views_2016).split(".")[0];
		var pageviews_2016_line = "<b>Views (2016)</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+page_views_2016_pretty+" / day";
		// add the daily views for 2016
		$("body").append("<p>"+pageviews_2016_line+"</p>");

		//daily views in last 30 days
		var last_30_daily_views = get_daily_views(article,"last_30");
		var page_views_30_pretty = String(last_30_daily_views).split(".")[0];
		var page_views_30_line = "<b>Views (Last 30)</b>&nbsp;&nbsp;"+page_views_30_pretty+" / day";
		// add the daily views for last 30 days
		$("body").append("<p>"+page_views_30_line+"</p>");

		// here is where we would make calls to server to get article details...
		// quality = server.get_quality(article)
	});
}

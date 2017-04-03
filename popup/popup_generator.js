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

	var start_date = "20160101";

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
	var end_date = String(current_year)+String(current_month)+String(current_day);

	var data = get_pageviews(article_name,interval,start_date,end_date);
	var obj = JSON.parse(data);
	
	var view_data = 
	{
		x: [],
		y: []
	};

	var max_views = -1;

	for (var i=0; i<obj.items.length; i++)
	{
		view_data.y.push(obj.items[i].views);
		view_data.x.push(i);

		if (obj.items[i].views>max_views)
		{
			max_views = obj.items[i].views+5;
		}
	}

	var layout = {
		
		xaxis: 
		{
			range: [0,view_data.x.length]
		},

		yaxis:
		{
			range: [0,max_views]
		},

		margin:
		{
			t: 15,
			r: 0,
			l: 35,
			b: 15
		}

	};

	$("body").append("<div id=\"plot\" style=\"width:240px;height:100px;\"></div>")
	var plot_spot = document.getElementById('plot');

	var view_trace = {
		x: view_data.x,
		y: view_data.y,
		type: 'scatter'
	};

	var data = [view_trace];

	Plotly.plot(
		plot_spot,
		data,
		layout
		);

	return view_data;
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

		$("body").append("<hr>");
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

		$("body").append("<hr>");

		var daily_page_views_2015 = get_daily_views(article,2015);
		var page_views_2015_pretty = String(daily_page_views_2015).split(".")[0];
		var pageviews_2015_line = "<b>Views (2015)</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+page_views_2015_pretty+" / day";
		$("body").append("<p>"+pageviews_2015_line+"</p>"); 

		var daily_page_views_2016 = get_daily_views(article,2016);
		var page_views_2016_pretty = String(daily_page_views_2016).split(".")[0];
		var pageviews_2016_line = "<b>Views (2016)</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+page_views_2016_pretty+" / day";
		$("body").append("<p>"+pageviews_2016_line+"</p>"); 

		var last_30_daily_views = get_daily_views(article,"last_30");
		var page_views_30_pretty = String(last_30_daily_views).split(".")[0];
		var page_views_30_line = "<b>Views (Last 30)</b>&nbsp;&nbsp;"+page_views_30_pretty+" / day";
		$("body").append("<p>"+page_views_30_line+"</p>");
		
		//make_view_plot(article);

		// here is where we would make calls to server to get article details...
		// quality = server.get_quality(article)
	});
}
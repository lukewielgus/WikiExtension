$(document).ready (jQueryMain);

function jQueryMain () {

	chrome.tabs.getSelected(null,function(tab)
	{
		var tablink = tab.url;

		// if this will be a banner, don't add content
		if (tablink=="https://www.wikipedia.org" || tablink=="https://www.wikipedia.org/")
		{
			return;
		}

		// get the article name
		var article = tablink.split("/wiki/")[1];
		var article_line = "Article: "+article;

		// add the article title
		$("body").append("<p>"+article_line+"</p>");

		// here is where we would make calls to server to get article details...
		// quality = server.get_quality(article)

	});
}
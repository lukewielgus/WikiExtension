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

		$("body").append("<hr>");
		$("body").append("<div class=\"bg-text\">Information</div>");

		// get the article name
		var article = tablink.split("/wiki/")[1];
		var article_with_spaces = article.replace("_"," ");

		var article_line = "<b>Article</b>  "+article_with_spaces;

		// add the article title
		$("body").append("<p>"+article_line+"</p>");

		var quality_line = "<b>Quality</b> the best article on Wikipedia";
		$("body").append("<p>"+quality_line+"</p>");


		// here is where we would make calls to server to get article details...
		// quality = server.get_quality(article)

	});
}
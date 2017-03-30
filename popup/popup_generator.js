$(document).ready (jQueryMain);

function jQueryMain () {

	chrome.tabs.getSelected(null,function(tab)
	{
		var tablink = tab.url;

		if (tablink=="https://www.wikipedia.org" || tablink=="https://www.wikipedia.org/")
		{
			return;
		}

		var article = tablink.split("/wiki/")[1];

		var article_line = "Article: "+article;

		$("body").append("<p>"+article_line+"</p>");
	});

    //$("body").append ('<p>Added by jQuery</p>');
}
$(document).ready (jQueryMain);

function jQueryMain () {

	chrome.tabs.getSelected(null,function(tab)
	{
		var tablink = tab.url;

		if (tablink=="https://www.wikipedia.org" || tablink=="https://www.wikipedia.org/")
		{
			return;
		}

		$("body").append("<p>"+tablink+"</p>");
	});

    //$("body").append ('<p>Added by jQuery</p>');
}
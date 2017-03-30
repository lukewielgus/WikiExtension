$(document).ready (jQueryMain);

function jQueryMain () {

	chrome.tabs.getSelected(null,function(tab)
	{
		var tablink = tab.url;
		$("body").append("<p>"+tablink+"</p>");
	});

    //$("body").append ('<p>Added by jQuery</p>');
}
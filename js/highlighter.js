
// load the mapping into memory
var fileURL = chrome.extension.getURL("js/10k_most_common-cat.txt"); 
var xmlreq = new XMLHttpRequest()
xmlreq.open("GET", fileURL, false) //false makes it syncronous
xmlreq.send()
var mapping = xmlreq.responseText.split("\n") //standard splitting by linebreaks

// all 8 colors used
var all_colors = [(51,102,170),(17,170,153),(102,170,85),(204,204,85),(153,34,136),(238,51,51),(238,119,34),(255,238,51)];

// all 8 categories used
var possible_cats = ["sports","religion","science","politics","geography","culture","biology","environment"]

console.log(mapping);

// return the corresponding rgb mapping for a certain category
function map_cat_to_color(cat)
{
	cl = "0,0,0";
	for (var i=0; i<possible_cats.length; i++)
	{
		if (cat==possible_cats[i])
		{
			cl = String(all_colors[i][0])+","+String(all_colors[i][1])+","+String(all_colors[i][2]);
			break;
		}
	}
	return cl;
}

// gets the associated alpha for the word 
function get_word_alpha(word)
{
	return "0.1";
}

// gets the associated color for the word
function get_word_color(word)
{
	//return "0,0,255";

	cat = "none";
	// search for word in mapping
	for (var i=0; i<mapping.length; i++)
	{
		console.log(mapping[i]);
		words = mapping[i].split("\t");
		//if (word.toLowerCase() == words[0])
		if (word==words[0])
		{
			cat = words[1];
			break;
		}
	}
	return map_cat_to_color(cat);
}

// assembles the tags around the provided word
function assemble_word_wrap(word,color,alpha)
{
	before = "<font style='color:black; background-color:rgba("+color+","+alpha+");'>";
	after = "</font>";
	return before+word+after;
}

// places tags to wrap the input word with correct color
function wrap_word(word)
{
	var correct_color = get_word_color(word);
	var correct_alpha = get_word_alpha(word);
	if (correct_color!="0,0,0"){  return assemble_word_wrap(word,correct_color,correct_alpha);  }
	else                       {  return assemble_word_wrap(word,correct_color,"1.0");  }
}

var text = document.body.innerHTML; // get all inner html on page
var words = text.split(" "); // split on " "
var new_text = ""; // to hold colorized text 
var openct = 0; // track if we are in an html tag

for (var i=0; i<words.length; i++)
{
	items = [];
	i1 = words[i].split("<");
	for (var a=0; a<i1.length; a++)
	{
		i2 = i1[a].split(">");
		for (var b=0; b<i2.length; b++)
		{
			items.push(i2[b]);
			if (b!=i2.length-1){  items.push(">");  }
		}
		if (a!=i1.length-1){  items.push("<");  }
	}

	for (var c=0; c<items.length; c++)
	{
		cur              = items[c];
		var prior_openct = openct;
		var skip         = false;
		openct += cur.split("<").length-1;
		openct -= cur.split(">").length-1;
		if (cur.indexOf(">")!=-1 || cur.indexOf("<")!=-1){  skip = true;                 }
		if (openct==0 && skip==false)                    {  new_text += wrap_word(cur);  }
		else                                             {  new_text += cur;             }
	}
	if (i!=words.length-1){  new_text+=" ";  }
}
document.body.innerHTML = new_text;
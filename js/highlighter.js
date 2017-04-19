
// load the mapping into memory
var fileURL = chrome.extension.getURL("js/10k_most_common-cat.txt");
var xmlreq = new XMLHttpRequest()
xmlreq.open("GET", fileURL, false) //false makes it syncronous
xmlreq.send()
var mapping = xmlreq.responseText.split("\n") //standard splitting by linebreaks

// all 8 colors used
var all_colors = [[51,102,170],[17,170,153],[102,170,85],[204,204,85],[153,34,136],[238,51,51],[238,119,34],[255,238,51]];

// all 8 categories used
var possible_cats = ["sports","religion","science","politics","geography","culture","biology","environment"]

//console.log("mapping...");
//console.log(mapping);

// return the corresponding rgb mapping for a certain category
function map_cat_to_color(cat)
{
	var cl = "0,0,0";
	for (var r=0; r<possible_cats.length; r++)
	{
		if (cat==possible_cats[r])
		{
			return String(all_colors[r][0])+","+String(all_colors[r][1])+","+String(all_colors[r][2]);
			//cl = String(all_colors[r][0])+","+String(all_colors[r][1])+","+String(all_colors[r][2]);
			//break;
		}
	}
	return cl;
}

// gets the associated alpha for the word
function get_word_alpha(word)
{
	return "0.4";
}

// gets the associated color for the word
function get_word_color(word)
{
	if (word==" " || word==" "){  return "0,0,0";  }
	var cat = "none";
	// search for word in mapping
	for (var k=0; k<mapping.length; k++)
	{
		var line_items = mapping[k].split("\t");
		if (line_items.length==0 || line_items.length==1){  continue;  }
		if (word.toLowerCase()==line_items[0])
		{
			//console.log(line_items);
			cat = line_items[1];
			//console.log("cat: "+cat);
			break;
		}
	}
	if (cat=="none"){  return "0,0,0";                }
	else            {  return map_cat_to_color(cat);  }
}

// assembles the tags around the provided word
function assemble_word_wrap(word,color,alpha)
{
	before = "<font style='color:black; background-color:rgba("+color+","+alpha+");'>";
	after = "</font>";
	return before+word+after;
}


var buffer = [];
// places tags to wrap the input word with correct color
function wrap_word(word)
{
	var correct_color = "none";
	var correct_alpha = "none";

	for(var p=0; p<buffer.length; p++)
	{
		if (buffer[p][0]==word.toLowerCase()){  return buffer[p][1];  }
	}

	correct_color = get_word_color(word);
	correct_alpha = get_word_alpha(word);
	var assembled = "none";
	
	if (correct_color!="0,0,0"){  assembled = assemble_word_wrap(word,correct_color,correct_alpha);  }
	else                       {  assembled = assemble_word_wrap(word,correct_color,"0.01");  }
	
	buffer.push([word.toLowerCase(),assembled]);
	console.log(buffer.length);
	return assembled;
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

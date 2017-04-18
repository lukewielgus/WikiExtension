
import random

cats = ["sports","religion","science","politics","geography","culture","biology","environment"]
f = open("10k_most_common.txt","r")
lines = f.read().split("\n")
new_lines = []
for l in lines:
	new_line = []
	new_line.append(l)
	c = random.choice(cats)
	new_line.append(c)
	new_lines.append(new_line)
f.close()

f2 = open("10k_most_common-cat.txt","w")
for l in new_lines:
	f2.write(l[0]+"\t"+l[1]+"\n")
f2.close()
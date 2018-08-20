import time, os, random
import datetime, socket
import time
import os
import json

""" Ravewall library for the Love Bus"""

configdir = os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
with open(configdir+'/config.json') as f:
    config = json.load(f)

sock_host, sock_port = config["host"], config["port"]

def get_sock(HOST,PORT):
	sock_handle = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	return sock_handle

def writestrip(sock_handle,canvas):
	data = ''
	for i in range(0,len(canvas),1):
		start = 0
		end = len(canvas[0])
		step = 1
		if (i % 2 == 1):
			start = len(canvas[0])-1
			end = -1
			step = -1

		for j in range(start,end,step):
			data = data + chr((canvas[i][j]>>16) & 0xFF)
			data = data + chr((canvas[i][j]>>8) & 0xFF)
			data = data + chr(canvas[i][j] & 0xFF)

	sock_handle.sendto(data,(sock_host,sock_port))

def writestripWithBrightness(sock_handle,canvas,brightness):
	data = ''
	for i in range(0,len(canvas),1):
		start = 0
		end = len(canvas[0])
		step = 1
		if (i % 2 == 1):
			start = len(canvas[0])-1
			end = -1
			step = -1

		for j in range(start,end,step):
			data = data + chr((canvas[i][j]>>16) & brightness)
			data = data + chr((canvas[i][j]>>8) & brightness)
			data = data + chr(canvas[i][j] & brightness)

	sock_handle.sendto(data,(sock_host,sock_port))

def push(sock_handle,data):
		sock_handle.sendto(data,(sock_host,sock_port))

def close(sock_handle):
	sock_handle.close()

def Color(r,g,b):
	return ((b & 0xFF) << 16) | ((r & 0xFF) << 8) | (g & 0xFF)

def getRGB(c):
	g = c & 0xFF
	r = (c >> 8) & 0xFF
	b = (c >> 16)& 0xFF
	return r,g,b

def setpixelcolor(canvas,x,y,r,g,b):
	canvas[x][y] = Color(r,g,b)

def setpixelcolor(canvas,x,y,c):
	canvas[x][y] = c

bright_colors = [Color(255,0,0),Color(0,255,0),Color(0,0,255),Color(255,255,255),Color(255,255,0),Color(255,0,255),Color(0,255,255)]


def randomColor():
	#lots of magic here - this produces bright colours that look "nice" to me on our display.
	c = [0,0,0]
	c[0] = random.randrange(150,255,3)
	c[1] = random.randrange(25,90,3)
	c[2] = random.randrange(0,50,3)
	random.shuffle(c)
	return Color(c[0],c[1],c[2])

def setFullColor(sock,canvas,c):
	for i in range(len(canvas)):
		for j in range(len(canvas[0])):
			setpixelcolor(canvas,i,j,c)
	writestrip(sock,canvas)

def colorFlashMode(sock,canvas,iterations,delay):
	for i in range(0,iterations):
		c = randomColor()
		for i in range(len(canvas)):
			for j in range(len(canvas[0])):
				setpixelcolor(canvas,i,j,c)
		writestrip(sock,canvas)
		time.sleep(delay)

def colorwipe_vertical(sock,canvas,c,delay,direction):
	for i in range(len(canvas))[::direction]:
		for j in range(len(canvas[0]))[::direction]:
			setpixelcolor(canvas,i,j,c)
			writestrip(sock,canvas)
			time.sleep(delay)

def colorwipe_horiz(sock,canvas,c,delay,direction):
	for i in range(0,len(canvas[0]))[::direction]:
		for j in range(0,len(canvas))[::direction]:
			setpixelcolor(canvas,j,i,c)
			writestrip(sock,canvas)
			time.sleep(delay)

def colorwipe_snake(sock,canvas,c,delay):
	for i in range(0,len(canvas),1):
		start = 0
		end = len(canvas[0])
		step = 1
		if (i % 2 == 1):
			start = len(canvas[0])-1
			end = -1
			step = -1
		for j in range(start,end,step):
			setpixelcolor(canvas,i,j,c)
			writestrip(sock,canvas)
			time.sleep(delay)

def Wheel(WheelPos):
	if (WheelPos < 85):
		return Color(WheelPos * 3, 255 - WheelPos * 3, 0)
	elif (WheelPos < 170):
		WheelPos -= 85;
		return Color(255 - WheelPos * 3, 0, WheelPos * 3)
	else:
		WheelPos -= 170;
		return Color(0, WheelPos * 3, 255 - WheelPos * 3)

def rainbowBoard(sock,canvas,wait):
	for j in range(256): # one cycle of all 256 colors in the wheel
		for i in range(len(canvas)):
			for k in range(len(canvas[0])):
# tricky math! we use each pixel as a fraction of the full 96-color wheel
# (thats the i / strip.numPixels() part)
# Then add in j which makes the colors go around per pixel
# the % 96 is to make the wheel cycle around
				setpixelcolor(canvas,i,k,Wheel( ((i * 256 / (len(canvas)*len(canvas[0]))) + j) % 256) )
		writestrip(sock,canvas)
		time.sleep(wait)

def rainbowCycle(sock,canvas,wait):
	for j in range(256): # one cycle of all 256 colors in the wheel                                   
		for i in range(len(canvas)):
			for k in range(len(canvas[0])):
# tricky math! we use each pixel as a fraction of the full 96-color wheel                                 
# (thats the i / strip.numPixels() part)                                                                  
# Then add in j which makes the colors go around per pixel                                                
# the % 96 is to make the wheel cycle around                                                              
				setpixelcolor(canvas,i,k,Wheel( (((i*len(canvas)+k) * 256 / ((len(canvas)*len(canvas[0]))) + j)) % 256) )
		writestrip(sock,canvas)
		time.sleep(wait)

def fadeInColor(sock,canvas,c,delay):
	for brightness in range(8):
		for i in range(len(canvas)):
			for j in range(len(canvas[0])):
				setpixelcolor(canvas,i,j,c)
		writestripWithBrightness(sock,canvas,(brightness*32))

def fadeOutColor(sock,canvas,c,delay):
	for brightness in range(8):
		for i in range(len(canvas)):
			for j in range(len(canvas[0])):
				setpixelcolor(canvas,i,j,c)
		writestripWithBrightness(sock,canvas,(255-(brightness*32)))
		###time.sleep(delay/255)

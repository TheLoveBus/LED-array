import socket
import sys
import time
import random
import base64
import json
import os
from lovebus import *

""" Twinkle star pattern """

configdir = os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
with open(configdir+'/config.json') as f:
    config = json.load(f)

HOST, PORT = config["host"], config["port"]
FIXTURES = config["width"]*config["height"]
CHANNELS = (FIXTURES*3)

canvas = []

for c in range(0,CHANNELS):
	canvas.append( 0 )

sock = get_sock(HOST,PORT)

running = True

while running:
	for c in range(0,CHANNELS):
		if canvas[c] > 0:
			canvas[c] = canvas[c] - 1

	if random.randint(0,255)%5 == 0:
		random_pixel = random.randint( 1, (FIXTURES-1) )

		r_pixel = (random_pixel*3)
		g_pixel = r_pixel + 1
		b_pixel = g_pixel + 1
		canvas[r_pixel] = random.randint(0,255)
		canvas[g_pixel] = random.randint(0,255)
		canvas[b_pixel] = random.randint(0,255)

	data = ''
	for c in range(0,CHANNELS):
		data = data + chr(canvas[c])

	try:
		push(sock,data)
	except socket.error as msg:
		print msg
		break
	time.sleep(0.125)

sock.close()

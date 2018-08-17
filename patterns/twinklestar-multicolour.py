import socket
import sys
import time
import random
import base64
import json
import pprint

""" Twinkle star pattern """

with open('../config.json') as f:
    config = json.load(f)

HOST, PORT = config["host"], config["port"]
FIXTURES = config["width"]*config["height"]
CHANNELS = (FIXTURES*3)

canvas = []

for c in range(0,CHANNELS):
	canvas.append( 0 )

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

running = True

while running:
	for c in range(0,CHANNELS):
		if canvas[c] > 0:
			canvas[c] = canvas[c] - 1

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
		sock.sendto(data, (HOST,PORT))
	except socket.error as msg:
		print msg
		break
	###time.sleep(0.0225)
	time.sleep(0.125)

	## Check if we're still running
	###fp = open( 'running', 'r' )
	###inp = fp.read().strip()
	###if inp == "STOP":
		###running = False
	###fp.close()

sock.close()

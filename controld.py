import json, requests, time, hmac, hashlib, math, socket, platform
import socket
import sys
import time
import random
import base64
from buslights import *

DEBUG = True

configdir = os.path.join(os.path.dirname(os.path.abspath(__file__)))
with open(configdir+'/config.json') as f:
    config = json.load(f)

NODE_PATH = config["executables"]["node"]
PYTHON_PATH = config["executables"]["python"]

MASTER_URL = config["master_url"]

def Debug( message ):
	if Debug: print message

controller = BusController(MASTER_URL)
controller.run()

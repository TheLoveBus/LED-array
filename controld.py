import json, requests, time, hmac, hashlib, math, socket, platform
import socket
import sys
import time
import random
import base64
from buslights import *

DEBUG = True

MASTER_URL = 'http://localhost:3010/script/'

if platform.system() == "Windows":
	PYTHON_PATH = "D:\Python27\Python.exe"
else:
	PYTHON_PATH = "/usr/bin/python"

def Debug( message ):
	if Debug: print message

controller = BusController(MASTER_URL)
controller.run()

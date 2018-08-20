import json, requests, time, hmac, hashlib, math, socket, os, datetime
from subprocess import Popen, PIPE
import subprocess
import socket
import sys
import time
import random
import base64
import platform
import signal

configdir = os.path.join(os.path.dirname(os.path.abspath(__file__)))
with open(configdir+'/config.json') as f:
    config = json.load(f)

NODE_PATH = config["executables"]["node"]
PYTHON_PATH = config["executables"]["python"]

class BusController:
	"""BusLights Controller class"""

	def __init__(self, master_url):
		""" Initialize """
		import socket
		self._master_url = master_url
		self._httpClient = requests.Session()
		self._running = True
		self._subprocess = None
		self._script_name = None

	def api_call(self, remote_method, data = {}):
		request_url = self._master_url + remote_method

		s = self._httpClient

		if len(data) > 0:
			try:
				r = s.post(request_url, json=data)
			except requests.exceptions.ConnectionError as e:
				r = s.post(request_url, json=data)
				pass
		else:
			try:
				r = s.get(request_url)
			except requests.exceptions.ConnectionError as e:
				r = s.get(request_url)
				pass

		Debug('api_call:'+str(r.text))
		Debug('returning')

		return r.json()

	def GetRunningScript(self):
		request_result = self.api_call('running')
		
		self._fallback_script_name = request_result['script_name']
		
		return request_result['script_name']
		
	def stopScript(self):
		if not self._subprocess:
			return
		
		Debug("Signalling STOP")
		###self._subprocess.send_signal(signal.SIGTERM)
		os.kill(self._subprocess.pid,signal.SIGKILL)

		Debug("Waiting for subprocess to stop...")
		self._subprocess.wait()
		Debug("Killed!")
		
		# Send black screen update
		self.sendBlackScreen()
		
		# Reset subprocess handle
		self._subprocess = None
		
	def sendBlackScreen(self):
		self.runScript( 'blackscreen.py' )

	def updateServerPatterns(self):
		script_files = [f for f in os.listdir("scripts") if os.path.isfile(os.path.join("scripts", f)) and f[-3:] != "pyc" and f != "lovebus.py"]
		self.api_call('update',script_files)
		
	def run(self):
		Debug("Updating script files to server")
		self.updateServerPatterns()

		while True:
			Debug("Loop...")
			

			script_name = self.GetRunningScript()
			
			Debug( "Controller State: " + str( script_name ) )

			if self._script_name != None and script_name != self._script_name:
				Debug( "Changing states from " + self._script_name + " to " + script_name )
				self.stopScript()
				
			self._script_name = script_name
			
			sleep = 1

			Debug("Subprocess: " + str(self._subprocess))
			
			if script_name == '':
				Debug("Player is set down, sleeping for 60 seconds")
				sleep = 60
				
			elif self._script_name != script_name:
				# Send stop
				self.stopScript()

				Debug("Spawning script player")
	
				self.runScript( script_name )
				sleep = 5

				Debug( self._subprocess.poll() )
				Debug( self._subprocess.stdout )

				(sod,sed) = self._subprocess.communicate()

				print sod
						
			elif self._subprocess != None and self._subprocess.poll() == None:
				Debug("Animation player already running")
				sleep = 5

			else:
				Debug("Animation player not running")
				Debug("Spawning script player")
	
				self.runScript( script_name )
				sleep = 5
					
			
			Debug( "Sleeping[" + str(sleep) + "]..." )
			for per in range(0, sleep):
				time.sleep(1)

	def runScript(self,script_name):
		self._script_name = script_name					
		script_file = "scripts/" + script_name
		Debug("Spawning scripted animation: " + script_file)
		self._subprocess = None
		if script_file[-3:] == ".js":
			self._subprocess = subprocess.Popen([ NODE_PATH, script_file ], stdout=PIPE, stdin=PIPE, stderr=PIPE)
		elif script_file[-3:] == ".py":
			self._subprocess = subprocess.Popen([ PYTHON_PATH, script_file ], stdout=PIPE, stdin=PIPE, stderr=PIPE)

def Debug(message):
	if Debug: print datetime.datetime.now(), message

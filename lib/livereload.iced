fs = require 'fs'
server = null
port = 3001 
module.exports = (files)->
	
	'<script>(' + ((files,port)->

		a = for file,i of files
			file
		res = changed:false
		window.watch = (res)->
			unless res.changed
				script = document.createElement 'script'
				src = "http://#{location.hostname}:#{port}/?files=#{a.join ','}&#{Date.now()}&callback=watch"
				src += "&_id=#{res._id}" if res._id
				script.src = src
				script.addEventListener 'error',->
					setTimeout ping, 2000
				, true

				document.getElementsByTagName('head')[0].appendChild script
				
			else
				location.reload()
			res
		window.ping = ->
			script = document.createElement 'script'
			script.src = "http://#{location.hostname}:#{port}/ping?callback=reload"
			script.addEventListener 'error',->
				setTimeout ping, 2000
			, true
			document.getElementsByTagName('head')[0].appendChild script
			
		window.reload = location.reload.bind location	
		setTimeout ->
			watch res
		,1000

	)+ ').call(this,' + JSON.stringify(files) + ','+port+');</script>';

return if process.env is 'production'
server = require('express')()
_id = 0
watchers = {}
clients = {}
server.listen port
server.get '/',(req,res)->
	files = req.query.files.split ','
	res._id = +(req.query._id or ++_id)
	clients[res._id] = 
		res:res
		files:files
	for file in files
		unless watchers[file]
			watchers[file] ?= {}
			fs.watchFile file, ->
				for id,a of watchers[file]
					res = clients[id].res
					if res._id
						res.jsonp changed:file
					for file in clients[id].files
						delete watchers[file][res._id]
					delete clients[id]
					res._id = 0
		watchers[file][res._id] = res._id
	setTimeout ->
		if res._id
			res.jsonp
				changed:false
				_id:_id
	, 5000
server.get '/ping', (req,res)->
	console.log 'ping'
	res.jsonp({})
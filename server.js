
//var http = require("http");
var express = require("express");
var app = express();
//var server = require("http").createServer(app);
var server = require("http").Server(app);
var socket = require("socket.io");
var io = socket.listen(server);
var fs = require("fs");
var path = require('path');  //add static path if css and html in different files

var redis = require("redis");
var redisClient = redis.createClient();

app.use(express.static(path.join(__dirname)));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

server.listen(8190,function(){
	console.log("listen on 8190");
});
//var messages = [];
var storeMessages = function(name, data, date){
	//messages.push({name: name, data: data});
	var message = JSON.stringify({name: name, data: data, date: date});
	redisClient.lpush("messages", message, function(err, response){
		redisClient.ltrim("messages", 0, 9);
	});
}

io.sockets.on('connection', function(client){
	client.on("join", function(name){
		client.nickname = name;
		redisClient.lrange("messages", 0, -1, function(err, messages){
			messages = messages.reverse();
		
			messages.forEach(function(message){
				message = JSON.parse(message);
			client.emit("messages", message.name + ":" +message.data);
			});
		});
	});
	client.on("messages", function(message){
		console.log(message);
	//	client.get("nickname", function(error, name){
		name = client.nickname;
			client.broadcast.emit("messages", name + ":" + message);
			client.emit("messages", name + ":  " + message);
			storeMessages(name, message);
		});
		console.log("after");
	//});
	
	
});

//io.sockets.on('connection', function)



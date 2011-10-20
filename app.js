
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.register('.html', require('ejs'));
  app.set('view engine', 'html');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Kanvas'
  });
});

// websocket
var datas = [];

io.sockets.on('connection', function(socket) {
    if (datas.length > 0) {
        for (var i in datas) {
            socket.emit('message', datas[i]);
        }
    }
    socket.on('message', function(data) {
        datas.push(data);
        socket.broadcast.emit('message', data);
    });
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

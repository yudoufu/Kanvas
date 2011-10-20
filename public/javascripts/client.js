window.addEventListener('load', function() {

    var startColor = '#9ea1a3';

    // canvas init
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth -30;
    canvas.height = window.innerHeight -30;

    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;

    var CanvasHandler = function() {
    };
    CanvasHandler.prototype = {
        ctx: null,
        color: null,
        semaphore: false,
        handler: function(data) {
            this[data.type](data);
        },
        mousedown: function(data) {
            this.semaphore = true;
            this.ctx.strokeStyle = this.color;
            this.ctx.beginPath();
            this.ctx.moveTo(data.x, data.y);
            this.callback(data);
        },
        mousemove: function(data) {
            if (!this.semaphore) return;
            this.ctx.lineTo(data.x, data.y);
            this.ctx.stroke();
            this.callback(data);
        },
        mouseup: function(data) {
            if (!this.semaphore) return;
            this.ctx.lineTo(data.x, data.y);
            this.ctx.stroke();
            this.ctx.closePath();
            this.semaphore = false;
            this.callback(data);
        },
        callback: function(data) {
        },
    };

    // web socket
    var socket = io.connect();
    socket.on('connect', function(data) {
        console.log("connect session: ", socket.socket.sessionid);
    });

    var RemoteDrower = new CanvasHandler();
    RemoteDrower.ctx = ctx;

    socket.on('message', function(data) {
        RemoteDrower.color = data.color;
        RemoteDrower.handler(data);
    });


    var LocalDrower = new CanvasHandler();
    LocalDrower.ctx = ctx;
    LocalDrower.color = startColor;
    LocalDrower.callback = function(data) {
        socket.emit('message', {
            type: data.type,
            x: data.x,
            y: data.y,
            color: this.color,
        });
    };

    window.addEventListener('mousedown', function (e) {
        LocalDrower.handler(e);
    }, false);
    window.addEventListener('mousemove', function (e) {
        LocalDrower.handler(e);
    }, false);
    window.addEventListener('mouseup', function (e) {
        LocalDrower.handler(e);
    }, false);

    var colors = document.getElementById('curves').childNodes;
    for (var i = 0, color; color = colors[i]; i++) {
        if (color.nodeName.toLowerCase() != 'div') continue;
        color.addEventListener('click', function (e) {
            var style = e.target.getAttribute('style');
            var color = style.match(/background:(#......)/)[1];
            LocalDrower.color = color;
        }, false);
    }

}, false);

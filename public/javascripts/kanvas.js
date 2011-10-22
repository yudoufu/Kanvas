(function(){
    var Kanvas = function() {
        this.init();
        this.setCanvas();
        this.setSocket();
    };

    Kanvas.prototype = new Object();

    Kanvas.prototype.init = function() {
        this.before = {
            x: 0,
            y: 0,
        };
        this.after = {
            x: 0,
            y: 0,
        };

        this.isDraw = false;
        this.color = '#9EA1A3';
        this.width = 5;
    };

    Kanvas.prototype.setCanvas = function() {
        this.canvas = document.getElementById('canvas');
        this.canvas.width  = window.innerWidth  - 30;
        this.canvas.height = window.innerHeight - 30;

        this.context = this.canvas.getContext('2d');

        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.width;
    };

    Kanvas.prototype.setSocket = function() {
        var self = this;
        this.socket = io.connect();
        this.socket.on('connect', function(data) {
            console.log('start session: ' + self.socket.socket.sessionid);
        });

        this.socket.on('message', function(data) {
            self.context.strokeStyle = data.color;
            self[data.type](data);
        });
    };

    // temporary implementation. #FIXME
    Kanvas.prototype.setEvents = function() {
        console.log('add event');
        var self = this;

        window.addEventListener('mousedown', function(event) {
            self.context.strokeStyle = self.color;
            self.start(event);
            self.send('start');
        }, false);
        window.addEventListener('mouseup', function(event) {
            self.end(event);
            self.send('end');
        }, false);
        window.addEventListener('mousemove', function(event) {
            self.move(event);
            self.send('move');
        }, false);
    };

    ////////
    // canvas draw methods
    ////////

    Kanvas.prototype.clear = function(data) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (data.id != this.socket.socket.sessionid) {
            this.send('clear');
        }
    };

    Kanvas.prototype.start = function(event) {
        this.isDraw = true;
        this.before.x = event.x;
        this.before.y = event.y;
        this.after = this.before;

        this.beginPath();
    };
    Kanvas.prototype.end = function(event) {
        if (!this.isDraw) return;
        this.isDraw = false;
        this.after.x = event.x;
        this.after.y = event.y;
        this.endPath();
    };
    Kanvas.prototype.move = function(event) {
        if (!this.isDraw) return;
        this.after.x = event.x;
        this.after.y = event.y;
        this.movePath();
    };

    Kanvas.prototype.beginPath = function() {
        this.context.beginPath();
        this.context.moveTo(this.before.x, this.before.y);
    };
    Kanvas.prototype.endPath = function() {
        this.context.lineTo(this.after.x, this.after.y);
        this.context.stroke();
        this.context.closePath();
    };
    Kanvas.prototype.movePath = function() {
        this.context.lineTo(this.after.x, this.after.y);
        this.context.stroke();
        console.log(this.context.strokeStyle, this.after.x, this.after.y);
    };

    Kanvas.prototype.send = function(target) {
        this.socket.emit('message', {
            id: this.socket.socket.sessionid,
            type: target,
            x: this.after.x,
            y: this.after.y,
            color: this.color,
        });
    };

    Kanvas.prototype.setPallet = function() {
        self = this;
        var colors = document.getElementById('curves').childNodes;
        for (var i = 0, color; color = colors[i]; i++) {
            if (color.nodeName.toLowerCase() != 'div') continue;
            color.addEventListener('click', function(event) {
                var style = event.target.getAttribute('style');
                self.color = style.match(/background:(#......)/)[1];
            }, false);
        }
    };

    window.Kanvas = Kanvas;

})();

window.addEventListener('load', function() {
    var kanvas = new Kanvas();
    kanvas.setPallet();
    kanvas.setEvents();
}, false);

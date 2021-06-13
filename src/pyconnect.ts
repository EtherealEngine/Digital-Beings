const spawn = require('child_process').spawn;
const path = require('path');
const zerorpc = require('zerorpc');


const TIMEOUT = 60; 
const IP = '127.0.0.1';
const PORT = '42422';

class PyConnect {
    static connected: any;
    static zerorpcProcess: any;
    static zerorpc: any;
    static server() {
        if (!PyConnect.connected) {
            console.log('PythonConnector – making a new connection to the python layer');
            PyConnect.zerorpcProcess = spawn('python3', ['-u', path.join(__dirname, 'PythonServer.py')]);
            PyConnect.zerorpcProcess.stdout.on('data', function(data) {
                console.info('python:', data.toString());
            });
            PyConnect.zerorpcProcess.stderr.on('data', function(data) {
                console.error('python:', data.toString());
            });
            PyConnect.zerorpc = new zerorpc.Client({'timeout': TIMEOUT, 'heartbeatInterval': TIMEOUT*1000});
            PyConnect.zerorpc.connect('tcp://' + IP + ':' + PORT);
            PyConnect.connected = true;
        }
        return PyConnect.zerorpc;
    }

    static async invoke(method, ...args) {
        try {
            
            var zerorpc = PyConnect.server();
            return await promisify(zerorpc.invoke, zerorpc, method, ...args);
        }
        catch (e) {
            return Promise.reject(e)
        }
    }
}

var promisify = (fn, ctx, ...args) => {
    if (!ctx) {
        ctx = fn;
    }

    return new Promise((resolve, reject) => {
        args.push((err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });

        fn.apply(ctx, args)
    });
};

module.exports = PyConnect;

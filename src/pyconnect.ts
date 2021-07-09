const spawn = require('child_process').spawn;
const path = require('path');
const grpc = require('grpc');

const proto = grpc.load(`${__dirname}/../example.proto`)
const PORT = 50051
const IP = 'localhost'

class PyConnect {
    static connected: any;
    static grpcProcess: any;
    static grpc: any;
    static server() {
        if (!PyConnect.connected) {
            console.log('PythonConnector – making a new connection to the python layer');
            PyConnect.grpcProcess = spawn('python3', ['-u', path.join(__dirname, '../grpc_server.py')]);
            PyConnect.grpcProcess.stdout.on('data', function(data) {
                console.info('python:', data.toString());
            });
            PyConnect.grpcProcess.stderr.on('data', function(data) {
                console.error('python:', data.toString());
            });
            PyConnect.grpc = new proto.Agent(IP + ':' + PORT, grpc.credentials.createInsecure());
            PyConnect.connected = true;
        }
        return PyConnect.grpc;
    }

    static async invoke(method, ...args) {
        try {
            
            var grpc = PyConnect.server();
            return await promisify(grpc.HandleMessage, grpc, method, ...args);
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

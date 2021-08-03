const spawn = require('child_process').spawn;
const path = require('path');
const grpc = require('grpc');

const proto = grpc.load(`${__dirname}/../server/grpc/example.proto`)
const PORT = 50051
const IP = 'localhost'

class PyConnect {
    static connected: any;
    static grpcProcess: any;
    static grpc: any;
    static server() {
        return new Promise((resolve, reject) => {
            if (!PyConnect.connected) {
                console.log('PythonConnector – making a new connection to the python layer');
                PyConnect.grpcProcess = spawn('python3', ['-u', path.join(__dirname, '../server/grpc/grpc_server.py')]);
                PyConnect.grpcProcess.stdout.on('data', function(data) {
                    console.info('python:', data.toString());
                    PyConnect.grpc = new proto.Agent(IP + ':' + PORT, grpc.credentials.createInsecure());
                    PyConnect.connected = true;
                    resolve(PyConnect.grpc);
                });
                PyConnect.grpcProcess.stderr.on('data', function(data) {
                    console.error('python:', data.toString());
                });
            }
            else{
                resolve(PyConnect.grpc);
            }
        });
    }

    static async invoke(method, ...args) {
        try {
            return await PyConnect.server().then(async (grpc) => {
                return await promisify(grpc, method, ...args);
            });
        }
        catch (e) {
            return Promise.reject(e)
        }
    }
}

var promisify = (ctx, ...args) => {
    const fn = ctx.HandleMessage;
    return new Promise((resolve, reject) => {
        args.push((err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
        fn.apply(ctx, [args[0], args[1]])
    });
};

module.exports = PyConnect;

const spawn = require('child_process').spawn;
const path = require('path');

const PORT = process.env.GRPC_SERVER_PORT
const IP = 'localhost'

class PyConnect {
    static connected: any;
    static grpcProcess: any;
    static grpc: any;
    static server() {
        return new Promise((resolve, reject) => {
            if (!PyConnect.connected) {
                console.log('PythonConnector – making a new connection to the python layer');
                PyConnect.grpcProcess = spawn(process.platform == 'win32' ? 'py' : 'python3', ['-u', path.join(__dirname, '../server/grpc/pyserver.py')]);
                PyConnect.grpcProcess.stdout.on('data', function(data) {
                    console.info('python:', data.toString());
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

    static async invoke(method) {
        try {
            return await PyConnect.server().then(async () => {
             method()
            });
        }
        catch (e) {
            return Promise.reject(e)
        }
    }
}


module.exports = PyConnect;

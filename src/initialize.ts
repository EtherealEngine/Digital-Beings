require('dotenv-flow').config();
const protoLoader = require("@grpc/proto-loader");
const grpc = require('grpc');

const GRPC_PORT = 50051 || process.env.GRPC_PORT;

const expectedServerDelta = 1000 / 60;
let lastTime = 0;
// @ts-ignore
globalThis.requestAnimationFrame = (f) => {
    const serverLoop = () => {
        const now = Date.now();
        if (now - lastTime >= expectedServerDelta) {
            lastTime = now;
            f(now);
        } else {
            setImmediate(serverLoop);
        }
    }
    serverLoop()
}

const protoPaths = [
    "bot.proto"
]
//Load the protobuf
var proto = grpc.loadPackageDefinition(
    protoLoader.loadSync(protoPaths, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_SERVER = "0.0.0.0" + GRPC_PORT;

//Create gRPC client
let client = new proto.MessageService(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

const messageResponseHandler = async (username, message, callback) => {
    // HOOK IN BOT AND REPLACE RESPONSE HERE
    client.call({ sender: username, data: message }, (error, response) => {
        if (error) {
            console.error("This is error", error)
        }
        console.log("response===>", error, response)
        callback(response);
    });
}

// Initialize bots 
require("./discord-client").createTwitterClient(messageResponseHandler);
require("./twitter-client").createDiscordClient(messageResponseHandler);
require("./xrengine-client").createXREngineClient(messageResponseHandler);
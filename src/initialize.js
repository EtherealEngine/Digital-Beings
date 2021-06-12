const XREngineBot = require('./bot');
const protoLoader = require("@grpc/proto-loader");
const grpc = require('grpc');
const getHandlers = require("./handlers");

const URL = process.env.URL || 'https://dev.theoverlay.io/location/test';
const PORT = 50051 || process.env.PORT;

const bot = new XREngineBot({ headless: !process.env.GUI });

const expectedServerDelta = 1000 / 60;
let lastTime = 0;
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
    "./bot.proto"
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


const server = new grpc.Server();
server.addProtoService(proto.TestService.service, getHandlers());

server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
server.start();
console.log(`GRPC server is running on ${PORT}`);

// Bot connects to room
(async () => {
    console.log("Preparing to connect to ", URL);
    bot.delay(Math.random() * 100000);
    console.log("Connecting to server...");
    await bot.launchBrowser();

    await new Promise((resolve) => {
        setTimeout(() => bot.enterRoom(URL, "TestBot"), 1000);
    });

    await new Promise((resolve) => {
        setTimeout(() => bot.sendMessage("Hello World! I have connected."), 5000);
    });


    // bot.sendMessage("Hello World! I have connected.");
    const message = "Why are you alive?";
    // client.invoke("get_bot_response", message, function(error, res, more) {
    //     if(error) console.warn(error);
    //     console.log("Bot Response => ", res);
    // });
})();


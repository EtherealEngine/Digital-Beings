const XREngineBot = require('./bot');
var protoLoader = require("@grpc/proto-loader");

const protoPaths = [
    "../bot.proto"
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

globalThis.requestAnimationFrame = (f) => {
    const serverLoop = () => {
        const now = Date.now();
        if(now - lastTime >= expectedServerDelta) {
            lastTime = now;
            f(now);
        } else {
            setImmediate(serverLoop);
        }
    }
    serverLoop()
}

    const expectedServerDelta = 1000 / 60;
    let lastTime = 0;

    const grpc = require('grpc');
    const proto = grpc.load(`${__dirname}/bot.proto`);
    const PORT = 50051 || process.env.PORT;

    const server = new grpc.Server();
    server.addProtoService(proto.TestService.service, {
        Test(call, cb) {
            console.log(call.request);

            const res = {
                response: `Hi, ${call.request.requester}. Here you go!`
            };

            cb(null, res);
        }
    });

    server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
    server.start();
    console.log(`GRPC server is running on ${PORT}`);

    (async () => {
        const url = process.env.URL || 'https://dev.theoverlay.io/location/test';
        const bot = new XREngineBot({ headless: !process.env.GUI });
        console.log("Preparing to connect to ", url);
        bot.delay(Math.random() * 100000);
        console.log("Connecting to server...");
        await bot.launchBrowser();

        await new Promise((resolve) => {
            setTimeout(() => bot.enterRoom(url, "TestBot"), 1000);
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

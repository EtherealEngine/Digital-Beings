# DigitalBeing
A platform for letting researchers connect an intelligent AI directly to realtime communication etworks and 3D worlds.

### How It Works
Under the hood you'll find an instance of Chrome (using Puppeteer) which can be run in headless or GUI mode. The bot uses control surfaces from the user API to interact, and also has some extra access to world state.

### Setup
1. Install python dependencies in requirements.txt
2. Install node.js dependencies
    ```npm install```
3. Run the host bot framework
    ```npm run start-gui```
4. Run the python example

### Getting Started

1. Run the bot with `npm start` -- by default it will connect to a test room on our dev server and open a port on gRPC
2. Run example.py to connect the default hello world implementation
3. Copy and paste the code from example.py into your project and hook your models into it.


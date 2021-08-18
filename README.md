# DigitalBeing
A platform for letting researchers connect an intelligent AI directly to realtime communication networks and 3D worlds.

In partnership with SuperReality, a free open source teaching platform for everyone.

## Supported Endpoints

- Twitter
- Discord
- XREngine - Bot Package
- XR Engine API

## Supported Agents

- XR Engine Testing Bot
- Echo Bot

#### Deep Learning
- DialoGPT
  - dialogpt.small
  - dialogpt.medium
  - dialogpt.large

- GTPneo
  - gptneo.small    
  - gptneo.large    
  - gptneo.xlarge  

### How It Works
Under the hood you'll find an instance of Chrome (using Puppeteer) which can be run in headless or GUI mode. The bot uses control surfaces from the user API to interact, and also has some extra access to world state.

### Setup
1. Install python dependencies in requirements.txt
    ```pip install -r requirements.txt```
2. Download and link spacy model for rasa. Spacy is used for pre-processing of the utterances, tokenization, and featurization.
    ```
        python3 -m spacy download en_core_web_md
        python3 -m spacy link en_core_web_md en
    ```
2. Install node.js dependencies
    ```npm install```
4. Create a local .env file with configuration variable for example.
    ```DISCORD_API_TOKEN=<Your Discord Bot API Token>```
    This will create a discord bot client which will listen for incomming messages when the bot gets mentioned in your server chat.
5. Use the parameters file for the agent inside ```server/agent_params.py``` here you can select which agents to launch along with some other flags. 
   you only need to edit the following parameter to launch the specific agents. Right now not all agents are working but the following list of agents have been tested and are working.
   ```
    SELECTED_AGENTS = [
                        'dialogpt.small',
                        'dialogpt.medium',
                        'dialogpt.large',
                        'gptneo.small',    
                        'gptneo.large',    
                        'gptneo.xlarge'    
                      ]
   ``` 
6. Run the host bot framework
    ```npm run start-gui```

### Getting Started

1. Run the bot with `npm start` -- by default it will connect to a test room on our dev server and open a port on gRPC
2. Run example.py to connect the default hello world implementation
3. Copy and paste the code from example.py into your project and hook your models into it.

### WSL
1. If you use WSL in Windows, you might get an error about Chromium, file or directory not found.
2. To fix this install Chromium by using 
3. wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
4. sudo apt -y install ./google-chrome-stable_current_amd64.deb

### Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build digital_being .

# Run the image
docker run -d digital_being
```


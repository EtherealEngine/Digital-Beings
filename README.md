# Digital Being
A platform for letting researchers connect an intelligent AI directly to realtime communication networks and 3D worlds.

[In partnership with **SuperReality**, a free open source teaching platform for everyone.](https://superreality.com)


# 2D/3D Interactive Endpoint API

Interactive Endpoint Connector tools for Browsers, JS, TypeScript

## Supported Endpoints

- Twitter
- Discord
- XREngine - [Bot Package](https://github.com/XRFoundation/XREngine/tree/dev/packages/bot)
- XR Engine API

# Digital Being Agent API 

### Python GRPC Agent API Bridge 

Connector tools for Python 3, Machine Learning tools such as TensorFlow, PyTorch, etc.

Interaction API goals: Listen, Speak, Interact, Move, Emote

## Supported Agents

- [XR Engine Testing Bot - Sequence of commands](https://github.com/XRFoundation/XREngine/blob/dev/packages/bot/src/run-bot.ts)
- Echo Bot - Echo what's said in a room by everyone, bots, people, 1 person
- [Rasa](https://rasa.com/) - Chat bot mainly used for managing models.

#### Deep Learning
- [DialoGPT](https://github.com/microsoft/DialoGPT)
  - dialogpt.small
  - dialogpt.medium
  - dialogpt.large

- [GPTneo](https://github.com/EleutherAI/gpt-neo)
  - gptneo.small    
  - gptneo.large    
  - gptneo.xlarge  

#### In Development
- [Wizard of Wikipedia](https://parl.ai/projects/wizard_of_wikipedia/)
- [OpenChat](https://github.com/hyunwoongko/openchat)
- [GPTj](https://6b.eleuther.ai/)
- [Droidlet](https://github.com/facebookresearch/droidlet)

## How It Works
Under the hood you'll find an instance of Chrome (using Puppeteer) which can be run in headless or GUI mode. The bot uses control surfaces from the user API to interact, and also has some extra access to world state.

Requirements
------------

DigitalBeing requires the following to run:

  * [Node.js][node] 16.x.x
  * [npm][npm] (normally comes with Node.js)
  * [Python][python] 3.8.x


[node]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[python]: https://www.python.org/ 

## Setup
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

## Getting Started

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

### TTS 

TTS Model is made by Mozilla - [http://phoenix.yizimg.com/mozilla/TTS](link)
In order to run it you will need to install it using the command 
```
pip install TTS
```
or if you want to build it through the source 
```
git clone https://github.com/mozilla/TTS
pip install -e .
```

It supports multiple Models and Vocoders
an example command to run it is
```
tts --text "hello there" \
    --model_name "tts_models/en/ljspeech/glow-tts" \
    --vocoder_name "vocoder_models/universal/libri-tts/wavegrad" \
    --out_path output_path
```
In order to get all the installed models and vocoders
```
tts --list_models
```

Finally in order to use it in code
```
import { generateVoice } from '../tts'

generateVoice('hello there', (buf, path) => { console.log('buf: ' + buf) })
```
The callback is called when the voice file is generated and read, it has the buffer which includes the bytes of the file and the path of the file.
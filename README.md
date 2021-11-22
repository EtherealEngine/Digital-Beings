# Digital Being
A platform for letting researchers connect an intelligent AI directly to realtime communication networks and 3D worlds.

[In partnership with **SuperReality**, a free open source teaching platform for everyone.](https://superreality.com)


# 2D/3D Interactive Endpoint API

Interactive Endpoint Connector tools for Browsers, JS, TypeScript

## Supported Endpoints

- Discord
- XREngine - [Bot Package](https://github.com/XRFoundation/XREngine/tree/dev/packages/bot)
- XR Engine API
- Twilio (SMS)
- Zoom
- Telegram

# Digital Being Agent API 

### Python TCP Agent API Bridge 

Connector tools for Python 3, Machine Learning tools such as TensorFlow, PyTorch, etc.

Interaction API goals: Listen, Speak, Interact, Move, Emote
[Networking Information](https://docs.google.com/document/d/1tLyZpVFIwr9jb2UoyO1_f4zu6heKj7i8marqDQ67P48/edit?usp=sharing)

## Supported Agents

- [XR Engine Testing Bot - Sequence of commands](https://github.com/XRFoundation/XREngine/blob/dev/packages/bot/src/run-bot.ts)
- Echo Bot - Echo what's said in a room by everyone, bots, people, 1 person
- [Openai GPT3](https://openai.com/blog/openai-api/) - Openai's GPT3 chat bot
- Currently OpenAI and Repeat agents are enabled, to enable the rest agents, uncomment the needed requirements in the requirement.txt file and the .py files under server/agents/openai

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
Under the hood you'll find an instance of Chrome (using Puppeteer) which can be run in a virtual headful. The bot uses control surfaces from the user API to interact, and also has some extra access to world state.
Some clients, like Discord or Telegram use directly their APIs to handle the chat.

Requirements
------------

DigitalBeing requires the following to run:

  * [Node.js][node] 16.x.x
  * [npm][npm] (normally comes with Node.js)
  * [Python][python] 3.8.x
  * [Docker][docker] 20.10.x (can be ignored)


[node]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[python]: https://www.python.org/ 
[docker]: https://www.docker.com/

## Setup - Docker (WSL/Linux)
1. Install docker and docker-compose
2. cd to the repository folder
3. rename the .env.default to .env and updated the variables
4. update the /src/initialize.ts script with the clients you need and /server/agent_params.py with the needed agents (by default, discord is used and gpt3-openai)
5. run docker-compose build - to build the docker image
6. in order to run the image you can use docker-compose up (or docker-compose -d to make it run on the background)
7. in order to close the image you can use CTRL+C if you are inside the image or docker-compose down if not

## Setup - Without Docker
1. Install python dependencies in requirements.txt
    ```pip install -r requirements.txt```
2. Install node.js dependencies
    ```npm install```
3. Rename the .env.default to .env and updated the variables
4. Use the parameters file for the agent inside ```server/agent_params.py``` here you can select which agents to launch along with some other flags. 
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
    ```npm run```

7. Install postgres - [Detailed Tutorial](https://harshityadav95.medium.com/postgresql-in-windows-subsystem-for-linux-wsl-6dc751ac1ff3)
   * sudo apt-get install postgresql
   * sudo passwd postgres -> to update the password for the postgres user
   * sudo service postgresql start
   * sudo -u postgres psql
   * Database Instalation:
     * Login to postgres with an admin user
     * CREATE DATABASE digitalbeing;
     * \c digitalbeing
     * CREATE TABLE chat_history(client_name text, chat_id text, message_id text, global_message_id text, sender text, content text, createdAt text);
     * CREATE TABLE blocked_users(user_id varchar(255), client varchar(25));
     * DROP TABLE IF EXISTS chat_filter;
     * CREATE TABLE chat_filter(half int, max int);
     * INSERT INTO chat_filter(half, max) VALUES(5, 10);
     * CREATE TABLE IF NOT EXISTS bad_words(word varchar(255), rating int);
     * CREATE TABLE IF NOT EXISTS keywords(word varchar(255), count varchar(5), agent varchar(255));
     * Update the variables in the .env for the PG with your credentials

## Twilio Setup
1. In order to run Twilio you will need to install NGROK or an alternative.
2. Run ngrok and with the same HTTP port set for the TWILIO_PORT in the .env -> ngrok http 65535
3. Update Twilio WebHooks for Messaging (SMS) with the new ngrok link x.x.x.x.ngrok.io/sms for the active number
### How To Install NGROK on Ubuntu - [Official Website](https://ngrok.com/download)
1. wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
2. sudo apt install unzip
3. ./ngrok -> this command should return the info of the ngrok command
4. ./ngrok http port

### WSL
1. If you use WSL in Windows, you might get an error about Chromium, file or directory not found.
2. To fix this install Chromium by using 
3. wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
4. sudo apt -y install ./google-chrome-stable_current_amd64.deb

### Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build -t digital_being .

# Run the image
docker run -d digital_being
```

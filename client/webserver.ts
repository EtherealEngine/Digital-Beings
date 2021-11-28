import { urlencoded, json } from 'express';
import express = require('express');

export let router
export let app
const verify_token = process.env.MESSENGER_VERIFY_TOKEN

export async function createWebServer() {
    router = express.Router();
    router.use(urlencoded({ extended: false }));
    app = express()
    app.use(json())
   
    app.get('/facebook', (req, res) => {
        res.send('Hello World I am running locally');
    });
    //app.listen(process.env.WEBSERVER_PORT, () => { console.log(`Server listening on http://localhost:${process.env.WEBSERVER_PORT}`); })
}
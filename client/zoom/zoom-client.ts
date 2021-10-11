import { zoom } from "./zoom"
let Xvfb  = require('xvfb')

let zoomObj: zoom = undefined
export const createZoomClient = async (messageResponseHandler) => {
    var xvfb = new Xvfb ();
    await xvfb.start(async function(err, xvfbProcess) {
        if (err) {
            console.log(err)
            xvfb.stop(function(_err) {
                if (_err) console.log(_err) 
            });
        }

        console.log('started virtual window')
        zoomObj = new zoom(messageResponseHandler)
        await zoomObj.init();
    });
}
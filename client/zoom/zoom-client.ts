import { zoom } from "./zoom"

let zoomObj: zoom = undefined
export const createZoomClient = async (messageResponseHandler) => {
    zoomObj = new zoom(messageResponseHandler)
    await zoomObj.init()
}
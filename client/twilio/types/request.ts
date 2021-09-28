import { Request } from "express";
import { Query } from "express-serve-static-core";
import { ParamsDictionary } from "express-serve-static-core";

type MessagingWebhookBody = {
    MessageSid: string
    Body: string
    From: string
    To: string
}

export type MessagingRequest = Request<ParamsDictionary, any, MessagingWebhookBody, Query>;
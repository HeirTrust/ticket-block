import * as express from "express";
import * as jwt from "express-jwt";
import {  HomeRouter,  TicketRouter} from "../app/routes";
import { config } from "../config";

interface IROUTER {
    path: string;
    middleware: any[];
    handler: express.Router;
}


const Home = new HomeRouter();
const TicketRoutr = new TicketRouter();

export const ROUTER: IROUTER[] = [

    {
        handler: TicketRoutr.router,
        middleware: [],
        path: "/tickets",
    },
    {
        handler: Home.router,
        middleware: [],
        path: "/",
    }
];

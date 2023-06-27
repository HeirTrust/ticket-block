import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
// @ts-ignore
import exphbs = require("express-handlebars");
import * as fs from "fs";
import * as https from "https";
import * as methodOverride from "method-override";
import * as morgan from "morgan";
import * as path from "path";
import { ArService } from "../app/services";
import { Connection } from "./Database";
import {express_handlebars_sections} from "./express-handlebars-section";
import helpers from "./hbs_helpers";
import { ROUTER } from "./Router";
const timeout = require('connect-timeout'); //express v4

const haltOnTimedout = (req: any, res: any, next: any) => {
    
    if (!req.timedout) {
      next();
    }
}

export class Server {

    private static connectDB(): Promise<any> {
        return Connection;
    }

    private readonly app: express.Application;
    private readonly server: https.Server;
    //private readonly arService: ArService;

    constructor() {
        this.app = express();
        console.log('ENV : ', process.env.NODE_ENV);
        
        this.server = https.createServer({
            key: fs.readFileSync(path.join(__dirname,  "../security/cert.key")),
            cert: fs.readFileSync( path.join(__dirname,  "../security/cert.pem") ),

            }, this.app);
        // this.server = https.createServer(this.app);
        // this.arService = new ArService();

    }

    public async start(): Promise<https.Server> {
        await Server.connectDB();
        this.expressConfiguration();
        this.configurationRouter();
        return this.server;
    }

    public App(): express.Application {
        return this.app;
    }

    private expressConfiguration(): void {
        this.app.use(timeout('200s'));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ limit: "50mb" }));
        this.app.use(haltOnTimedout);
        this.app.use(methodOverride());
        this.app.use(haltOnTimedout);
        this.app.use((req, res, next): void => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
            res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS");
            next();
        });
        this.app.use(haltOnTimedout);
        this.app.use(express.static(path.join(__dirname, "../public")));
        this.app.set("views", path.join(__dirname, "../views"));
        this.app.use(haltOnTimedout);
        // Sets our app to use the handlebars engine

        this.app.engine("hbs", exphbs({
            layoutsDir: path.join(__dirname, "../views"),
            extname: "hbs", // not working
            helpers,
        }));
        this.app.use(haltOnTimedout);
        this.app.set("view engine", "hbs"); // Sets handlebars configurations (we will go through them later on)
        this.app.use(haltOnTimedout);
        this.app.use(morgan("combined"));
        this.app.use(cors());
        this.app.use(haltOnTimedout);
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
            console.error("Error:: ", err);
            err.status = 404;
            next(err);
        });

        this.app.use(haltOnTimedout);
        
        

        
    }

    

    private configurationRouter(): void {
        for (const route of ROUTER) {
            this.app.use(route.path, route.middleware, route.handler);
        }
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {

            res.status(404);
            res.json({
                error: "Not found",
            });
            next();
        });
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
            if (err.name === "UnauthorizedError") {
                res.status(401).json({
                    error: "Please send a valid Token...",
                });
            }
            next();
        });
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
            res.status(err.status || 500);
            res.json({
                error: err.message,
            });
            next();
        });
    }

}



import {  TicketController } from "../controllers";
import { Validator } from "../middlewares";
import {  ticket} from "../schemas";
import { Router } from "./Router";

// Also change in config/Router
export class TicketRouter extends Router {
    constructor() {
        super(TicketController);
        this.router
            .get('/',this.handler(TicketController.prototype.index))
            // .get('/tickets/metadata/:chainId/:id',this.handler(TicketController.prototype.getTicketMetadata))
            .get('/metadata/:id',this.handler(TicketController.prototype.getTicketMetadata))
            
            
            .post("/submit-ticket", [ Validator(ticket) ], this.handler(TicketController.prototype.submitTicket))
            
    }
}

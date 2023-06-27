
import { HomeController } from "../controllers";
import { Validator } from "../middlewares";
import { Router } from "./Router";

export class HomeRouter extends Router {
    constructor() {
        super(HomeController);

        this.router
            .get("/", this.handler(HomeController.prototype.index))
            
    }
}

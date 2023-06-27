import { Request, Response } from "express";


import { Controller } from "./Controller";


export class HomeController extends Controller {

    constructor(req: Request, res: Response) {
        super(req, res);
        
    }

    public async index() {


        return this.res.render("index", {
            layout: "_layout.hbs",
            // companyInfo: this.config.get('app').companyInfo,
            // host: req.headers.host,
            message: "Ticket Block"
        });
    }

        

}

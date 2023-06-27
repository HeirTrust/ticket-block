import Arweave = require("arweave/node");
import * as fs1 from "fs";
const fs = require('fs').promises;
// const path = require("path");
import * as path from "path";
const sizeof = require("object-sizeof");

// import fetch = require('node-fetch');
import fetch from 'node-fetch';


const axios = require('axios');
import * as ArweaveUtils from "arweave/node/lib/utils";

const arweaveGatewayPath = process.env.ARWEAVE_GATEWAY;
// import Community = require( "community-js");

export class ArService {

    public jwk: any;
    public arweave: Arweave;   

    
    
    

    constructor() {
        // console.log('LL::', path.resolve('app/shell-commands/create-vod-hls.sh') )


          
          
    }

    public async verify(claimInfo: {
        address: string,
        bsc: string,
        publicModulus: string,
        signature: string
    }){
        let data = new TextEncoder().encode(claimInfo.bsc)
        let verified = await Arweave.crypto.verify(claimInfo.publicModulus, data, ArweaveUtils.b64UrlToBuffer(claimInfo.signature));

        return verified;

    }

   
    


    public formatDateToUTCString(date: Date) {

        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                        .toISOString()
                        .split("T")[0];
    }

}

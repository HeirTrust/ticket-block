import { TicketRepository } from "../repository";
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { ArService } from "../services";
import { Controller } from "./Controller";

import {ethers} from 'ethers';
import { MerkleTree } from 'merkletreejs';
import keccak256 = require("keccak256");
import { Ticket } from "../models";




const toWei = (num: any) => ethers.utils.parseEther(num.toString())
const fromWei = (num: any) => ethers.utils.formatEther(num)

interface ChainListArray {
    [index: string]: {
        rpc: string,
        supportedCoins: {
            name: string,
            address: string
        }[]
    };
}



const supportedChains: ChainListArray = {
    "MTR" : {
        rpc: "https://rpc.meter.io",
        supportedCoins: [
            {
                name: "MTR",
                address: "0x0000000000000000000000000000000000000000" // 0x687A6294D0D6d63e751A059bf1ca68E4AE7B13E2
            },
            {
                name: "MTRG",
                address: "0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3"
            }
        ]
    },
    "MTRT" : {
        rpc: "https://rpctest.meter.io",
        supportedCoins: [
            {
                name: "MTR",
                address: "0x0000000000000000000000000000000000000000" // 0x687A6294D0D6d63e751A059bf1ca68E4AE7B13E2
            },
            {
                name: "MTRG",
                address: "0x6400e0a235e292cd3323779c293a99ea3a6174a8"
            }
        ]
    },
    "HRDT" : {
        rpc: "http://localhost:8545",
        supportedCoins: [
            {
                name: "ETH",
                address: "0x0000000000000000000000000000000000000000" 
            },
            {
                name: "USDC",
                address: "0x9E545E3C0baAB3E08CdfD552C960A1050f373042"
            }
        ]
    },
    "BSC" : {
        rpc: "https://bsc-dataseed1.binance.org",
        supportedCoins: [
            {
                name: "BNB",
                address: "0x0000000000000000000000000000000000000000" 
            }
        ]
    },
    "BTTC" : {
        rpc: "https://rpc.bt.io",
        supportedCoins: [
            {
                name: "BTTC",
                address: "0x0000000000000000000000000000000000000000" 
            }
        ]
    },
    "BTTCT" : {
        rpc: "https://pre-rpc.bt.io",
        supportedCoins: [
            {
                name: "BTTC",
                address: "0x0000000000000000000000000000000000000000" 
            }
        ]
    },

    "CELO" : {
        rpc: "https://forno.celo.org",
        supportedCoins: [
            {
                name: "CELO",
                address: "0x0000000000000000000000000000000000000000" 
            }
        ]
    },
    "CELOT" : {
        rpc: "https://alfajores-forno.celo-testnet.org",
        supportedCoins: [
            {
                name: "CELO",
                address: "0x0000000000000000000000000000000000000000" 
            }
        ]
    },

    "FRA" : {
        rpc: "https://rpc-mainnet.findora.org",
        supportedCoins: [
            {
                name: "FRA",
                address: "0x0000000000000000000000000000000000001000" 
            }
        ]
    },
    "FRAT" : {
        rpc: "https://prod-testnet.prod.findora.org:8545",
        supportedCoins: [
            {
                name: "FRA",
                address: "0x0000000000000000000000000000000000001000" 
            }
        ]
    },
};


export class TicketController extends Controller {

    constructor(req: Request, res: Response) {
        super(req, res);                
    }

    public async index(): Promise<Response> {
        // const r = await signMessage();
        // const b1 = confirmWeb3Signature(r.messageSignature, r.ethAddress);

        return this.res.send({success: true});
    }


    public async submitTicket(): Promise<Response> {
        const ticket = this.req.body as {
            id: string,
            chainId: number,
            eventId: string,
            metadata: string
        };

               

        
        try {
            
            let r = await getCustomRepository(TicketRepository).save({                
                ...ticket,
                id: `${ticket.chainId}-${ticket.eventId}-${ticket.id}`
            });

            return this.res.status(200).send({ success: true, id: r.id   });
        } catch (ex) {
            console.error(ex);
            return this.res.status(404).send({ message : "ERROR" });
        }
    }

    public async getTicketMetadata(): Promise<Response> {

        // const {id, eventId} = this.req.params as {
        //     id: string,
        //     eventId: string
        // }
        const {id} = this.req.params as {
            id: string
        }
        
                
        try {
            const dbResult = await getCustomRepository(TicketRepository).findOne(`${id}`);

            if(dbResult){
                
                return this.res.status(200).send(JSON.parse( dbResult.metadata) );
            }
        } catch (ex) {
            console.error(ex);
            return this.res.status(404).send({ message : "ERROR" });
        }

        return this.res.status(400).send({success: false});
    }

    


}

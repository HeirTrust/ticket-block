import { date, number, object, optional, string, array } from "@hapi/joi";

export const ticket = object().keys({
    id: string().required(),
    eventId: string().required(),
    chainId: number().required(),
    metadata: string().required(), // array().items(string()).required(),
    
});

export const get_campaign_proof = object().keys({
    id: string().required(),
    chain: string().required(),
    //sender Address
    address: string().required(),
    // signatureHash: string().required()
});

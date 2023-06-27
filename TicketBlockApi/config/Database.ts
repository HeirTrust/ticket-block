import { createConnection } from "typeorm";
import { Ticket} from "../app/models";
import { config } from "../config";


export const Connection = createConnection({
    database: config.DATABASE.DB,
    entities: [
        Ticket
    ],
    host: config.DATABASE.SERVER,
    logging: false,
    password: config.DATABASE.PASSWORD,
    port: config.DATABASE.PORT_DB,
    synchronize: true,
    type: config.DATABASE.DIALECT as any,
    username: config.DATABASE.USER_DB,
});

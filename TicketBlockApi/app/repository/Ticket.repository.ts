import { EntityRepository, Repository } from "typeorm";
import { Ticket } from "../models/ticket.model";

@EntityRepository(Ticket)
export class TicketRepository extends Repository<Ticket> {

    

}

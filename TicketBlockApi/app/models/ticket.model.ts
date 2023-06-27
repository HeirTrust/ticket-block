
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity("ticket")
export class Ticket extends BaseEntity {

    /// Id - {chainid}-{eventId}-{id} e.g 1-1
    // @PrimaryGeneratedColumn() - Address
    @PrimaryColumn()
    public id: string;

    // JSON 
    @Column()
    public metadata: string;

    @Column()
    public chainId: number;

    
    @Column()
    public eventId: string;
    
    @CreateDateColumn()
    public dateCreated: Date;


}
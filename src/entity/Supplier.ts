import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index, CreateDateColumn, DeleteDateColumn,
} from 'typeorm';


@Entity()
@Index(['id', 'supplier_name'])
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supplier_name!: string

    @Column({ nullable: true})
    whatsAppNumber!: string;

    @Column()
    payment_term!: string

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    delete_at?: Date;

}

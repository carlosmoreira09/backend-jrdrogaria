import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index, CreateDateColumn, DeleteDateColumn,
} from 'typeorm';


@Entity()
@Index(['id', 'supplier_name', 'cnpj'])
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    supplier_name!: string

    @Column()
    cnpj!: string;

    @Column()
    email!: string;

    @Column()
    payment_mode!: string

    @Column()
    payment_term!: string

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    delete_at?: Date;

}

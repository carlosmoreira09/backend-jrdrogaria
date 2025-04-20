import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index
} from 'typeorm';


@Entity()
@Index(['id', 'product_name'])
export class Products {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    product_name!: string

}

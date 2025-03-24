import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    DeleteDateColumn,
    ManyToMany, JoinTable, ManyToOne
} from 'typeorm';
import { Tenant } from './Tenant';

@Entity()
@Index(['id', 'cpf', 'fullName'])
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    fullName!: string;

    @Column({ unique: true })
    cpf!: string;

    @Column()
    password!: string;

    @Column({ nullable: false })
    role!: string;

    @Column({ nullable: true })
    sessionToken?: string;
    
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => Tenant, tenant => tenant.admins, { nullable: true })
    @JoinTable()
    tenants!: Tenant;

    @DeleteDateColumn()
    delete_at?: Date;
}

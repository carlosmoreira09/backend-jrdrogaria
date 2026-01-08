import {
    Entity,
    ManyToOne,
    PrimaryColumn,
    Index,
    CreateDateColumn
} from 'typeorm';
import { Users } from './Users';
import { Store } from './Store';

@Entity('user_stores')
@Index(['store', 'user'])
export class UserStore {
    @PrimaryColumn()
    user_id!: number;

    @PrimaryColumn()
    store_id!: number;

    @ManyToOne(() => Users, { onDelete: 'CASCADE' })
    user!: Users;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    store!: Store;

    @CreateDateColumn()
    created_at!: Date;
}

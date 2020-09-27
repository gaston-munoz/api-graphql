import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;
    
    @Column()
    password!: string;

    @CreateDateColumn({ type: Date })
    createdAt!: string;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity  } from 'typeorm';


@Entity()
export class Category extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    userId!: number;
}
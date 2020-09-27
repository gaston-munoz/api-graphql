import { type } from 'os';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity  } from 'typeorm';


@Entity()
export class Recipe extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ nullable: true })
    ingredients!: string[];

    @Column()
    categoryId!: number;

    @Column()
    user!: number;
}
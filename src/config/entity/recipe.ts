import { type } from 'os';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, JoinTable } from 'typeorm';
import { Category } from './category';
import { User } from './user';


@Entity()
export class Recipe extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ nullable: true })
    ingredients!: string;

    @ManyToOne(type=>User, { eager: true })
    user!: User;
 
    @ManyToOne(type=> Category, category => category.recipes, { eager: true })
    @JoinTable()
    category!: Category;
}
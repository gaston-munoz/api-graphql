import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, OneToMany  } from 'typeorm';
import { Recipe } from './recipe';


@Entity()
export class Category extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(type => Recipe, recipe => recipe.category)
    recipes!: Recipe[];
}
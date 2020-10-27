import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, OneToMany  } from 'typeorm';
import { Recipe } from '../recipe/recipe.model';


@Entity()
export class Category extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @OneToMany(type => Recipe, recipe => recipe.category)
    recipes!: Recipe[];
}
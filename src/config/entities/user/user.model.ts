import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity, OneToMany, JoinColumn } from 'typeorm';
import { Recipe } from '../recipe/recipe.model';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;
    
    @Column()
    password!: string;

    @CreateDateColumn({ type: Date })
    createdAt!: string;
/*
    @OneToMany(type => Recipe, recipe => recipe.category, { eager: true })
    recipes!: Recipe[];
*/
}
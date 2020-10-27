import { User } from '../../user/user.model';
import { Category } from '../../category/category.model';
import { Recipe } from '../recipe.model';
import { authenticated, generateToken } from '../../../../auth'
import dotenv from 'dotenv';
import {  Like } from 'typeorm';
import { ArgUser } from '../../user/resolver/interfaces';
import {
    IQuery,
    RecipeIdArg,
    FilterRecipeArg,
    RecipeArg,
    UpdtRecipeArg,
} from './interfaces'
dotenv.config();

const resolvers = {
    Query:{

        getRecipes: authenticated(async(_: any, { filter = {} }: FilterRecipeArg ) => {
            try {
                let { name = '', description = '' , ingredients = '', category  } = filter;      
                let categoryDB = category ? { id: category } : undefined            
                let query: IQuery = {
                    name: Like(`%${name}%`),
                    description: Like(`%${description}%`),
                    ingredients: Like(`%${ingredients}%`),
                }
                if(category)
                    query = { ...query, category: categoryDB }
                const recipes = await Recipe.find(query)  
    
                return recipes;
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        }), 
        getMyRecipes: authenticated(async(_: any, { filter = {} }: FilterRecipeArg, { user }: ArgUser  ) => {
            try {
                let { name = '', description = '' , ingredients = '', category } = filter;
                let userDb = { id: user.id };
                let categoryDB = category ? { id: category } : undefined
                let query: IQuery = { 
                    name: Like(`%${name}%`),
                    description: Like(`%${description}%`),
                    ingredients: Like(`%${ingredients}%`),
                    user: userDb
                }
                if(category)
                   query = { ...query, category: categoryDB }
                const recipes = await Recipe.find(query)

                return recipes;
            } catch (error) {
                throw new Error(`Internal server Error - ${error.message}`);
            }
        }),
        getOneRecipe: authenticated(async (_: any, { id }: RecipeIdArg) => {
            try {
                let recipe = await Recipe.findOne({ id });

                return recipe; 
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })
    },

    Mutation: {

        createRecipe: authenticated(async (_: any, { recipe }: RecipeArg, { user }: ArgUser ) => {
                let { name, description, ingredients, categoryId } = recipe;

                try {
                    let userDB = await User.findOne({ id: user.id }) || new User();  
                    let catDB = await Category.findOne({id: categoryId}) || new Category();

                    if(catDB.id) {  
                        const newRecipe = new Recipe();
                        newRecipe.name = name;
                        newRecipe.description = description;
                        newRecipe.ingredients = ingredients;
                        newRecipe.user = userDB;
                        newRecipe.category = catDB;
                        await newRecipe.save(); 
            
                        return newRecipe; 
                    }
                    else {
                        throw new Error('Category not exists');
                    }
                } catch (error) {
                    throw new Error(`Error processing request - ${error.message}`);
                }
        }),
        updateRecipe: authenticated(async (_: any, { recipe }: UpdtRecipeArg) => {
                let { id } = recipe;

                const existsRecipe = await Recipe.findOne({ id });
                if(existsRecipe) {
                    if(recipe.category) {
                        const existsCategory = await Category.findOne({ id: Number(recipe.category)})
                        if(!existsCategory)
                            throw new Error('Category not exists');

                        recipe.category = existsCategory;    
    
                    }  
                    
                    await Recipe.update({ id }, recipe);
    
                    return await Recipe.findOne({ id });
                }
    
                throw new Error('Recipe not exists');
        }),
        deleteRecipe: authenticated(async (_: any, { id }: RecipeIdArg) => {
            try {
                let existsRecipe = await Recipe.findOne({ id });
                if(!existsRecipe) {
                    throw new Error('Recipe not exists');
                }
                else {
                    Recipe.remove(existsRecipe);
    
                    return existsRecipe;
                }
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`);
            }

        })

    }
}

export default resolvers;

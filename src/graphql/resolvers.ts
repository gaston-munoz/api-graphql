import { User } from '../config/entity/user';
import { Category } from '../config/entity/category';
import { Recipe } from '../config/entity/recipe';
import bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticated, generateToken } from '../auth'
import dotenv from 'dotenv';
import { createQueryBuilder, FindOperator, Like } from 'typeorm';
dotenv.config();

// User
interface ArgUser {
    user: IUserModel
}

type DBUser =  IUserModel | undefined

interface IUserModel {
    id?: number,
    name?: string,
    email: string,
    password: string,
    createdAt?: string
}

interface UserLogin {
    user: IUserModel
}

interface Token {
    token: string
}

// Category


interface ICategoryArg {
    input: CategoryData
}

interface CategoryArg {
    category: CategoryData
}

interface CategoryData {
    id:number,
    name: string,
}

interface CategoryId {
    id: number
}

interface FilterCategoryArg {
    filter?: FilterCategory
}

interface FilterCategory {
    name?: string
}

// Recipe Types

interface RecipeArg {
    recipe: RecipeData
}

interface RecipeData {
    id?: number,
    name: string,
    description: string,
    ingredients: string,
    userId: number, 
    categoryId?: number,
}

interface UpdtRecipeArg {
    recipe: UpdtRecipe
}

interface UpdtRecipe {
    id: number,
    name?: string,
    description?: string,
    ingredients?: string,
    userId?: number, 
    categoryId?: number
    category?: Category

}

interface RecipeIdArg {
    id: number
}

interface FilterRecipeArg {
    filter: FilterRecipe
}

interface FilterRecipe {
    name?: string
    description?: string
    ingredients?: string
    category?: number
    user?: number
}

// Interfaces query


interface ICatId {
    id: number | undefined
}  

interface IQuery {
    name: FindOperator<string>;
    description: FindOperator<string>;
    ingredients: FindOperator<string>;
    category?: ICatId | undefined 
    user?: ICatId
}

const resolvers = {
    Query:{

         // User Queries
        getUser: async (_ : any, { token }: Token) => {
            const user = await jwt.verify(token, process.env.SECRET || '');

            return user
        },
        users: async (_: any, __: any, { user }: ArgUser) => {
            let users = await User.find();

            return users;
        },

        // Category Queries
        getCategories: authenticated(async (_: any, { filter }: FilterCategoryArg) =>{
            try {
                let filterSearch = filter && filter.name ? filter.name : '';
                const categories = await Category.find({ where: `Category.name ILIKE '%${filterSearch}%'` });
       
                return categories;
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        }),
        getOneCategory: authenticated(async (_: any, { id }: CategoryId, { user }: ArgUser) => {
            try {
                return await Category.findOne({ id });
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        }),

        // Recipes Queries
        getRecipes: authenticated(async(_: any, { filter = {} }: FilterRecipeArg ) => {
            try {/*
                let { name = '', description = '' , ingredients = '', category = '' } = filter;
                const recipes = await Recipe.find({join: { alias: 'category',  leftJoinAndSelect: { category: 'category' } }, where: `name ILIKE '%${name}%' and description ILIKE '%${description}%'
                  and  ingredients ILIKE '%${ingredients}%' and category.name = '${category}'`, relations: ['category'] , 
                  });

                const rec = await createQueryBuilder('recipe') 
                    .innerJoinAndSelect('recipe.category', 'category', "category.name ILIKE ")
                    .where('')

*/
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
                console.log('REC',recipes, category, categoryDB, query)  
    
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

/*
                let categoryDB = { id: category }
                const recipes = await Recipe.find({  //// Its work
                name: Like(`%${name}%`),
                description: Like(`%${description}%`),
                ingredients: Like(`%${ingredients}%`),
                user: userDb,
                category: categoryDB
                })
*/
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

        // User Mutations
        signUp: async (_: any, { user }: ArgUser ) =>{
            let { name, email, password } : IUserModel = user;
            const userExist: DBUser = await User.findOne({ email })

            if(userExist) {
                throw new Error('The email already exists')
            }
            
            try {
                const salt: string  = await bcrypt.genSalt(10);
                let nUser = new User();
                nUser.name = name || '';
                nUser.password = await bcrypt.hash(password, salt);
                nUser.email = email;
                await nUser.save();
    
                return nUser;
            } catch (error) {
                console.log(error);
                throw new Error(`Error processing request - ${error.message}`);
            }
           
        },

        login: async (_: any , { user }: UserLogin) => {
            let { email: userEmail, password: userPass } = user;

            /// verify if user exists
            const userExists: DBUser = await User.findOne({ email: userEmail });

            if(!userExists) {
                throw new Error('Error bad credentials');
            }

            // compare passwords
            let isAuthorized = await bcrypt.compare(userPass, userExists.password)

            if(!isAuthorized) {
                throw new Error('Error bad credentials');
            }

            // generate the token and send
            const token = generateToken(userExists, process.env.SECRET || '', '24h')
            return {
                user: userExists,
                token
            }
        },

        //// category Mutations
        createCategory: authenticated(async (_: any, { input }: ICategoryArg) => {
                const { name } = input;

                try {              
                    const newCateg = new Category();
                    newCateg.name = name;
                    await newCateg.save();
    
                    return newCateg;
                } catch (error) {
                    console.log(error);
                    throw new Error(`Error processing request - ${error.message}`);
                }
        }),
        deleteCategory: authenticated(async (_: any, { id }: CategoryId) => {
            try {
                const existsCat = await Category.findOne({id});

                if(!existsCat) {
                    throw new Error('Category not exists');
                }
                await Category.remove (existsCat);
    
                return existsCat;
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`, );
            }
        }),
        updateCategory: authenticated(async (_: any, { category }: CategoryArg) => {
            try {
                let { id, name } = category;

                const existsCat = await Category.findOne({ id }); 
                if(existsCat){
                   await Category.update({ id }, { name });
                   
                   return category;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            catch(err) {
                throw new Error(`Error processing request - ${err.message}`);
            }
        }),

        // Recipes Mutations
        createRecipe: authenticated(async (_: any, { recipe }: RecipeArg, { user }: ArgUser ) => {
                let { name, description, ingredients, categoryId } = recipe;

                try {
                    let userDB = await User.findOne({ id: user.id }) || new User();  
                    let catDB = await Category.findOne({id: categoryId}) || new Category();

                    console.log('ERRER', recipe, userDB, catDB, catDB.id)

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
                    if(recipe.categoryId) {
                        recipe.category = await Category.findOne({ id: recipe.categoryId})
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

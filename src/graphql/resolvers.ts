import { User } from '../config/entity/user';
import { Category } from '../config/entity/category';
import { Recipe } from '../config/entity/recipe';
import bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticated, generateToken } from '../auth'
import dotenv from 'dotenv';
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

type UserVerify = object | string | UserToken

interface UserToken {
    id: number,
    email: string
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
    id?:number,
    name: string,
    userId: number
}

interface CategoryId {
    id: number
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
    categoryId: number
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
}

interface RecipeIdArg {
    id: number
}

const resolvers = {
    Query:{

         // User Queries
        getUser: async (_ : any, { token }: Token) => {
            const user = await jwt.verify(token, process.env.SECRET || '');
            console.log('TOKEN', token, user)

            return user
        },
        users: async (_: any, __: any, { user }: ArgUser) => {
            let users = await User.find();

            return users;
        },

        // Category Queries
        categories: authenticated(async (_: any, __: any) =>{
            const categories = await Category.find();

            return categories;
        }),
        category: authenticated(async (_: any, { id }: CategoryId, { user }: ArgUser) => {
                return await Category.findOne({ id });
        }),

        // Recipes Queries 
        recipes: authenticated(async(_: any, __: any, { user }: ArgUser ) => {
                const recipes = await Recipe.find();

                return recipes;
        }), 
        recipe: authenticated(async (_: any, { id }: RecipeIdArg, { user }: ArgUser) => {
                let recipe = await Recipe.findOne({ id });

                return recipe; 
        })

    },
    Mutation: {

        // User Mutations
        registry: async (_: any, { user }: ArgUser ) =>{
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
                throw new Error('CODE STATUS 500 - Internal server error');
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
            const token = generateToken(userExists, process.env.SECRET || 'TODOSLOSPERROSVANALCIELO', '24h')
            return {
                user: userExists,
                token
            }
        },

        //// category Mutations
        createCategory: authenticated(async (_: any, { input }: ICategoryArg, { user }: ArgUser) => {
            if(user) {
                const { name, userId } = input;

                try {              
                    const newCateg = new Category();
                    newCateg.name = name;
                    newCateg.userId = userId;
                    await newCateg.save();
    
                    return newCateg;
                } catch (error) {
                    console.log(error);
                    throw new Error('Status code 500 - Internal server error');
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }),
        deleteCategory: authenticated(async (_: any, { id }: CategoryId, { user }: ArgUser) => {
            if(user) {
                const existsCat = await Category.findOne({id});

                if(!existsCat) {
                    throw new Error('Category not exists');
                }
                await Category.remove (existsCat);
    
                return existsCat;
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }),
        updateCategory: authenticated(async (_: any, { category }: CategoryArg, { user }: ArgUser) => {
            if(user) {
                let { id, name, userId } = category;

                const existsCat = await Category.findOne({ id }); 
                if(existsCat){
                   await Category.update({ id }, { name, userId });
                   
                   return category;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }),

        // Recipes Mutations
        createRecipe: authenticated(async (_: any, { recipe }: RecipeArg, { user }: ArgUser ) => {
            if(user) {
                let { name, description, ingredients, userId, categoryId } = recipe;

                try {
                    const newRecipe = new Recipe();
                    newRecipe.name = name;
                    newRecipe.description = description;
                    newRecipe.ingredients = ingredients;
                    newRecipe.userId = userId;
                    newRecipe.categoryId = categoryId;
                    await newRecipe.save();
        
                    return newRecipe;
                } catch (error) {
                    throw new Error(`Code status 500 - Internal server error - ${error.message}`);
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }),
        updateRecipe: authenticated(async (_: any, { recipe }: UpdtRecipeArg, { user }: ArgUser) => {
            if(user) {
                let { id, name, description, ingredients, userId, categoryId } = recipe;

                const existsRecipe = await Recipe.findOne({ id });
                if(existsRecipe) {
                    await Recipe.update({ id }, recipe);
    
                    return await Recipe.findOne({ id });
                }
    
                throw new Error('Recipe not exists');
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }),
        deleteRecipe: authenticated(async (_: any, { id }: RecipeIdArg, { user }: ArgUser) => {
            if(user) {
                let existsRecipe = await Recipe.findOne({ id });
                if(!existsRecipe) {
                    throw new Error('Recipe not exists');
                }
                else {
                    Recipe.remove(existsRecipe);
    
                    return existsRecipe;
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }

        })

    }
}

export default resolvers;

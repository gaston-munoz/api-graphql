"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../config/entity/user");
const category_1 = require("../config/entity/category");
const recipe_1 = require("../config/entity/recipe");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../auth");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
dotenv_1.default.config();
const resolvers = {
    Query: {
        // User Queries
        getUser: (_, { token }) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield jsonwebtoken_1.default.verify(token, process.env.SECRET || '');
            return user;
        }),
        users: (_, __, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let users = yield user_1.User.find();
            return users;
        }),
        // Category Queries
        getCategories: auth_1.authenticated((_, { filter }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let filterSearch = filter && filter.name ? filter.name : '';
                const categories = yield category_1.Category.find({ where: `Category.name ILIKE '%${filterSearch}%'` });
                return categories;
            }
            catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })),
        getOneCategory: auth_1.authenticated((_, { id }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield category_1.Category.findOne({ id });
            }
            catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })),
        // Recipes Queries
        getRecipes: auth_1.authenticated((_, { filter = {} }) => __awaiter(void 0, void 0, void 0, function* () {
            try { /*
                let { name = '', description = '' , ingredients = '', category = '' } = filter;
                const recipes = await Recipe.find({join: { alias: 'category',  leftJoinAndSelect: { category: 'category' } }, where: `name ILIKE '%${name}%' and description ILIKE '%${description}%'
                  and  ingredients ILIKE '%${ingredients}%' and category.name = '${category}'`, relations: ['category'] ,
                  });

                const rec = await createQueryBuilder('recipe')
                    .innerJoinAndSelect('recipe.category', 'category', "category.name ILIKE ")
                    .where('')

*/
                let { name = '', description = '', ingredients = '', category } = filter;
                let categoryDB = category ? { id: category } : undefined;
                let query = {
                    name: typeorm_1.Like(`%${name}%`),
                    description: typeorm_1.Like(`%${description}%`),
                    ingredients: typeorm_1.Like(`%${ingredients}%`),
                };
                if (category)
                    query = Object.assign(Object.assign({}, query), { category: categoryDB });
                const recipes = yield recipe_1.Recipe.find(query);
                console.log('REC', recipes, category, categoryDB, query);
                return recipes;
            }
            catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })),
        getMyRecipes: auth_1.authenticated((_, { filter = {} }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let { name = '', description = '', ingredients = '', category } = filter;
                let userDb = { id: user.id };
                let categoryDB = category ? { id: category } : undefined;
                let query = {
                    name: typeorm_1.Like(`%${name}%`),
                    description: typeorm_1.Like(`%${description}%`),
                    ingredients: typeorm_1.Like(`%${ingredients}%`),
                    user: userDb
                };
                if (category)
                    query = Object.assign(Object.assign({}, query), { category: categoryDB });
                const recipes = yield recipe_1.Recipe.find(query);
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
            }
            catch (error) {
                throw new Error(`Internal server Error - ${error.message}`);
            }
        })),
        getOneRecipe: auth_1.authenticated((_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let recipe = yield recipe_1.Recipe.findOne({ id });
                return recipe;
            }
            catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        }))
    },
    Mutation: {
        // User Mutations
        signUp: (_, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let { name, email, password } = user;
            const userExist = yield user_1.User.findOne({ email });
            if (userExist) {
                throw new Error('The email already exists');
            }
            try {
                const salt = yield bcryptjs_1.default.genSalt(10);
                let nUser = new user_1.User();
                nUser.name = name || '';
                nUser.password = yield bcryptjs_1.default.hash(password, salt);
                nUser.email = email;
                yield nUser.save();
                return nUser;
            }
            catch (error) {
                console.log(error);
                throw new Error(`Error processing request - ${error.message}`);
            }
        }),
        login: (_, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let { email: userEmail, password: userPass } = user;
            /// verify if user exists
            const userExists = yield user_1.User.findOne({ email: userEmail });
            if (!userExists) {
                throw new Error('Error bad credentials');
            }
            // compare passwords
            let isAuthorized = yield bcryptjs_1.default.compare(userPass, userExists.password);
            if (!isAuthorized) {
                throw new Error('Error bad credentials');
            }
            // generate the token and send
            const token = auth_1.generateToken(userExists, process.env.SECRET || '', '24h');
            return {
                user: userExists,
                token
            };
        }),
        //// category Mutations
        createCategory: auth_1.authenticated((_, { input }) => __awaiter(void 0, void 0, void 0, function* () {
            const { name } = input;
            try {
                const newCateg = new category_1.Category();
                newCateg.name = name;
                yield newCateg.save();
                return newCateg;
            }
            catch (error) {
                console.log(error);
                throw new Error(`Error processing request - ${error.message}`);
            }
        })),
        deleteCategory: auth_1.authenticated((_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const existsCat = yield category_1.Category.findOne({ id });
                if (!existsCat) {
                    throw new Error('Category not exists');
                }
                yield category_1.Category.remove(existsCat);
                return existsCat;
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`);
            }
        })),
        updateCategory: auth_1.authenticated((_, { category }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let { id, name } = category;
                const existsCat = yield category_1.Category.findOne({ id });
                if (existsCat) {
                    yield category_1.Category.update({ id }, { name });
                    return category;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`);
            }
        })),
        // Recipes Mutations
        createRecipe: auth_1.authenticated((_, { recipe }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let { name, description, ingredients, categoryId } = recipe;
            try {
                let userDB = (yield user_1.User.findOne({ id: user.id })) || new user_1.User();
                let catDB = (yield category_1.Category.findOne({ id: categoryId })) || new category_1.Category();
                console.log('ERRER', recipe, userDB, catDB, catDB.id);
                if (catDB.id) {
                    const newRecipe = new recipe_1.Recipe();
                    newRecipe.name = name;
                    newRecipe.description = description;
                    newRecipe.ingredients = ingredients;
                    newRecipe.user = userDB;
                    newRecipe.category = catDB;
                    yield newRecipe.save();
                    return newRecipe;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })),
        updateRecipe: auth_1.authenticated((_, { recipe }) => __awaiter(void 0, void 0, void 0, function* () {
            let { id } = recipe;
            const existsRecipe = yield recipe_1.Recipe.findOne({ id });
            if (existsRecipe) {
                if (recipe.categoryId) {
                    recipe.category = yield category_1.Category.findOne({ id: recipe.categoryId });
                }
                yield recipe_1.Recipe.update({ id }, recipe);
                return yield recipe_1.Recipe.findOne({ id });
            }
            throw new Error('Recipe not exists');
        })),
        deleteRecipe: auth_1.authenticated((_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let existsRecipe = yield recipe_1.Recipe.findOne({ id });
                if (!existsRecipe) {
                    throw new Error('Recipe not exists');
                }
                else {
                    recipe_1.Recipe.remove(existsRecipe);
                    return existsRecipe;
                }
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`);
            }
        }))
    }
};
exports.default = resolvers;

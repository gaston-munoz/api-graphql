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
const auth_1 = require("../auth");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
dotenv_1.default.config();
const resolvers = {
    Query: {
        // User Queries
        users: auth_1.authenticated((_, __, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let users = yield user_1.User.find();
            return users;
        })),
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
            try {
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
            try {
                const userExist = yield user_1.User.findOne({ email });
                if (userExist) {
                    throw new Error('The email already exists');
                }
                if (password.length < 4) {
                    throw new Error('Password must have at least 4 characters');
                }
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
        deleteUser: auth_1.authenticated((_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const userExists = yield user_1.User.findOne({ id });
            if (userExists) {
                yield user_1.User.remove(userExists);
                return true;
            }
            throw new Error('User not exists');
        })),
        updateUser: auth_1.authenticated((_, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = user;
            const userExists = yield user_1.User.findOne({ id });
            if (userExists) {
                yield user_1.User.update({ id }, user);
                return yield user_1.User.findOne({ id });
            }
            throw new Error('User not exists');
        })),
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
                if (recipe.category) {
                    const existsCategory = yield category_1.Category.findOne({ id: Number(recipe.category) });
                    if (!existsCategory)
                        throw new Error('Category not exists');
                    recipe.category = existsCategory;
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

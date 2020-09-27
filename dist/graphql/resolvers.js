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
            console.log('TOKEN', token, user);
            return user;
        }),
        users: (_, __, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let users = yield user_1.User.find();
            return users;
        }),
        // Category Queries
        categories: auth_1.authenticated((_, { filter }) => __awaiter(void 0, void 0, void 0, function* () {
            let filterSearch = filter && filter.name ? filter.name : '';
            const categories = yield category_1.Category.find({ where: `name ILIKE '%${filterSearch}%'` });
            return categories;
        })),
        category: auth_1.authenticated((_, { id }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            return yield category_1.Category.findOne({ id });
        })),
        // Recipes Queries 
        recipes: auth_1.authenticated((_, { filter = {} }) => __awaiter(void 0, void 0, void 0, function* () {
            let { name = '', description = '', ingredients = '', category = '' } = filter;
            const recipes = yield recipe_1.Recipe.find({ where: `name ILIKE '%${name}%' and description ILIKE '%${description}%'
              and ingredients ILIKE '%${ingredients}%'` });
            return recipes;
        })),
        myRecipes: auth_1.authenticated((_, { filter = {} }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            let { id } = user;
            console.log('USER', user, id);
            let { name = '', description = '', ingredients = '', category = '' } = filter;
            /*            const recipes = await Recipe.find({ where: `name ILIKE '%${name}%' AND description ILIKE '%${description}%'
                          AND ingredients ILIKE '%${ingredients}%' and user in (${Number(id)})` });
            */
            const recipes = yield recipe_1.Recipe.find({
                name: typeorm_1.Like(`%${name}%`),
                description: typeorm_1.Like(`%${description}%`),
                ingredients: typeorm_1.Like(`%${ingredients}%`),
                user: id
            });
            return recipes;
        })),
        recipe: auth_1.authenticated((_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            let recipe = yield recipe_1.Recipe.findOne({ id });
            return recipe;
        }))
    },
    Mutation: {
        // User Mutations
        registry: (_, { user }) => __awaiter(void 0, void 0, void 0, function* () {
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
                throw new Error('CODE STATUS 500 - Internal server error');
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
            const token = auth_1.generateToken(userExists, process.env.SECRET || 'TODOSLOSPERROSVANALCIELO', '24h');
            return {
                user: userExists,
                token
            };
        }),
        //// category Mutations
        createCategory: auth_1.authenticated((_, { input }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                const { name, userId } = input;
                try {
                    const newCateg = new category_1.Category();
                    newCateg.name = name;
                    newCateg.userId = userId;
                    yield newCateg.save();
                    return newCateg;
                }
                catch (error) {
                    console.log(error);
                    throw new Error('Status code 500 - Internal server error');
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        })),
        deleteCategory: auth_1.authenticated((_, { id }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                const existsCat = yield category_1.Category.findOne({ id });
                if (!existsCat) {
                    throw new Error('Category not exists');
                }
                yield category_1.Category.remove(existsCat);
                return existsCat;
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        })),
        updateCategory: auth_1.authenticated((_, { category }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                let { id, name, userId } = category;
                const existsCat = yield category_1.Category.findOne({ id });
                if (existsCat) {
                    yield category_1.Category.update({ id }, { name, userId });
                    return category;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        })),
        // Recipes Mutations
        createRecipe: auth_1.authenticated((_, { recipe }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                let { name, description, ingredients, userId, categoryId } = recipe;
                try {
                    const newRecipe = new recipe_1.Recipe();
                    newRecipe.name = name;
                    newRecipe.description = description;
                    newRecipe.ingredients = ingredients;
                    newRecipe.user = userId;
                    newRecipe.categoryId = categoryId;
                    yield newRecipe.save();
                    return newRecipe;
                }
                catch (error) {
                    throw new Error(`Code status 500 - Internal server error - ${error.message}`);
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        })),
        updateRecipe: auth_1.authenticated((_, { recipe }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                let { id, name, description, ingredients, userId, categoryId } = recipe;
                const existsRecipe = yield recipe_1.Recipe.findOne({ id });
                if (existsRecipe) {
                    yield recipe_1.Recipe.update({ id }, recipe);
                    return yield recipe_1.Recipe.findOne({ id });
                }
                throw new Error('Recipe not exists');
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        })),
        deleteRecipe: auth_1.authenticated((_, { id }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
            if (user) {
                let existsRecipe = yield recipe_1.Recipe.findOne({ id });
                if (!existsRecipe) {
                    throw new Error('Recipe not exists');
                }
                else {
                    recipe_1.Recipe.remove(existsRecipe);
                    return existsRecipe;
                }
            }
            else {
                throw new Error('Not authorized to access this resource');
            }
        }))
    }
};
exports.default = resolvers;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs = apollo_server_1.gql `

    # User types

    type User {
        id: ID
        name: String
        email: String
        createdAt: String
    }

    type UserToken {
        user: User
        token: String
    }

    input UserInputUpdate {
        id: ID!
        name: String
        email: String
        password: String
    }

    input UserInput {
        name: String!
        email: String!
        password: String!
    }

    input UserLoginInput {
        email: String
        password: String
    }

    # Categories Type

    type Category {
        id: ID
        name: String
    }

    input NewCategoryInput {
        name: String!
    }

    input updateCategoryInput {
        id: ID!
        name: String!
    }

    input filterCategory {
        name: String
    }

    # Recipe Types

    type Recipe {
        id: ID
        name: String!
        description: String!
        ingredients: String!
        user: User 
        category: Category
    }

    input CreateRecipeInput {
        name: String!
        description: String!
        ingredients: String!
        categoryId: Int!
    }
    
    input UpdateRecipeInput {
        id: ID!
        name: String
        description: String
        ingredients: String
        userId: Int
        category: Int
    }

    input FilterRecipe {
        name: String
        description: String
        ingredients: String
        category: Int
    }


    # main

    type Query {
        # User
        users: [User]

        # Category
        getCategories(filter: filterCategory): [Category] 
        getOneCategory(id: ID!): Category
          # userCategories(userId: ID!): [Categories]

        # Recipe
        getRecipes(filter: FilterRecipe): [Recipe]
        getMyRecipes(filter: FilterRecipe): [Recipe]
        getOneRecipe(id: ID!): Recipe   
    }

    
    type Mutation {
        # User
        signUp(user: UserInput!): User
        login(user: UserLoginInput!): UserToken
        deleteUser(id: ID!): Boolean
        updateUser(user: UserInputUpdate!): User


        # Category
        createCategory(input: NewCategoryInput!): Category
        deleteCategory(id: ID!): Category  
        updateCategory(category: updateCategoryInput!): Category

        # Recipes 

        createRecipe(recipe: CreateRecipeInput!): Recipe
        updateRecipe(recipe: UpdateRecipeInput!): Recipe
        deleteRecipe(id: ID!): Recipe

    }
`;
exports.default = typeDefs;

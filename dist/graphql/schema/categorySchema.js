"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs = apollo_server_1.gql `

    type Category {
        id: ID
        name: String
        userId: Int
    }

    input NewCategoryInput {
        name: String,
        userId: Int
    }


    type QueryCategory {
        categories: [Category] 
    }

    type MutationCategory {
        newCategory(input: NewCategoryInput!): Category 
    }


`;
exports.default = typeDefs;

const schema = `
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

    type Query {
        # User
        users: [User]
    }    

    type Mutation {
        # User
        signUp(user: UserInput!): User
        login(user: UserLoginInput!): UserToken
        deleteUser(id: ID!): Boolean
        updateUser(user: UserInputUpdate!): User
    }
    `;

export default schema;

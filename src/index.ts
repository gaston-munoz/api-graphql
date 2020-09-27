import 'reflect-metadata';
import signale from 'signale';
import dotenv from 'dotenv';
import  { ApolloServer } from 'apollo-server';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
// import resolversCategory from './graphql/resolvers/categoryResolver';
// import typeDefsCategory from './graphql/schema/categorySchema';
import { connect } from './config/typeorm';
import jwt from 'jsonwebtoken';
dotenv.config({ path: '../.env'});
connect();
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let token = null;
        let user = null;    
        try {
            token = req.headers.authorization || '';
            if(token)
                user = jwt.verify(token, process.env.SECRET || '')

        } catch (error) {
            console.log(error.message);
        }

        return  { user }
    }
});

// Starting the server

server.listen(5000)
    .then(({url}) => {
        signale.success(`Server listening on ${url}`);
    })
import 'reflect-metadata';
import signale from 'signale';
import dotenv from 'dotenv';
import  { ApolloServer } from 'apollo-server';
import { resolvers, typeDefs } from './graphql'
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
            token = req.headers.authorization?.split(' ')[1];
            if(token)
                user = jwt.verify(token, process.env.SECRET || '')
        } catch (error) {
            console.log(error.message);
        }

        return  { user }
    }
});

// Port

const port: number | string = process.env.PORT || 4000; 

// Start server

server.listen(port)
    .then(({url}) => {
        signale.success(`Server listening on ${url}`);
    })
    
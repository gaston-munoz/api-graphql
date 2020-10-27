import { User } from '../user.model';
import { Category } from '../../category/category.model';
import { Recipe } from '../../recipe/recipe.model';
import bcrypt  from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticated, generateToken } from '../../../../auth'
import dotenv from 'dotenv';
import { FindOperator, Like } from 'typeorm';
import { validateEmail } from '../../../../utils'
import {
  ArgUser,
  IUserModel,
  UserID,
  UserLogin,
  UserUpt,
  DBUser 
} from './interfaces'
dotenv.config();


const resolvers = {
    Query:{

         // User Queries
        users: authenticated(async (_: any, __: any, { user }: ArgUser) => {
            let users = await User.find();

            return users;
        })
    },

    Mutation: {

        // User Mutations
        signUp: async (_: any, { user }: ArgUser ) =>{
            let { name, email, password } : IUserModel = user;
            try {
            const userExist: DBUser = await User.findOne({ email });
            if(userExist) {
                throw new Error('The email already exists');
            }
            if(password.length < 4) { 
                throw new Error('Password must have at least 4 characters');
            } 
            if(!validateEmail(email)) {
                throw new Error('wrong email format');
            }
            
         
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
        deleteUser: authenticated(async(_:any, { id }: UserID) => {
            const userExists = await User.findOne({ id });

            if(userExists) {
                await User.remove(userExists);
                return true;
            }    

            throw new Error('User not exists');
        }),
        updateUser: authenticated(async(_:any, { user }: UserUpt) => {
            const { id } = user;
            const userExists = await User.findOne({ id });

            if(userExists) {
                await User.update({ id }, user);
                return await User.findOne({ id });
            }    

            throw new Error('User not exists');
        }),
    }
}   

export default resolvers;  
    
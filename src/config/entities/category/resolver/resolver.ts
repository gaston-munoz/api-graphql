import { Category } from '../category.model';
import { authenticated } from '../../../../auth'
import dotenv from 'dotenv';
import {
  CategoryArg,
  CategoryId,
  FilterCategoryArg,
  ICategoryArg,

} from './interfaces'
dotenv.config();

const resolvers = {
    Query:{

        getCategories: authenticated(async (_: any, { filter }: FilterCategoryArg) =>{
            try {
                let filterSearch = filter && filter.name ? filter.name : '';
                const categories = await Category.find({ where: `Category.name ILIKE '%${filterSearch}%'` });
       
                return categories;
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        }),
        getOneCategory: authenticated(async (_: any, { id }: CategoryId) => {
            try {
                return await Category.findOne({ id });
            } catch (error) {
                throw new Error(`Error processing request - ${error.message}`);
            }
        })
    },
    Mutation: {

        createCategory: authenticated(async (_: any, { input }: ICategoryArg) => {
                const { name } = input;
                try {              
                    const newCateg = new Category();
                    newCateg.name = name;
                    await newCateg.save();
    
                    return newCateg;
                } catch (error) {
                    console.log(error);
                    throw new Error(`Error processing request - ${error.message}`);
                }
        }),
        deleteCategory: authenticated(async (_: any, { id }: CategoryId) => {
            try {
                const existsCat = await Category.findOne({id});

                if(!existsCat) {
                    throw new Error('Category not exists');
                }
                await Category.remove (existsCat);
    
                return existsCat;
            }
            catch (err) {
                throw new Error(`Error processing request - ${err.message}`, );
            }
        }),
        updateCategory: authenticated(async (_: any, { category }: CategoryArg) => {
            try {
                let { id, name } = category;

                const existsCat = await Category.findOne({ id }); 
                if(existsCat){
                   await Category.update({ id }, { name });
                   
                   return category;
                }
                else {
                    throw new Error('Category not exists');
                }
            }
            catch(err) {
                throw new Error(`Error processing request - ${err.message}`);
            }
        })
    }
}

export default resolvers;

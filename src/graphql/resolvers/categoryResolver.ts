import { Category } from '../../config/entity/category';

interface ICategoryArg {
    input: CategoryData
}

interface CategoryData {
    id?:number,
    name: string,
    userId: number
}

const resolvers = {
    QueryCategory: {
        categories: async () =>{
            const categories = await Category.find();

            return categories;
        }
    },
    MutationCategory: {
        createCategory: async (_: any, { input }: ICategoryArg) => {
            const { name, userId } = input;

            const newCateg = new Category();
            newCateg.name = name;
            newCateg.userId = userId;
            await newCateg.save();

            return newCateg;
        }

    }
}


export default resolvers;
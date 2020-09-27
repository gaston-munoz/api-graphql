import jwt from 'jsonwebtoken';

export const authenticated =  (next: any) => async (root: any, args: any, ctx: any, info: any) => {
    if(!ctx.user) {
        throw new Error('Not authorized to access this resource');
    }
   
    return await next(root, args, ctx, info)
}

export const generateToken = (user: any, secret: string, expiresIn: string) => {
    let { id, name, email } = user;

    return jwt.sign({ id,name, email }, secret, { expiresIn });
}

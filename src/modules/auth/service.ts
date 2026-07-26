import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterUserPayload } from "./interface";
import config from "../../config";


const registerUserIntoDB = async (payload: RegisterUserPayload) =>{
     const {name, email, password, phone, profilePhoto} = payload;
        const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    // if (isUserExist) {
    //     throw new Error("User with this email already exists");
    // }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            profile: {
                create: {
                    profilePhoto
                }
            }
        }
    });

    // await prisma.profile.create({
    //     data:{
    //         userId: createdUser.id,
    //         profilePhoto
    //     }
    // })

    const user = await prisma.user.findUnique({
        where: { 
            id: createdUser.id,
            email: createdUser.email || email
         },
         omit: {
            password: true
         }
    })
    return user;
};




export const authService = {
    registerUserIntoDB,
}
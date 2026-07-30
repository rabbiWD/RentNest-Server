import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
const registerUser = async (payload) => {
    const { name, email, password, role, phone, profilePhoto } = payload;
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });
    // if (isUserExist) {
    //     throw new Error("User with this email already exists");
    // }
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            profile: {
                create: {
                    profilePhoto
                }
            }
        }
    });
    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return user;
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    });
    if (user.status === "BANNED") {
        throw new Error("Your account has been banned. Please contact support.");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
    };
};
const getMyProfile = async (userId) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return user;
};
const updateMyProfile = async (userId, payload) => {
    const { name, phone, bio, profilePhoto } = payload;
    const result = await prisma.$transaction(async (tx) => {
        if (name || phone) {
            await tx.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(phone && { phone }),
                },
            });
        }
        if (bio !== undefined || profilePhoto !== undefined) {
            await tx.profile.upsert({
                where: { userId },
                update: {
                    ...(bio !== undefined && { bio }),
                    ...(profilePhoto !== undefined && { profilePhoto }),
                },
                create: {
                    userId,
                    bio,
                    profilePhoto,
                },
            });
        }
        return await tx.user.findUniqueOrThrow({
            where: { id: userId },
            omit: { password: true },
            include: { profile: true },
        });
    });
    return result;
};
export const authService = {
    registerUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
};

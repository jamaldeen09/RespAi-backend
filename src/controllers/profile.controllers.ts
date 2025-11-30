import { Request } from "express";
import { ConfiguredRequest, ConfiguredResponse } from "../types/api.types.js";
import { readOperation, writeOperation } from "../services/cache.services.js";
import { IUserQuery, User } from "../models/User.js";
import { UserProfile } from "../types/resPayload.types";
import { getUserProfilePayload } from "../services/auth.services.js";

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const getProfile = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract the requesting user's id attached to request ** \\
    const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

    // ** Extract the user from cache (possibly) ** \\
    const cachedUser = readOperation(`user:${userId}`);
    try {
        if (!cachedUser) {
            // ** Cache miss ** \\ 

            // ** Checks if the user requesting exists ** \\
            const user: IUserQuery = await User.findById(userId)
                .lean<IUserQuery>()
                .select("_id fullname email avatar credits plan role createdAt updatedAt enableAiAnalysis creditRefillDate");

            if (!user)
                return res.status(404).json({
                    success: false,
                    message: "Account was not found",
                    error: {
                        code: "NOT_FOUND",
                        statusCode: 404,
                    }
                });

            // ** Cache the user ** \\
            writeOperation(`user:${user._id.toString()}`, getUserProfilePayload(user));

            // ** Return a success response to the client containing necessary data ** \\
            return res.status(200).json({
                success: true,
                message: "Authentication data successfully fetched",
                data: {
                    profile: user,
                },
            });
        } else {
            // ** Cache hit ** \\
            const parsedCachedUser: UserProfile = JSON.parse(cachedUser);

            // ** Return a success response to the client containing necessary data ** \\
            return res.status(200).json({
                success: true,
                message: "Profile information successfully fetched",
                data: {
                    profile: parsedCachedUser,
                },
            });
        }
    } catch (err) {
        console.error(`Error occured in "getProfile" controller in file "profile.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your profile information, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        })
    }
};


/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const editProfile = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract userId attached to request ** \\
    const userId = (req as ConfiguredRequest).accessTokenPayload.userId;

    // ** Extract the validated data being used for the update attached to request ** \\
    const {
        firstname,
        lastname,
        avatar
    } = ((req as ConfiguredRequest).data as {
        firstname?: string;
        lastname?: string;
        avatar?: string;
    });

    try {
        // ** Check if the user exists before updating their profile ** \\
        const user = await User.findById(userId).lean<IUserQuery>().select("fullname _id avatar");
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });

        // ** Extract necessary name parts ** \\
        const nameParts = user.fullname.split(' ');
        const currentFirstname = nameParts[0] || '';
        const currentLastname = nameParts.slice(1).join(' ') || '';

        // ** New first and last names ** \\
        const newFirstname = (`${(firstname || currentFirstname).charAt(0).toUpperCase() + (firstname || currentFirstname).slice(1)}`).trim();
        const newLastname = (`${(lastname || currentLastname).charAt(0).toUpperCase() + (lastname || currentLastname).slice(1)}`).trim();

        // ** Atomically update user ** \\
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $set: {
                fullname: `${newFirstname} ${newLastname}`.trim(),
                avatar: avatar || user.avatar ||
                    "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg"
            },
        }, {
            new: true,
            select: 'fullname avatar email credits plan createdAt updatedAt enableAiAnalysis creditRefillDate',
        }).lean<IUserQuery>()


        if (!updatedUser)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });

        // ** Update the user in cache ** \\
        writeOperation(`user:${updatedUser._id.toString()}`, getUserProfilePayload(updatedUser));

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Profile has been updated successfully",
        })
    } catch (err) {
        console.error(`Error occured in "editProfile" controller in file "profile.controllers.ts": ${err}`);
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to update your profile information, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        })
    }
}
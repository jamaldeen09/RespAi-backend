import { Request } from "express"
import { ConfiguredRequest, ConfiguredResponse, TokenPayload } from "../types/api.types.js"
import { IUserDocument, IUserQuery, User } from "../models/User.js";
import { LoginCredentials, SignupCredentials } from "../types/reqPayload.types.js";
import bcrypt from "bcrypt";
import { cacheUser, createToken, getUserProfilePayload } from "../services/auth.services.js";
import { envData } from "../config/env.config.js";
import { deleteOperation, readOperation, writeOperation } from "../services/cache.services.js";
import { UserProfile } from "../types/resPayload.types.js";

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const signup = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract validated credentials attached to request ** \\
    const signupCredentials = (req as ConfiguredRequest).data as SignupCredentials;
    try {
        // ** Check if the user's account already exists ** \\
        const user = await User.exists({ email: signupCredentials.email });
        if (user)
            return res.status(400).json({
                success: false,
                message: "Account already exists, please login",
                error: {
                    code: "AUTHENTICATION_ERROR",
                    statusCode: 400,
                }
            });

        // ** Hash requesting user's password for storage ** \\
        const hashedPassword: string = await bcrypt.hash(signupCredentials.password, 12);
        const newUser = await User.create({
            fullname: `${signupCredentials.firstname.charAt(0).toUpperCase() + signupCredentials.firstname.slice(1)
                } ${signupCredentials.lastname.charAt(0).toUpperCase() + signupCredentials.lastname.slice(1)
                }`,
            email: signupCredentials.email,
            password: hashedPassword,
            creditRefillDate: new Date(),
        });

        // ** Create tokens for the user ** \\

        // ** Access token ** \\
        const accessToken = createToken("accessToken", {
            userId: newUser._id.toString(),
            fullname: newUser.fullname,
        } as TokenPayload["accessToken"]);

        // ** Refresh token ** \\
        const refreshToken = createToken("refreshToken", {
            userId: newUser._id.toString(),
        } as TokenPayload["refreshToken"]);

        // ** Store the user in cache to simulate a session ** \\
        cacheUser(newUser as unknown as IUserDocument);

        // ** Return a success response to the client containing necessary data ** \\
        const data = {
            auth: {
                userId: newUser._id.toString(),
                fullname: newUser.fullname,
            },
            tokens: {
                accessToken,
                refreshToken
            }
        };

        return res.status(201).json({
            success: true,
            message: "Account successfully created",
            data,
        });
    } catch (err) {
        console.error(`A server error occured in "signup controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to create your account, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<void | ConfiguredResponse>}
*/
export const googleCallbackHandler = async (req: Request, res: ConfiguredResponse): Promise<void> => {
    // ** At this point done(null, user) would have attached the users account to req.user we just extract it and use it to create required tokens ** \\
    const user: IUserQuery = req.user as IUserQuery;
    try {
        // ** Extra check just in case ** \\
        if (!user)
            return res.redirect(`${envData.FRONTEND_URL}/oauth`);

        // ** Create tokens for the user ** \\
        // ** Access token ** \\
        const accessToken = createToken("accessToken", {
            userId: user._id.toString(),
            fullname: user.fullname,
        } as TokenPayload["accessToken"]);

        // ** Refresh token ** \\
        const refreshToken = createToken("refreshToken", {
            userId: user._id.toString(),
        } as TokenPayload["refreshToken"]);

        const encodedData = {
            accessToken: encodeURIComponent(accessToken),
            refreshToken: encodeURIComponent(refreshToken),
            userId: encodeURIComponent(user._id.toString()),
            fullname: encodeURIComponent(user.fullname),
        }
        const redirectUrl = `${envData.FRONTEND_URL}/oauth?accessToken=${encodedData.accessToken}&refreshToken=${encodedData.refreshToken}&userId=${encodedData.userId}&fullname=${encodedData.fullname}`;
        return res.redirect(redirectUrl);
    } catch (err) {
        console.error(`A server error occured in "googleCallbackHandler controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.redirect(`${envData.FRONTEND_URL}/oauth`);
    }
}

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const login = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract validated credentials attached to request ** \\
    const loginCredentials = (req as ConfiguredRequest).data as LoginCredentials
    try {
        // ** Check if the users account already exists ** \\
        const user: IUserQuery = await User.findOne({ email: loginCredentials.email })
            .lean<IUserQuery>()
            .select("_id fullname email credits plan createdAt updatedAt password oAuthProviders enableAiAnalysis creditRefillDate");

        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });

        // ** Check if the user is an oAuth user ** \\
        const isOauthUser = user.oAuthProviders.length > 0 || !user.password;
        if (isOauthUser)
            return res.status(400).json({
                success: false,
                message: "This account was created with Google. Please use 'Continue with Google' to sign in",
                error: {
                    code: "AUTHENTICATION_ERROR",
                    statusCode: 400,
                    details: {
                        oAuthProvider: user.oAuthProviders[0].provider,
                    }
                }
            });

        // ** Validate the users credentials ** \\
        const isPasswordValid = await bcrypt.compare(loginCredentials.password, user.password! || "");

        if (!isPasswordValid)
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                error: {
                    code: "AUTHENTICATION_ERROR",
                    statusCode: 400,
                }
            });

        // ** Create tokens for the user ** \\
        // ** Access token ** \\
        const accessToken = createToken("accessToken", {
            userId: user._id.toString(),
            fullname: user.fullname,
        } as TokenPayload["accessToken"]);

        // ** Refresh token ** \\
        const refreshToken = createToken("refreshToken", {
            userId: user._id.toString(),
        } as TokenPayload["refreshToken"]);


        // ** Store the user in cache ** \\
        cacheUser(user);

        // ** Return a success response to the client containing necessary data ** \\
        const data = {
            auth: {
                userId: user._id.toString(),
                fullname: user.fullname,
            },
            tokens: {
                accessToken,
                refreshToken
            }
        };

        return res.status(200).json({
            success: true,
            message: "Account successfully logged into",
            data,
        });
    } catch (err) {
        console.error(`A server error occured in "login controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to login your account, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const logout = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract user's id attached to request (from access token payload) ** \\
    const userId = ((req as ConfiguredRequest).accessTokenPayload).userId;
    try {
        // ** Checks if the user requesting to log out exists ** \\
        const user = await User.exists({ _id: userId });
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });

        // ** If the user was found delete the user from cache ** \\
        deleteOperation("cacheKey", `user:${user._id}`);

        // ** Return a success response ** \\
        return res.status(200).json({
            success: true,
            message: "Successfully logged out",
        });
    } catch (err) {
        console.error(`A server error occured in "logout controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to log out of your account, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
}


/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const refresh = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    const userId = ((req as ConfiguredRequest).refreshTokenPayload).userId;
    try {
        // ** Checks if the user requesting to log out exists ** \\
        const user: IUserQuery = await User.findById(userId).lean<IUserQuery>().select("_id fullname")
        if (!user)
            return res.status(404).json({
                success: false,
                message: "Account was not found",
                error: {
                    code: "NOT_FOUND",
                    statusCode: 404,
                }
            });

        // ** Generate new access token ** \\
        const accessToken = createToken("accessToken", {
            userId: user._id.toString(),
            fullname: user.fullname,
        } as TokenPayload["accessToken"]);

        // ** Return a success response to the client containing necessary data ** \\
        return res.status(200).json({
            success: true,
            message: "Token successfully refreshed",
            data: { accessToken },
        });
    } catch (err) {
        console.error(`A server error occured in "refresh controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to refresh your token, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};

/** 
 @param {Request} req - Http request that contains all data about a requesting client
 @param {Response} res - Http response, it contains all data needed when returning a response after processing a clients request
 @returns {Promise<ConfiguredResponse>}
*/
export const getAuthState = async (req: Request, res: ConfiguredResponse): Promise<ConfiguredResponse> => {
    // ** Extract user's id attached to request (from access token payload) ** \\
    const userId = ((req as ConfiguredRequest).accessTokenPayload).userId;
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
                    authState: {
                        userId: user._id.toString(),
                        fullname: user.fullname,
                    }
                },
            });
        } else {
            // ** Cache hit ** \\
            const parsedCachedUser: UserProfile = JSON.parse(cachedUser);

            // ** Return a success response to the client containing necessary data ** \\
            return res.status(200).json({
                success: true,
                message: "Authentication data successfully fetched",
                data: {
                    authState: {
                        userId: parsedCachedUser._id.toString(),
                        fullname: parsedCachedUser.fullname,
                    }
                },
            });
        }
    } catch (err) {
        console.error(`A server error occured in "getAuthState controller" in file auth.controllers.ts: ${err}`);

        // ** Error handler ** \\
        return res.status(500).json({
            success: false,
            message: "A server error occured while trying to fetch your authentication data, please try again shortly",
            error: {
                code: "INTERNAL_SERVER_ERROR",
                statusCode: 500,
            },
        });
    }
};




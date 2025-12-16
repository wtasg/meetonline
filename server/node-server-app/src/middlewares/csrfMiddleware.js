import { doubleCsrf } from "csrf-csrf";

const {
    invalidCsrfTokenError, // This is the error thrown when the token is invalid
    generateCsrfToken, // This is the function to generate a new token
    validateRequest, // This is the function to validate the request
    doubleCsrfProtection, // This is the middleware to use
} = doubleCsrf({
    getSecret: () => {
        return "somerandomsecretthatshouldbelongerandstoredinenv";
    },
    getSessionIdentifier: (req) => req.ip || "anonymous",
    cookieName: "x-csrf-token", // The name of the cookie to be used, recommend using x-csrf-token
    cookieOptions: {
        httpOnly: true,
        sameSite: "strict", // Recommend using strict
        path: "/",
        secure: true,
    },
    size: 64, // The size of the generated token in bits
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be checked.
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"], // A function that returns the token from the request
});

export {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection,
};

const jwt =
    require("jsonwebtoken");


function authMiddleware(
    req,
    res,
    next
) {

    try {

        // Get Authorization header

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res
                .status(401)
                .json({

                    message:
                        "No token provided",

                });

        }


        // Expected:
        // Bearer eyJhbGci...

        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res
                .status(401)
                .json({

                    message:
                        "Invalid token",

                });

        }


        // Verify JWT

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store logged-in user id

        req.userId =
            decoded.userId;


        // Continue to route

        next();


    } catch (error) {

        return res
            .status(401)
            .json({

                message:
                    "Invalid or expired token",

            });

    }

}


module.exports =
    authMiddleware;
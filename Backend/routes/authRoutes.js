const express =
    require("express");

const bcrypt =
    require("bcryptjs");

const jwt =
    require("jsonwebtoken");


const User =
    require("../models/User");

const Task =
    require("../models/Task");

const authMiddleware =
    require("../middleware/authMiddleware");


const router =
    express.Router();


// =================================
// REGISTER
// =================================

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
            } = req.body;


            // Check fields

            if (
                !name ||
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Please fill all required fields",

                    });

            }


            // Password length

            if (
                password.length < 6
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Password must be at least 6 characters",

                    });

            }


            // Check existing user

            const existingUser =
                await User.findOne({
                    email: email,
                });


            if (existingUser) {

                return res
                    .status(400)
                    .json({

                        message:
                            "User already exists",

                    });

            }


            // Hash password

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // Create user

            const newUser =
                new User({

                    name:
                        name,

                    email:
                        email,

                    password:
                        hashedPassword,

                });


            // Save user

            const savedUser =
                await newUser.save();


            res
                .status(201)
                .json({

                    message:
                        "User registered successfully",

                    user: {

                        _id:
                            savedUser._id,

                        name:
                            savedUser.name,

                        email:
                            savedUser.email,

                        role:
                            savedUser.role,

                        location:
                            savedUser.location,

                        preferences:
                            savedUser.preferences,

                        createdAt:
                            savedUser.createdAt,

                    },

                });


        } catch (error) {

            console.log(
                "REGISTER ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Server error",

                });

        }

    }
);


// =================================
// LOGIN
// =================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password,
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Please enter email and password",

                    });

            }


            // Find user

            const user =
                await User.findOne({
                    email: email,
                });


            if (!user) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Invalid email or password",

                    });

            }


            // Check password

            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordCorrect) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Invalid email or password",

                    });

            }


            // Create JWT

            const token =
                jwt.sign(

                    {
                        userId:
                            user._id,
                    },

                    process.env
                        .JWT_SECRET,

                    {
                        expiresIn:
                            "7d",
                    }

                );


            // Return user

            res.json({

                message:
                    "Login successful",

                token:
                    token,

                user: {

                    _id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    location:
                        user.location,

                    preferences:
                        user.preferences,

                    createdAt:
                        user.createdAt,

                },

            });


        } catch (error) {

            console.log(
                "LOGIN ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Server error",

                });

        }

    }
);


// =================================
// GET PROFILE
// =================================

router.get(
    "/profile",

    authMiddleware,

    async (req, res) => {

        try {

            const user =
                await User
                    .findById(
                        req.userId
                    )
                    .select(
                        "-password"
                    );


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found",

                    });

            }


            res.json(user);


        } catch (error) {

            console.log(
                "GET PROFILE ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not get profile",

                });

        }

    }
);


// =================================
// UPDATE PROFILE
// =================================

router.put(
    "/profile",

    authMiddleware,

    async (req, res) => {

        try {

            const {
                name,
                role,
                location,
            } = req.body;


            if (!name) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Name is required",

                    });

            }


            const user =
                await User
                    .findByIdAndUpdate(

                        req.userId,

                        {
                            name:
                                name,

                            role:
                                role,

                            location:
                                location,
                        },

                        {
                            returnDocument:
                                "after",

                            runValidators:
                                true,
                        }

                    )
                    .select(
                        "-password"
                    );


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found",

                    });

            }


            res.json(user);


        } catch (error) {

            console.log(
                "UPDATE PROFILE ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not update profile",

                });

        }

    }
);


// =================================
// UPDATE PREFERENCES
// =================================

router.put(
    "/preferences",

    authMiddleware,

    async (req, res) => {

        try {

            const {
                emailNotifications,
                taskReminders,
                weeklyReport,
            } = req.body;


            const user =
                await User
                    .findByIdAndUpdate(

                        req.userId,

                        {
                            preferences: {

                                emailNotifications:
                                    emailNotifications,

                                taskReminders:
                                    taskReminders,

                                weeklyReport:
                                    weeklyReport,

                            },
                        },

                        {
                            returnDocument:
                                "after",

                            runValidators:
                                true,
                        }

                    )
                    .select(
                        "-password"
                    );


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found",

                    });

            }


            res.json(user);


        } catch (error) {

            console.log(
                "PREFERENCES ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not update preferences",

                });

        }

    }
);


// =================================
// CHANGE PASSWORD
// =================================

router.put(
    "/change-password",

    authMiddleware,

    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword,
            } = req.body;


            // Check fields

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Both passwords are required",

                    });

            }


            // Password length

            if (
                newPassword.length < 6
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "New password must be at least 6 characters",

                    });

            }


            // Find user

            const user =
                await User.findById(
                    req.userId
                );


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found",

                    });

            }


            // Check current password

            const passwordCorrect =
                await bcrypt.compare(

                    currentPassword,

                    user.password

                );


            if (!passwordCorrect) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Current password is incorrect",

                    });

            }


            // Hash new password

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            // Update password

            user.password =
                hashedPassword;


            await user.save();


            res.json({

                message:
                    "Password changed successfully",

            });


        } catch (error) {

            console.log(
                "CHANGE PASSWORD ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not change password",

                });

        }

    }
);


// =================================
// DELETE ACCOUNT
// =================================

router.delete(
    "/account",

    authMiddleware,

    async (req, res) => {

        try {

            // Find user

            const user =
                await User.findById(
                    req.userId
                );


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found",

                    });

            }


            // Delete all tasks
            // belonging to this user

            await Task.deleteMany({

                user:
                    req.userId,

            });


            // Delete user

            await User
                .findByIdAndDelete(
                    req.userId
                );


            res.json({

                message:
                    "Account deleted successfully",

            });


        } catch (error) {

            console.log(
                "DELETE ACCOUNT ERROR:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Could not delete account",

                });

        }

    }
);


// =================================
// EXPORT
// =================================

module.exports = router;
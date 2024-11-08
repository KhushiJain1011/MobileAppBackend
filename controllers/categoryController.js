const Category = require("../models/categoryModel");

// ADD CATEGORY:
module.exports.createCategory = async (req, res) => {
    try {
        const { name, type, image } = req.body;

        const category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            })
        }

        const newCategory = new Category({
            name,
            type,
            image
        })
        await newCategory.save();

        return res.status(201).json({
            success: true,
            message: "Category added successfully",
            newCategory
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// FETCH CATEGORIES: 
module.exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        if (categories.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No Categories"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Categories fetched",
            categories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Edit Category: 
module.exports.EditCategory = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File size too large.. Maximum size is 1MB only."
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: "Error uploading image",
                error: err
            })
        }
        try {
            const { id } = req.user;

            // const { userId } = req.params
            // console.log("user id: ", userId);

            // const user = await User.findById(userId);
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File not provided"
                })
            }

            category.image = {
                key: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
            await category.save();

            // console.log("user profile image: ", user.profileImg);

            return res.status(200).json({
                success: true,
                message: "category edited..",
                category
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    })
}
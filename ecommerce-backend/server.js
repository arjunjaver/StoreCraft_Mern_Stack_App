const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const Product = require("./models/product"); 
const Brand = require("./models/brand");
const Category = require("./models/category");
require("dotenv").config(); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


// MongoDB connection string
const MONGO_URL = process.env.MONGO_URI;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => {
    console.error("Error connecting to MongoDB: ", error);
    process.exit(1);
  });
// Routes

// Add a Product
app.post("/api/products", async (req, res) => {
  try {
    const { productName, brandName, category, price, imageURL } = req.body;

    // Validate input
    if (!productName || !brandName || !category || !price || !imageURL) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create a new product and save to the database
    const product = new Product({
      productName,
      brandName,
      category,
      price,
      imageURL,
    });
    await product.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const productID = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productID);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { productName, brandName, category, price, imageURL } = req.body;
    const productID = req.params.id;

    // Check if all fields are provided
    if (!productName || !brandName || !category || !price || !imageURL) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find the product and update it
    const updatedProduct = await Product.findByIdAndUpdate(
      productID,
      { productName, brandName, category, price, imageURL },
      { new: true } // This option returns the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a Brand
app.post("/api/brands", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    const newBrand = new Brand({ name });
    await newBrand.save();

    res.status(201).json({ message: "Brand added successfully", newBrand });
  } catch (error) {
    console.error("Error adding brand:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Brands
app.get("/api/brands", async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete Brand
app.delete("/api/brands/:id", async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);

    if (!deletedBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update Brand
app.put("/api/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    // Find the existing brand
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const oldBrandName = existingBrand.name; // Store the old name before updating

    // Update the brand in the database
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    // Now update all products that have the old brand name
    const updateResult = await Product.updateMany(
      { brandName: oldBrandName }, // Match products with old brand name
      { $set: { brandName: updatedBrand.name } } // Update to new brand name
    );

    console.log(`Products updated: ${updateResult.modifiedCount}`);

    res.json({
      message: "Brand updated successfully, and associated products updated",
      updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a Category
app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    res
      .status(201)
      .json({ message: "Category added successfully", newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete Category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update a Category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Find the existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update products that have this category
    await Product.updateMany(
      { category: existingCategory.name },
      { category: name }
    );

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

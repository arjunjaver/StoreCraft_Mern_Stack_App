import React, { useState, useEffect } from "react";
import "./addProduct.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AddProduct(props) {
  const [formData, setFormData] = useState({
    productName: "",
    brandName: "",
    category: "",
    price: "",
    imageURL: "",
  });

  const [newCategory, setNewCategory] = useState(""); // State for category input
  const [newBrand, setNewBrand] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await fetch(`${process.env.REACT_APP_API_URL}/api/brands`);
        const categoryRes = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`);

        const brandsData = await brandRes.json();
        const categoriesData = await categoryRes.json();

        if (brandRes.ok) setBrands(brandsData);
        if (categoryRes.ok) setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Product added successfully!",
        });

        setFormData({
          productName: "",
          brandName: "",
          category: "",
          price: "",
          imageURL: "",
        }); 
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.error || "An error occurred.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add product.",
      });
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Category name is required!",
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Category added successfully!",
        });

        setCategories([...categories, data.newCategory]); 
        setNewCategory(""); 
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.error || "An error occurred.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add category.",
      });
    }
  };

  const handleSubmitBrand = async (e) => {
    e.preventDefault();

    if (!newBrand.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Brand name is required!",
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newBrand }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Brand added successfully!",
        });

        setBrands([...brands, data.newBrand]); 
        setNewBrand(""); 
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.error || "An error occurred.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add brand.",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/categories/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setCategories(categories.filter((category) => category._id !== id));
          Swal.fire(
            "Deleted!",
            "Brand has been removed successfully.",
            "success"
          );
        }
      }
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleDeleteBrand = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/brands/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setBrands(brands.filter((brand) => brand._id !== id));
          Swal.fire(
            "Deleted!",
            "Brand has been removed successfully.",
            "success"
          );
        }
      }
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  

  const handleEditCategory = async (category) => {
    const { value: newCategoryName } = await Swal.fire({
      title: "Edit Category",
      input: "text",
      inputLabel: "Enter new category name",
      inputValue: category.name,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: (value) => {
        if (!value.trim()) {
          Swal.showValidationMessage("Category name cannot be empty!");
        }
        return value;
      },
    });

    if (newCategoryName) {
      updateCategory(category._id, newCategoryName);
    }
  };

  const updateCategory = async (categoryId, newCategoryName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories/${categoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategoryName }),
        }
      );

      if (response.ok) {
        setCategories((categories) =>
          categories.map((cat) =>
            cat._id === categoryId ? { ...cat, name: newCategoryName } : cat
          )
        );
        Swal.fire("Success!", "Category updated successfully!", "success");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to update category.", "error");
    }
  };

  const handleEditBrand = async (brand) => {
    const { value: newBrandName } = await Swal.fire({
      title: "Edit Brand",
      input: "text",
      inputLabel: "Enter new brand name",
      inputValue: brand.name,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: (value) => {
        if (!value.trim()) {
          Swal.showValidationMessage("Brand name cannot be empty!");
        }
        return value;
      },
    });

    if (newBrandName) {
      updateBrand(brand._id, newBrandName);
    }
  };

  const updateBrand = async (brandId, newBrandName) => {
    console.log("Updating brand:", brandId, newBrandName); 

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/brands/${brandId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newBrandName }),
        }
      );

      console.log("Response status:", response.status); 

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData); 
        Swal.fire(
          "Error!",
          errorData.message || "Failed to update brand.",
          "error"
        );
        return;
      }

      const updatedBrand = await response.json(); 
      console.log("Updated brand response:", updatedBrand); 

      setBrands((brands) =>
        brands.map((br) =>
          br._id === brandId ? { ...br, name: newBrandName } : br
        )
      );

      Swal.fire("Success!", "Brand updated successfully!", "success");
    } catch (error) {
      console.error("Network error:", error);
      Swal.fire(
        "Error!",
        "Failed to update brand. Check the console for details.",
        "error"
      );
    }
  };

  return (
    <>
      <div
        className="container"
        style={{ color: props.mode === "dark" ? "white" : "black" }}
      >
        <div className="left-half">
          <div
            className="addProduct"
            style={{
              backgroundColor: props.mode === "dark" ? "#363535" : "white",
              boxShadow:
                props.mode === "dark"
                  ? "0 0 10px 2px white"
                  : "0 0 10px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 className="my-5">
              <center>Add Product</center>
            </h1>
            <form className="add-product form" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Product Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  value={formData.productName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="brandName" className="form-label">
                  Brand
                </label>
                <select
                  className="form-select"
                  id="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  className="form-select "
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="imageURL" className="form-label">
                  ImageURL
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="imageURL"
                  value={formData.imageURL}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>

        <div className="right-half">
          <div
            className="addCategory"
            style={{
              backgroundColor: props.mode === "dark" ? "#363535" : "white",
              boxShadow:
                props.mode === "dark"
                  ? "0 0 10px 2px white"
                  : "0 0 10px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 className="my-5">
              <center>Add Category</center>
            </h1>
            <form
              style={{ display: "grid", placeItems: "center" }}
              onSubmit={handleSubmitCategory}
            >
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Category Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="CategoryName"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>

          <div
            className="addBrand"
            style={{
              backgroundColor: props.mode === "dark" ? "#363535" : "white",
              boxShadow:
                props.mode === "dark"
                  ? "0 0 10px 2px white"
                  : "0 0 10px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 className="my-5">
              <center>Add Brand</center>
            </h1>
            <form
              style={{ display: "grid", placeItems: "center" }}
              onSubmit={handleSubmitBrand}
            >
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Brand Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="addBrandName"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                />
              </div>

              <div className="btn-container">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="categoryList">
          <h2>Categories</h2>
          <table
            className="table table-bordered"
            style={{
              backgroundColor: props.mode === "dark" ? "#424242" : "white",
              color: props.mode === "dark" ? "white" : "black",
              border:
                props.mode === "dark" ? "1px solid white" : "1px solid #dee2e6",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor:
                      props.mode === "dark" ? "#555555" : "#f8f9fa",
                    color: props.mode === "dark" ? "white" : "black",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    backgroundColor:
                      props.mode === "dark" ? "#555555" : "#f8f9fa",
                    color: props.mode === "dark" ? "white" : "black",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td
                    style={{
                      backgroundColor:
                        props.mode === "dark" ? "#424242" : "white",
                      color: props.mode === "dark" ? "white" : "black",
                    }}
                  >
                    {category.name}
                  </td>
                  <td
                    style={{
                      backgroundColor:
                        props.mode === "dark" ? "#424242" : "white",
                      color: props.mode === "dark" ? "white" : "black",
                    }}
                  >
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="btn btn-warning me-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="brandList">
          <h2>Brands</h2>
          <table
            className="table table-bordered"
            style={{
              backgroundColor: props.mode === "dark" ? "#424242" : "white",
              color: props.mode === "dark" ? "white" : "black",
              border:
                props.mode === "dark" ? "1px solid white" : "1px solid #dee2e6",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor:
                      props.mode === "dark" ? "#555555" : "#f8f9fa",
                    color: props.mode === "dark" ? "white" : "black",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    backgroundColor:
                      props.mode === "dark" ? "#555555" : "#f8f9fa",
                    color: props.mode === "dark" ? "white" : "black",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id}>
                  <td
                    style={{
                      backgroundColor:
                        props.mode === "dark" ? "#424242" : "white",
                      color: props.mode === "dark" ? "white" : "black",
                    }}
                  >
                    {brand.name}
                  </td>
                  <td
                    style={{
                      backgroundColor:
                        props.mode === "dark" ? "#424242" : "white",
                      color: props.mode === "dark" ? "white" : "black",
                    }}
                  >
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="btn btn-warning me-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteBrand(brand._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

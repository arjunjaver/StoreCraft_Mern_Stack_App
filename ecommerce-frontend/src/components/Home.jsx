import React, { useEffect, useState } from "react";
import "./Home.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Home(props) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRanges: [],
  });

  const [formData, setFormData] = useState({
    productName: "",
    brandName: "",
    category: "",
    price: "",
    imageURL: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle change in form inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters when they change
  useEffect(() => {
    let filtered = products;

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category)
      );
    }
    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        filters.brands.includes(product.brandName)
      );
    }
    if (filters.priceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        const price = product.price;
        return filters.priceRanges.some((range) => {
          switch (range) {
            case "Under ₹1,000":
              return price < 1000;
            case "₹1,000 - ₹5,000":
              return price >= 1000 && price <= 5000;
            case "₹5,000 - ₹10,000":
              return price > 5000 && price <= 10000;
            case "₹10,000 - ₹20,000":
              return price > 10000 && price <= 20000;
            case "Over ₹20,000":
              return price > 20000;
            default:
              return true;
          }
        });
      });
    }

    setFilteredProducts(filtered);
  }, [filters, products]);

  // Function to clear a specific filter
  const clearFilters = (type) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [type]: [],
    }));
  };

  // Open modal with selected product data
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      productName: product.productName,
      brandName: product.brandName,
      category: product.category,
      price: product.price,
      imageURL: product.imageURL,
    });
    setShowModal(true);
  };

  // Handle checkbox change
  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type] = [...prevFilters[type], value];
      } else {
        updatedFilters[type] = prevFilters[type].filter(
          (item) => item !== value
        );
      }
      return updatedFilters;
    });
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/products/${currentProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product updated successfully!",
        });

        setShowModal(false);

        // Update product in state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === currentProduct._id
              ? { ...product, ...formData }
              : product
          )
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "An error occurred while updating the product.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update product.",
      });
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/products/${productId}`,
            { method: "DELETE" }
          );

          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Product deleted successfully.",
            });

            setProducts(
              products.filter((product) => product._id !== productId)
            );
          } else {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Failed to delete product.",
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "An error occurred while deleting the product.",
          });
        }
      }
    });
  };

  return (
    <div
      className="container-fluid mt-5"
      style={{ color: props.mode === "dark" ? "white" : "black" }}
    >
      <div className="row g-0">
        {/* Filter Section */}
        <div className="col-md-2 px-3 ">
          <h4>Filters</h4>

          {/* Category Filter */}
          <div className="mb-3">
            <label className="form-label">
              <b>Category</b>
            </label>
            <br />
            <span
              className="text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => clearFilters("categories")}
            >
              Clear
            </span>
            {[...new Set(products.map((p) => p.category))].map((category) => (
              <div key={category} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={category}
                  checked={filters.categories.includes(category)}
                  onChange={(e) => handleCheckboxChange(e, "categories")}
                />
                <label className="form-check-label">{category}</label>
              </div>
            ))}
          </div>

          {/* Brand Filter */}
          <div className="mb-3">
            <label className="form-label">
              <b>Brand</b>
            </label>
            <br />
            <span
              className="text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => clearFilters("brands")}
            >
              Clear
            </span>
            {[...new Set(products.map((p) => p.brandName))].map((brand) => (
              <div key={brand} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={brand}
                  checked={filters.brands.includes(brand)}
                  onChange={(e) => handleCheckboxChange(e, "brands")}
                />
                <label className="form-check-label">{brand}</label>
              </div>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mb-3">
            <label className="form-label">
              <b>Price Range</b>
            </label>
            <br />
            <span
              className="text-danger"
              style={{ cursor: "pointer" }}
              onClick={() => clearFilters("priceRanges")}
            >
              Clear
            </span>
            {[
              "Under ₹1,000",
              "₹1,000 - ₹5,000",
              "₹5,000 - ₹10,000",
              "₹10,000 - ₹20,000",
              "Over ₹20,000",
            ].map((range) => (
              <div key={range} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={range}
                  checked={filters.priceRanges.includes(range)}
                  onChange={(e) => handleCheckboxChange(e, "priceRanges")}
                />
                <label className="form-check-label">{range}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="col-md-10 ">
          {loading ? (
            <p className="loading-text">Loading Products<span>.</span><span>.</span><span>.</span></p>
          ) : filteredProducts.length > 0 ? (
            <div className="row">
              {filteredProducts.map((product) => (
                <div className="col-md-3 mb-3" key={product._id}>
                  <div
                    className="card"
                    style={{
                      width: "18rem",
                      height: "40rem",
                      backgroundColor:
                        props.mode === "dark" ? "#2c2c2c" : "white",
                      color: props.mode === "dark" ? "white" : "black",
                      border:
                        props.mode === "dark"
                          ? "1px solid white"
                          : "1px solid #dee2e6",
                      boxShadow:
                        props.mode === "dark"
                          ? "0 0 10px rgba(255, 255, 255, 0.2)"
                          : "0 0 10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <img
                      src={product.imageURL}
                      className="card-img-top"
                      alt={product.productName}
                      style={{
                        borderBottom: props.mode === "dark" ? "1px solid white" : "none",
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{product.productName}</h5>
                      <p>
                        <b>Brand:</b> {product.brandName}
                      </p>
                      <p>
                        <b>Category:</b> {product.category}
                      </p>
                      <p>
                        <b>Price:</b> &#x20b9;{product.price}
                      </p>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(product)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger mx-3"
                        onClick={() => handleDelete(product._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      {/* Modal for editing product */}
      {showModal && (
        <div
          className="modal-backdrop"
          style={{
            backgroundColor:
              props.mode === "dark"
                ? "rgba(0, 0, 0, 0.8)"
                : "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="modal show"
            style={{ display: "block" }}
            onClick={() => setShowModal(false)}
          >
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div
                className="modal-content"
                style={{
                  backgroundColor: props.mode === "dark" ? "#1e1e1e" : "white",
                  color: props.mode === "dark" ? "#f8f9fa" : "#212529",
                  border:
                    props.mode === "dark"
                      ? "1px solid #f8f9fa"
                      : "1px solid #dee2e6",
                  boxShadow:
                    props.mode === "dark"
                      ? "0 0 15px rgba(255, 255, 255, 0.3)"
                      : "0 0 10px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  padding: "15px",
                }}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product</h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleEditSubmit}>
                    {["productName", "price", "imageURL"].map((field) => (
                      <div className="mb-3" key={field}>
                        <label htmlFor={field} className="form-label">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                          type={field === "price" ? "number" : "text"}
                          className="form-control"
                          id={field}
                          value={formData[field]}
                          onChange={handleChange}
                          style={{
                            backgroundColor:
                              props.mode === "dark" ? "#2c2c2c" : "white",
                            color: props.mode === "dark" ? "white" : "black",
                            border:
                              props.mode === "dark"
                                ? "1px solid #f8f9fa"
                                : "1px solid #dee2e6",
                            borderRadius: "5px",
                            padding: "10px",
                          }}
                        />
                      </div>
                    ))}
                    <div className="d-flex justify-content-center mt-3">
                      <button
                        type="submit"
                        className="btn"
                        style={{
                          backgroundColor:
                            props.mode === "dark" ? "#ffc107" : "#007bff",
                          color: props.mode === "dark" ? "black" : "white",
                          border: "none",
                          padding: "10px 15px",
                          borderRadius: "5px",
                        }}
                      >
                        Update Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



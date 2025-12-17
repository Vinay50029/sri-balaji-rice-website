import { useState } from "react";

export default function Navbar({ path, navigate, categories, onCategorySelect }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (newPath) => {
        navigate(newPath);
        setIsMobileMenuOpen(false);
    };

    const handleMobileCategorySelect = (catValue) => {
        if (navigate && path !== "/") {
            navigate("/");
        }

        if (path !== "/") {
            navigate("/");
            setTimeout(() => onCategorySelect(catValue), 100);
        } else {
            onCategorySelect(catValue);
        }
        setIsMobileMenuOpen(false);
    };

    return (

        <header className="sbt-glass sticky-top" style={{ zIndex: 1100 }}>
            <div className="sbt-container py-2">
                <div className="d-flex align-items-center justify-content-between gap-3">
                    <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate("/")}
                    >
                        <img
                            src="/dlogo.png"
                            alt="Sri Balaji Traders Logo"
                            style={{
                                height: "36px",
                                width: "auto",
                                objectFit: "contain",
                                borderRadius: "8px"
                            }}
                        />
                        <h1 className="h5 mb-0" style={{ color: "var(--color-primary)" }}>
                            Sri Balaji Traders
                        </h1>
                    </div>

                    <div className="d-none d-md-flex align-items-center gap-2">
                        {path === "/" && (
                            <div
                                className="position-relative me-2"
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                                    <span>Products</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        className="position-absolute start-0 bg-white border rounded shadow-lg py-1 mt-1"
                                        style={{
                                            width: "200px",
                                            zIndex: 1050,
                                            maxHeight: "400px",
                                            overflowY: "auto"
                                        }}
                                    >
                                        <div
                                            className="dropdown-item px-3 py-2"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                                handleMobileCategorySelect("");
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            All Products
                                        </div>
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.value}
                                                className="dropdown-item px-3 py-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    handleMobileCategorySelect(cat.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {cat.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            className={`btn btn-sm ${path === "/other-products" ? "btn-accent" : "btn-outline-primary"}`}
                            onClick={() => handleNavigate("/other-products")}
                        >
                            Kitchen Essentials
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm ${path === "/about" ? "btn-accent" : "btn-outline-primary"}`}
                            onClick={() => handleNavigate("/about")}
                        >
                            About
                        </button>
                    </div>

                    <button
                        className="btn btn-sm btn-outline-primary d-md-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="fs-5">☰</span>
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <div className="mt-2 p-2 bg-white rounded shadow-sm border d-md-none" style={{ marginBottom: "80px" }}>
                        <div className="d-flex flex-column gap-1">
                            {path !== "/" && (
                                <button
                                    className="btn btn-sm btn-outline-primary text-start py-1"
                                    onClick={() => handleNavigate("/")}
                                >
                                    Home
                                </button>
                            )}

                            <div className="fw-bold text-muted small mt-1">Categories</div>
                            <button
                                className="btn btn-sm btn-light text-start py-1"
                                onClick={() => handleMobileCategorySelect("")}
                            >
                                All Products
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    className="btn btn-sm btn-light text-start py-1"
                                    onClick={() => handleMobileCategorySelect(cat.value)}
                                >
                                    {cat.label}
                                </button>
                            ))}

                            <div className="border-top my-1"></div>

                            <button
                                className={`btn btn-sm text-start py-1 ${path === "/other-products" ? "btn-accent" : "btn-outline-primary"}`}
                                onClick={() => handleNavigate("/other-products")}
                            >
                                Kitchen Essentials
                            </button>

                            <button
                                className={`btn btn-sm text-start py-1 ${path === "/about" ? "btn-accent" : "btn-outline-primary"}`}
                                onClick={() => handleNavigate("/about")}
                            >
                                About
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

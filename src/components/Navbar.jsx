import { useState, useRef, useEffect } from "react";

export default function Navbar({ path, navigate, categories, onCategorySelect }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleNavigate = (newPath) => {
        navigate(newPath);
    };

    const handleCategoryClick = (catValue) => {
        if (navigate && path !== "/") {
            navigate("/");
            setTimeout(() => onCategorySelect(catValue), 100);
        } else {
            onCategorySelect(catValue);
        }
        setIsDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <header className="sbt-glass sticky-top" style={{ zIndex: 1100 }}>
            <div className="sbt-container py-2">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 gap-md-3">
                    {/* Brand Logo & Name */}
                    <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate("/")}
                    >
                        <img
                            src="/dlogo.png"
                            alt="Sri Balaji Traders Logo"
                            style={{
                                height: "40px",
                                width: "auto",
                                objectFit: "contain",
                                borderRadius: "8px"
                            }}
                        />
                        <h1 className="h4 mb-0" style={{ color: "var(--color-primary)", fontFamily: "'Acme', sans-serif" }}>
                            Sri Balaji Traders
                        </h1>
                    </div>

                    {/* Navigation Items */}
                    <div
                        className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-end gap-2 w-100 w-md-auto pb-1 pb-md-0"
                    >

                        {/* Categories Dropdown */}
                        <div
                            className="position-relative"
                            ref={dropdownRef}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                <span>Categories</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    className="position-absolute bg-white border-0 rounded-4 shadow-lg py-2 mt-2"
                                    style={{
                                        zIndex: 1050,
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        left: "10px",
                                        minWidth: "240px",
                                        backdropFilter: "blur(10px)",
                                        background: "rgba(255, 255, 255, 0.95)",
                                        border: "1px solid rgba(0,0,0,0.05)"
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="dropdown-item px-4 py-2 small fw-bold text-uppercase text-muted"
                                        style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
                                    >
                                        Rice Varieties
                                    </div>
                                    <div
                                        className="dropdown-item px-4 py-3 border-bottom border-light"
                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                        onClick={() => handleCategoryClick("")}
                                        onMouseEnter={(e) => e.target.style.background = "rgba(0,0,0,0.02)"}
                                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                                    >
                                        <span className="fw-bold text-primary">View All Products</span>
                                    </div>
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <div
                                                key={cat.value}
                                                className="dropdown-item px-4 py-3 border-bottom border-light text-dark"
                                                style={{ cursor: "pointer", transition: "all 0.2s" }}
                                                onClick={() => handleCategoryClick(cat.value)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "rgba(26, 71, 42, 0.05)";
                                                    e.target.style.paddingLeft = "1.8rem";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "transparent";
                                                    e.target.style.paddingLeft = "1.5rem";
                                                }}
                                            >
                                                {cat.label}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dropdown-item px-4 py-2 text-muted small">Loading...</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Direct Links */}
                        <button
                            type="button"
                            className={`btn btn-sm ${path === "/other-products" ? "btn-accent" : "btn-outline-primary"}`}
                            onClick={() => handleNavigate("/other-products")}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                            Essentials
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm ${path === "/about" ? "btn-accent" : "btn-outline-primary"}`}
                            onClick={() => handleNavigate("/about")}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                            About
                        </button>

                        {/* YouTube Link */}
                        <a
                            href="https://www.youtube.com/@SriBalajiTraders1974"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-danger text-white d-flex align-items-center gap-2"
                            style={{ border: 'none', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
                            </svg>
                            <span className="d-none d-lg-inline">YouTube</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}

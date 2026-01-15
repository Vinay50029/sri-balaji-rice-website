import { useState, useRef, useEffect } from "react";

// top navigation bar for our app
// it has logo, categories dropdown and other links
export default function Navbar({ path, navigate, categories, onCategorySelect }) {
    // state to check if dropdown is open or closed
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleNavigate = (newPath) => {
        navigate(newPath);
    };

    // logic for handling category click
    // if we are not on home page, it first goes to home page and then scrolls to the category
    const handleCategoryClick = (catValue) => {
        if (navigate && path !== "/") {
            navigate("/");
            // wait for a bit so the home page loads completely
            setTimeout(() => onCategorySelect(catValue), 100);
        } else {
            onCategorySelect(catValue);
        }
        setIsDropdownOpen(false);
    };

    // if we click anywhere outside the dropdown it should close
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
                    {/* brand logo and name */}
                    <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNavigate("/")}
                    >
                        <img
                            src="/dlogo.png"
                            alt="Sri Balaji Traders Logo"
                            style={{
                                height: "30px",
                                width: "auto",
                                objectFit: "contain",
                                borderRadius: "8px"
                            }}
                        />
                        <h1 className="mb-0 fs-5 text-nowrap" style={{ color: "var(--color-primary)", fontFamily: "'Acme', sans-serif" }}>
                            Sri Balaji Traders
                        </h1>
                    </div>

                    {/* navigation items like buttons and dropdowns */}
                    <div
                        className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-end gap-2 w-100 w-md-auto pb-1 pb-md-0"
                    >

                        {/* categories dropdown menu */}
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
                                    className="position-absolute bg-white border-0 rounded-4 shadow-lg py-2"
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
                                        className="dropdown-item px-4 py-2 small fw-bold text-uppercase text-dark"
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

                        {/* direct links section */}
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


                    </div>
                </div>
            </div>
        </header>
    );
}

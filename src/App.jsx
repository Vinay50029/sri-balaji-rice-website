import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import FatherAdmin from "./FatherAdmin";
import FatherPosts from "./FatherPosts";
import OtherProducts from "./OtherProducts";
import About from "./About";
import { CartProvider, useCart } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import UserOrders from "./components/UserOrders";
import ScrollToTop from "./components/ScrollToTop";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

// ============================================
// RICE CATEGORIES - CUSTOMIZE HERE
// ============================================
// You can add, remove, or modify rice categories here
// Change the "label" to change the display text
// Change the "value" to change the internal identifier
const INITIAL_RICE_CATEGORIES = [
  { value: "raw", label: "Sona Masuri Raw Rice" },
  { value: "new", label: "JSR Rice" },
  { value: "old", label: "HMT Rice" },
  { value: "steam", label: "Single-Polish Rice" },
  { value: "broken", label: "Lachkari Kolam Rice" },
  { value: "brown", label: "Brown Rice" },
  { value: "Premium", label: "Premium Rice" },
];

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

function AppContent() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, loginWithGoogle, logout, setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "riceCategories"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchedCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Deduplicate
          const uniqueCats = [];
          const seenValues = new Set();
          fetchedCats.forEach(cat => {
            if (!seenValues.has(cat.value)) {
              seenValues.add(cat.value);
              uniqueCats.push(cat);
            }
          });
          setCategories(uniqueCats);
        } else {
          // Fallback to initial if empty (though Admin should have seeded it)
          setCategories(INITIAL_RICE_CATEGORIES);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(INITIAL_RICE_CATEGORIES);
      }
    };
    fetchCategories();

    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (newPath) => {
    if (newPath === path) return;
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  const handleCategorySelect = (categoryValue) => {
    if (!categoryValue) return;
    setSelectedCategory(categoryValue);
    const element = document.getElementById(`category-${categoryValue}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (path === "/father-admin") {
    return <FatherAdmin />;
  }

  let content;
  if (path === "/other-products") {
    content = <OtherProducts />;
  } else if (path === "/about") {
    content = <About />;
  } else {
    content = <FatherPosts onCategorySelect={handleCategorySelect} categories={categories} />;
  }

  return (
    <>
      <CartDrawer />
      <ScrollToTop />
      {showOrders && user && <UserOrders user={user} onClose={() => setShowOrders(false)} />}
      <div>
        <header
          className="border-bottom bg-dark sticky-top"
          style={{ zIndex: 1000 }}
        >
          <div className="container-fluid px-3 py-2">
            <div className="row align-items-center g-2">
              <div className="col-12 col-md-auto">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="/dlogo.png"
                    alt="Sri Balaji Traders Logo"
                    style={{
                      height: "20px",
                      width: "auto",
                      objectFit: "contain",
                      display: "none",
                      borderRadius: "30%"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                    }}
                  />
                  <h1 className="h6 mb-0 fw-bold text-white" style={{ fontSize: "16px", cursor: "pointer" }} onClick={() => navigate("/")}>
                    Sri Balaji Traders
                  </h1>
                </div>
              </div>
              <div className="col-12 col-md-auto ms-md-auto">
                <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center">
                  {path === "/" && (
                    <div
                      className="position-relative d-inline-block me-3"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <div
                        className="form-select form-select-sm d-flex align-items-center justify-content-between"
                        style={{
                          fontSize: "12px",
                          minWidth: "150px",
                          cursor: "pointer",
                          backgroundColor: "#fff"
                        }}
                      >
                        <span className="text-truncate">
                          Products
                        </span>
                      </div>

                      {isDropdownOpen && (
                        <div
                          className="position-absolute start-0 bg-white border rounded shadow-sm py-1"
                          style={{
                            top: "100%",
                            minWidth: "100%",
                            zIndex: 1050,
                            fontSize: "12px",
                            maxHeight: "300px",
                            overflowY: "auto"
                          }}
                        >
                          <div
                            className="dropdown-item px-3 py-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              handleCategorySelect("");
                              setIsDropdownOpen(false);
                            }}
                          >
                            Products
                          </div>
                          {categories.map((cat) => (
                            <div
                              key={cat.value}
                              className={`dropdown-item px-3 py-2 ${selectedCategory === cat.value ? "active" : ""}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleCategorySelect(cat.value);
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
                  <div className="d-flex gap-2 flex-wrap">



                    <button type="button" className={`btn btn-sm text-white ${path === "/other-products" ? "btn-white border-white" : "btn-outline-primary border-size-0.5"}`}
                      onClick={() => navigate("/other-products")}
                    > Other Products </button>

                    <button type="button" className={`btn btn-sm text-white ${path === "/about" ? "btn-white border-white" : "btn-outline-primary border-size-0.5"}`}
                      onClick={() => navigate("/about")}
                    > About </button>

                    <a
                      href="https://www.youtube.com/@SriBalajiTraders1974"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm text-white border-size-0.5"
                      style={{
                        backgroundColor: "#000000ff",
                        borderColor: "#FF0000",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-youtube" viewBox="0 0 16 16">
                        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.415c-.066-.246-.125-.516-.176-.815l-.013-.075-.011-.073-.01-.073c-.069-.491-.122-.996-.155-1.51l-.007-.104-.007-.105-.006-.104c-.013-.242-.027-.585-.028-.905v-.082c.002-.321.016-.665.03-.908l.007-.104.007-.104.006-.105c.033-.514.086-1.02.156-1.511l.01-.074.011-.075.013-.075c.05-.298.11-.569.176-.815a2.008 2.008 0 0 1 1.415-1.415c.576-.154 2.134-.263 4.497-.337zM5.5 11l6.06-3-6.06-3V11z" />
                      </svg>
                      YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ paddingBottom: "70px" }}>
          {content}
        </div>

        <footer
          className="bg-dark d-flex gap-2 flex-wrap"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
            padding: "13px 0"
          }}
        >
          <div className="container-fluid d-flex justify-content-around align-items-center">
            <button type="button" className={`btn btn-sm text-white btn-outline-danger border-size-0.5`}
              onClick={() => setIsCartOpen(true)} >
              <span className="position-relative">
                Cart
                {cartCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>{cartCount}</span>}
              </span>
            </button>

            <a
              href="https://wa.me/919951037494"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm text-white btn-outline-success border-size-0.5 d-flex align-items-center gap-1"
              title="Chat on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Contact
            </a>


            <SignedOut>
              <SignInButton mode="modal">
                <button type="button" className={`btn btn-sm text-white btn-outline-danger border-size-0.5`}>
                  Login
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <button type="button" className={`btn btn-sm text-white btn-outline-danger border-size-0.5`}
                onClick={() => setShowOrders(true)} >Order History
              </button>
              <div className="d-flex align-items-center justify-content-center" style={{ width: '40px' }}>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </footer>
      </div>

    </>
  );
}

export default App;
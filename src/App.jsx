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
import AIChatBot from "./components/AIChatBot";
import Wishes from "./components/wishingcards";

import Navbar from "./components/Navbar";
import FloatingFooter from "./components/FloatingFooter";
import { INITIAL_RICE_CATEGORIES } from "./utils/constants";


// here we are using the CartProvider to manage the cart state globally
// so that we can access the cart items from any page
function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

// this is the main logic of our app where we handle routing and state
function AppContent() {
  // logic to check in which page we are present currently
  const [path, setPath] = useState(() => window.location.pathname);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const { user, setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    // if we click back button in browser it should update the path
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);

    // fetching the rice categories from the database
    // if database is empty we use default categories
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "riceCategories"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetchedCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // here we are removing duplicates if any category is repeated
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
          // if nothing is in database we use the initial ones
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

  // function to change the page without reloading
  const navigate = (newPath) => {
    setShowOrders(false);
    setIsCartOpen(false);
    if (newPath === path) return;
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  // when we select a category it scrolls to that position
  const handleCategorySelect = (categoryValue) => {
    setShowOrders(false);
    setIsCartOpen(false);

    if (!categoryValue) return;

    setSelectedCategory(categoryValue);
    const element = document.getElementById(`category-${categoryValue}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // checking if the path is admin panel
  if (path === "/father-admin") {
    return <FatherAdmin />;
  }

  // checking which page to show based on the path
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
      <AIChatBot />
      <Wishes />
      {showOrders && user && <UserOrders user={user} onClose={() => setShowOrders(false)} />}
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          path={path}
          navigate={navigate}
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />

        <main className="flex-grow-1 pb-5">
          {content}
        </main>

        <FloatingFooter onOpenOrders={() => setShowOrders(true)} />
      </div>

    </>
  );
}

export default App;
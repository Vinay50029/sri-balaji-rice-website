export const OWNER_PHONE = import.meta.env.VITE_OWNER_PHONE;
export const DELIVERY_FEE = 15;
export const SHOP_COORDINATES = { lat: 17.48601821127715, lng: 78.55582850296089 };

export const ORDER_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    DELIVERED: "delivered",
    CANCELLED: "cancelled"
};

export const FATHER_UID = "lvWMnEjk3bcFMOWuaa7DWdhkLWb2";

export const INITIAL_RICE_CATEGORIES = [
    { value: "raw", label: "Sona Masuri Raw Rice" },
    { value: "new", label: "JSR Rice" },
    { value: "old", label: "HMT Rice" },
    { value: "steam", label: "Single-Polish Rice" },
    { value: "broken", label: "Lachkari Kolam Rice" },
    { value: "brown", label: "Brown Rice" },
    { value: "Premium", label: "Premium Rice" },
];

export const RICE_CATEGORY_SUBTITLES = {
    raw: "Classic raw rice varieties straight from the mill.",
    new: "Freshly milled new-season rice.",
    old: "Aged rice for premium aroma and texture.",
    steam: "Traditional single-polished rice for a healthy diet.",
    broken: "Broken rice options for everyday cooking.",
    brown: "Healthy brown rice packed with nutrients.",
    Premium: "Premium quality rice varieties for special occasions.",
};

export const ADMIN_COLLECTIONS = {
    fatherPosts: {
        key: "fatherPosts",
        label: "Home Posts",
        description: "Items shown on the main home page.",
    },
    otherProducts: {
        key: "otherProducts",
        label: "Other Products",
        description: "Items shown on the Pellets / Other Products page.",
    },
    offers: {
        key: "offers",
        label: "Special Offers",
        description: "Manage offers shown on the home page.",
    },
    orders: {
        key: "orders",
        label: "Orders",
        description: "Manage customer orders instantly.",
    },
};

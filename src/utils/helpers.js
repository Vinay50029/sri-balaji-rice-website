export const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) {
        return "Price unavailable";
    }
    return `₹${Number(price).toLocaleString("en-IN")}`;
};

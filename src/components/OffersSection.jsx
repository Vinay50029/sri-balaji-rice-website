// ============================================
// OFFERS SECTION - CUSTOMIZE CONTENT HERE
// ============================================

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function OffersSection() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "offers"));
        const offersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(offersData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, []);

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="display-6 fw-bold mb-2">Special Offers</h2>
          <p className="text-muted">Exclusive deals and rewards for our valued customers</p>
        </div>

        <div className="row g-4 justify-content-center">
          {offers.map((offer) => (
            <div key={offer.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className={`card h-100 shadow-sm border-0 bg-${offer.color} bg-opacity-10`}>
                <div className="card-body text-center p-4">
                  <div className="mb-3" style={{ fontSize: "3rem" }}>
                    {offer.icon}
                  </div>
                  <h4 className="h5 fw-bold mb-3">{offer.title}</h4>
                  <p className="text-muted mb-0">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OffersSection;

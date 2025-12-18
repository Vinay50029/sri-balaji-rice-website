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
    <section className="py-3 bg-light">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="h5 fw-bold text-uppercase text-muted mb-2" style={{ letterSpacing: '2px' }}>Special Offers</h2>
          <p className="text-muted small">Exclusive deals and rewards for our valued customers</p>
        </div>

        <div className="row g-4 justify-content-center">

          {/* <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="sbt-card h-100" style={{ background: "linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)", border: '1px solid var(--color-secondary-light)' }}>
              <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
                <div className="mb-3" style={{ fontSize: "3rem" }}>
                  <span className="icon-animate">🎁</span>
                </div>
                <h4 className="h5 mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontWeight: '700' }}>Lucky Draw Offer</h4>
                <p className="small mb-3 fw-bold" style={{ color: 'var(--color-accent)' }}>Win Silver Coins! 🥇🥈🥉</p>
                <p className="text-muted small mb-0">
                  Buy a <strong>26kg Rice Bag</strong> to get a coupon. Draw on 1st of every month!
                </p>
              </div>
            </div>
          </div> */}
          {offers.map((offer) => {
            const theme = offer.color || 'white';
            const bgStyle = theme === 'gold'
              ? { background: "linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)", border: '1px solid #e6c88b' }
              : theme === 'green'
                ? { background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)", border: '1px solid #c8e6c9' }
                : theme === 'blue'
                  ? { background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)", border: '1px solid #bbdefb' }
                  : { background: "#ffffff", border: '1px solid #f0f0f0' };

            return (
              <div key={offer.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="sbt-card h-100" style={bgStyle}>
                  <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
                    <div className="mb-3" style={{ fontSize: "3rem" }}>
                      <span className="icon-animate">{offer.icon}</span>
                    </div>
                    <h4 className="h5 mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontWeight: '600' }}>{offer.title}</h4>
                    <p className="small mb-3 fw-bold" style={{ color: 'var(--color-accent)' }}>{offer.subTitle}</p>
                    <p className="text-muted mb-3">{offer.description}</p>
                    {/* <small className="text-secondary fw-bold" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>Check Details</small> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default OffersSection;

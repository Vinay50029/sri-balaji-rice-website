// this is the about us page where we show business details
// we have hero section, features, story, map and social links
function About() {
  // address for the google map embed
  const mapAddress = "1-19/78/43, Aditya Nagar Road, Netaji Nagar, Kapra, Hyderabad, 500062, Telangana";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

  return (
    <div className="bg-light min-vh-100 font-sans">
      {/* hero section - main branding area */}
      <div
        className="position-relative text-center text-white py-5 mb-5"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          borderRadius: "0 0 2rem 2rem"
        }}
      >
        <div className="container py-5">
          <h1 className="display-4 fw-bold mb-3" style={{ color: '#ffffff' }}>Sri Balaji Rice Traders</h1>
          <p className="lead fs-4 opacity-75">
            Premium Quality Rice for Every Household
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {/* key features cards - showing why we are best */}
        <div className="row g-4 mb-5 justify-content-center">
          {[
            {
              icon: "bi-shield-check",
              title: "Quality Assured",
              text: "Every grain is checked for purity. We promise standard, clean, and fresh rice directly from the best mills."
            },
            {
              icon: "bi-tag-fill",
              title: "Genuine Pricing",
              text: "Wholesale prices for retail customers. We believe in fair trade and providing value for your money."
            },
            {
              icon: "bi-people-fill",
              title: "Customer First",
              text: "Personalized service to help you find the perfect rice variety for your daily needs."
            }
          ].map((item, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="card h-100 border-0 shadow-sm text-center p-4 hover-lift" style={{ transition: "transform 0.2s" }}>
                <div className="mb-3 text-success">
                  {/* using svg icons for better quality */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className={`bi ${item.icon}`} viewBox="0 0 16 16">
                    {/* drawing the icons based on the type */}
                    {item.icon === "bi-shield-check" && <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56zM10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z" />}
                    {item.icon === "bi-tag-fill" && <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1H2zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />}
                    {item.icon === "bi-people-fill" && <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />}
                  </svg>
                </div>
                <h3 className="h5 fw-bold mb-2">{item.title}</h3>
                <p className="text-muted small mb-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* main content and map grid */}
        <div className="row g-5 align-items-start mb-5">
          {/* left side: our story and contact info */}
          <div className="col-lg-6">
            <div className="mb-5">
              <h2 className="fw-bold mb-3 text-dark">Our Story</h2>
              <p className="text-secondary lead">
                "To provide the best-quality rice at fairness prices."
              </p>
              <p className="text-muted">
                Sri Balaji Rice Traders has been a trusted name in the community. We source our rice from the finest paddy fields to ensure that only the most nutritious and flavorful grains reach your plate. Whether you need daily staples or premium basmati for special occasions, we have it all.
              </p>
            </div>

            {/* contact details card */}
            <div className="card border-0 bg-white shadow-sm p-4 rounded-3">
              <h3 className="h5 fw-bold mb-4 border-bottom pb-2">Visit Our Store</h3>

              <div className="d-flex mb-3">
                <div className="text-success me-3 fs-4"><i className="bi bi-geo-alt"></i></div>
                <div>
                  <strong className="d-block text-dark">Address</strong>
                  <span className="text-muted">1-19/78/43, Aditya Nagar Road, Netaji Nagar, Kapra, Hyderabad, 500062</span>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="text-success me-3 fs-4"><i className="bi bi-clock"></i></div>
                <div>
                  <strong className="d-block text-dark">Open Daily</strong>
                  <span className="text-muted">9:30 AM - 9:30 PM (Mon-Sun)</span>
                </div>
              </div>

              <div className="d-grid gap-2 mt-4">
                <a href="tel:9951037494" className="btn btn-outline-primary fw-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill me-2" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" /></svg>
                  Call 9951037494
                </a>
                <a href="https://maps.app.goo.gl/aRwbCxHUzGfkP3hN9" target="_blank" rel="noopener noreferrer" className="btn btn-primary fw-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill me-2" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* right side: google map */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm overflow-hidden rounded-3 h-100" style={{ minHeight: "400px" }}>
              <iframe
                title="Location Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* social media links section */}
        <div className="text-center pt-4 border-top">
          <p className="text-muted mb-3 fw-semibold">Connect with us on Social Media</p>
          <div className="d-flex gap-3 justify-content-center">
            {/* Instagram */}
            <a href="https://www.instagram.com/sri_balaji_traders09/" target="_blank" rel="noopener noreferrer" className="hover-scale">
              <img src="/instagram.jpg" alt="Instagram" width="40" height="40" className="rounded-3" />
            </a>
            {/* Threads */}
            <a href="https://www.threads.com/@sri_balaji_traders09" target="_blank" rel="noopener noreferrer" className="hover-scale">
              <img src="/threads.jpg" alt="Threads" width="40" height="40" className="rounded-3" style={{ borderRadius: "20%" }} />
            </a>
            {/* WhatsApp */}
            <a href="https://wa.me/919951037494" target="_blank" rel="noopener noreferrer" className="hover-scale">
              <img src="/whatsapp.jpg" alt="WhatsApp" width="40" height="40" className="rounded-3" />
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@SriBalajiTraders1974" target="_blank" rel="noopener noreferrer" className="hover-scale">
              <img src="/youtube.jpg" alt="YouTube" width="50" height="35" className="rounded-3" />
            </a>
          </div>
        </div>

      </div>

      {/* adding hover animation styles */}
      <style>{`
        .hover-lift:hover { transform: translateY(-5px); }
        .hover-scale:hover { transform: scale(1.1); transition: transform 0.2s; }
      `}</style>
    </div>
  );
}

export default About;

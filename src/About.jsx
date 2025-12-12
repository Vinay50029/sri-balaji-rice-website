// ============================================
// ABOUT PAGE - CUSTOMIZE CONTENT HERE
// ============================================

function About() {
  // Google Maps embed URL - Replace with your actual address
  // Format: https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=ADDRESS
  // For public embed without API key, use: https://www.google.com/maps?q=ADDRESS&output=embed
  const mapAddress = "1-19/78/43, Aditya Nagar Road, Netaji Nagar, Kapra, Hyderabad, 500062, Telangana";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

  return (
    <section className="py-5">
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold mb-3">About Us</h1>
          <h2 className="h3 text-dark mb-4">Welcome to Sri Balaji Rice Traders</h2>
        </div>

        {/* MAIN CONTENT */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="card shadow-sm border-0 p-4">
              <p className="lead mb-4">
                Sri Balaji Rice Traders is a trusted rice store offering a wide range of high-quality rice varieties at genuine prices.
              </p>
              <p className="mb-4">
                We serve both retail and wholesale customers and focus on providing clean, fresh, and quality-checked rice for every household.
              </p>

              {/* OUR AIM SECTION */}
              <div className="mt-4 pt-4 border-top">
                <h3 className="h4 fw-bold mb-3">Our Aim</h3>
                <p className="mb-0">
                  Our aim is to provide the best-quality rice at fair prices and to ensure that every customer receives the perfect rice variety for their needs.
                </p>
              </div>

              {/* VISIT US SECTION */}
              <div className="mt-4 pt-4 border-top">
                <h3 className="h4 fw-bold mb-3">Visit Us</h3>
                <p className="mb-4">
                  We welcome you to visit our shop and explore our wide range of rice varieties.
                </p>
                <p className="mb-0">
                  more information, feel free to contact us or visit our store.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-6 col-lg-4 mx-auto">
            <div className="card shadow-sm border-0 p-4 h-100">
              <h3 className="h5 fw-bold mb-4">Contact Information</h3>

              <div className="mb-3">
                <strong className="d-block mb-2"> Address</strong>
                <p className="mb-0 text-muted">
                  1-19/78/43, Aditya Nagar Road, Netaji Nagar, Kapra, Hyderabad, 500062, Telangana
                </p>
              </div>

              <div className="mb-3">
                <strong className="d-block mb-2">Phone</strong>
                <a href="tel:9951037494" className="text-decoration-none text-primary">
                  9951037494
                </a>
              </div>

              <div>
                <strong className="d-block mb-2">Timings</strong>
                <p className="mb-1 text-muted">
                  <strong>Mon - Sun:</strong> 9:30 AM to 9:30 PM
                </p>
                {/* <p className="mb-0 text-muted">
                  <strong>Sun:</strong> 9:30 AM to 9:30 PM
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* GOOGLE MAP */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card shadow-sm border-0 overflow-hidden">
              <div className="card-header bg-dark text-white">
                <h3 className="h5 mb-0">Find Us on the Map</h3>
              </div>
              <div className="card-body p-0">
                <iframe
                  title="Sri Balaji Rice Traders Location"
                  src={mapUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            {/* Directions Button */}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=1-19/78/43,+Aditya+Nagar+Road,+Netaji+Nagar,+Kapra,+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark w-100 fw-semibold"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* SOCIAL & CONTACT LINKS */}
        <div className="mt-4 pt-4 border-top">
          <strong className="d-block mb-3 text-center">Connect With Us</strong>

          <div className="d-flex gap-3 flex-wrap justify-content-center">
            {/* style={{ }} */}
            {/* Instagram */}
            <a
              href="https://www.instagram.com/sri_balaji_traders09/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="Instagram"
            >
              <img
                src="/instagram.jpg"
                alt="Instagram"
                width="32"
                height="32"
              />
            </a>

            {/* Facebook */}
            {/* <a
              href="https://www.facebook.com/RavinderGattu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="Facebook"
            >
              <img
                src="/facebook.jpg"
                alt="Facebook"
                width="31"
                height="31"
                style={{ borderRadius: "10%" }}
              />
            </a> */}

            {/* Threads */}
            <a
              href="https://www.threads.com/@sri_balaji_traders09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="Threads"
            >
              {/* Using a black icon for Threads as the background is white */}
              <img
                src="/threads.jpg"
                alt="Threads"
                width="32"
                height="32"
                style={{ borderRadius: "20%" }}
              />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919951037494"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="WhatsApp"
            >
              <img
                src="/whatsapp.jpg"
                alt="WhatsApp"
                width="32"
                height="32"
                style={{ borderRadius: "10%" }}
              />
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@SriBalajiTraders1974"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="YouTube"
            >
              <img
                src="/youtube.jpg"
                alt="YouTube"
                width="39"
                height="29"
                style={{ borderRadius: "10%", paddingTop: "4px" }}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;


import React from "react";

export default function BrandHero() {
    return (
        <section className="position-relative overflow-hidden text-center bg-white" style={{ paddingTop: "30px", paddingBottom: "60px" }}>
            <div className="container position-relative" style={{ zIndex: 10 }}>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="d-inline-block px-3 py-1 rounded-pill bg-light border border-secondary mb-3">
                            <span className="small fw-bold text-uppercase" style={{ letterSpacing: "1px", color: "var(--color-primary)" }}>
                                Trusted by Many Customers • Wholesale & Retail Experts • Customer Satisfaction First
                            </span>
                        </div>
                        <h1 className="display-4 fw-bold mb-4" style={{ color: "var(--color-primary)", letterSpacing: "-0.02em" }}>
                            Premium Rice, <span style={{ color: "var(--color-secondary)" }}>Pure Tradition</span>
                        </h1>
                        <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: "500px" }}>
                            From premium Sona Masuri and aged HMT to healthy Brown Rice and Steam varieties We bring you the finest authentic selections.
                        </p>

                        <div className="d-flex justify-content-center gap-4 flex-wrap">
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-light p-2 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                                    </svg>
                                </div>
                                <div className="text-start">
                                    <h6 className="mb-0 fw-bold">100% Quality</h6>
                                    <small className="text-muted">Hand-picked Grain</small>
                                </div>
                            </div>

                            {/* <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-light p-2 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-4 0H.5a1.5 1.5 0 0 1-1.5-1.5v-6.5zm11 .5a.5.5 0 0 0-.5.5v2h2a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5h-1.5zM.5 3a.5.5 0 0 0-.5.5v6.5A.5.5 0 0 0 .5 10h1a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h1a.5.5 0 0 0 .5-.5v-2.125a.5.5 0 0 0-.11-.313l-1.48-1.85A.5.5 0 0 0 13.02 5H11.5a1.5 1.5 0 0 1-1.5-1.5v-2a.5.5 0 0 0-.5-.5H1.5A.5.5 0 0 0 .5 3z" />
                                    </svg>
                                </div>
                                <div className="text-start">
                                    <h6 className="mb-0 fw-bold">Fast Delivery</h6>
                                    <small className="text-muted">Within 24 Hours</small>
                                </div>
                            </div> */}

                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle bg-light p-2 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.502.502 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z" />
                                    </svg>
                                </div>
                                <div className="text-start">
                                    <h6 className="mb-0 fw-bold">Safe Payment</h6>
                                    <small className="text-muted">Cash on Delivery</small>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle p-2 text-primary">
                                    <a href="https://www.youtube.com/@SriBalajiTraders1974" target="_blank" rel="noopener noreferrer" className="hover-scale">
                                        <img src="/youtube.jpg" alt="YouTube" width="42" height="27" className="rounded-3" />
                                    </a>
                                </div>
                                <div className="text-start">
                                    <a href="https://www.youtube.com/@SriBalajiTraders1974" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-dark hover-scale d-block">
                                        <h6 className="mb-0 fw-bold">Youtube</h6>
                                        <small className="text-muted">Tap to watch</small>
                                    </a>
                                </div>
                            </div>
                        </div>


                        <button
                            type="button"
                            className="btn btn-accent px-3 py-2 fw-bold mt-5 rounded-pill shadow-lg"
                            style={{ letterSpacing: '1px', fontSize: '1.1rem' }}
                            onClick={() => document.getElementById('shop-start')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            ORDER NOW ↓
                        </button>
                    </div>
                </div>
            </div>
        </section >
    );
}

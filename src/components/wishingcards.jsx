import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Wishes = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkDate = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth(); // 0-indexed (0 is January)
            const date = now.getDate();

            // Check if it is January 1st, 2026
            if (year === 2026 && month === 0 && date === 1) {
                // Check if already shown in this session
                const hasShownInSession = sessionStorage.getItem('hasSeenWishes');

                if (!hasShownInSession) {
                    setIsVisible(true);
                    // Mark as shown for this session
                    sessionStorage.setItem('hasSeenWishes', 'true');
                }
            } else {
                setIsVisible(false);
            }
        };

        checkDate();
        // Optional: Set up an interval to check every minute if we want it to auto-disappear at midnight while open
        const interval = setInterval(checkDate, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full relative"
                    style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '28rem', width: '100%', position: 'relative', overflow: 'hidden' }}
                >
                    {/* Background decoration */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', opacity: 0.1, zIndex: 0 }}></div>

                    <div className="p-8 text-center relative z-10" style={{ padding: '2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                        <motion.h2
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#B45309', marginBottom: '0.5rem', fontFamily: 'serif' }}
                        >
                            Happy New Year!
                        </motion.h2>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            style={{ fontSize: '4rem', fontWeight: '800', background: 'linear-gradient(to right, #D97706, #B45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '1rem 0' }}
                        >
                            2026
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '2rem', lineHeight: '1.6' }}
                        >
                            Wishing you specific joy and success in the coming year. Thank you for being a valued customer!
                        </motion.p>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsVisible(false)}
                            style={{
                                background: 'linear-gradient(to right, #D97706, #B45309)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 32px',
                                borderRadius: '9999px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.3)'
                            }}
                        >
                            Continue Shopping
                        </motion.button>
                    </div>

                    {/* Confetti-like decoration circles */}
                    <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#FCD34D', opacity: 0.3 }}></div>
                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#F59E0B', opacity: 0.3 }}></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Wishes;

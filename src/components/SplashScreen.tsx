import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'motion/react';
import animationData from '../assets/splash-animation.json';

interface SplashScreenProps {
  onFinish?: () => void;
  minimumDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minimumDurationMs = 2800,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, minimumDurationMs);

    return () => clearTimeout(timer);
  }, [minimumDurationMs, onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-600 text-white p-6 overflow-hidden select-none"
      >
        {/* Subtle Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Lottie Animation Container */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 max-w-full flex items-center justify-center">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

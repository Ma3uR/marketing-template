'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

const figureEightPath = {
  x: [
    '0%', '15%', '25%', '30%', '25%', '15%',
    '0%', '-15%', '-25%', '-30%', '-25%', '-15%', '0%',
  ],
  y: [
    '0%', '-20%', '-35%', '-40%', '-35%', '-20%',
    '0%', '20%', '35%', '40%', '35%', '20%', '0%',
  ],
};

function AnimatedBackground() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <>
      {/* Animated Geometric Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={figureEightPath}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `radial-gradient(
              circle 800px at 50% 50%,
              rgba(217, 70, 239, 0.15),
              rgba(168, 85, 247, 0.1) 30%,
              rgba(251, 113, 133, 0.08) 50%,
              transparent 70%
            )`,
          }}
        />
      </div>

      {/* Background blobs with parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#3b1d8f]/20 blur-[120px] rounded-full"
        />
        <motion.div
          style={{ y: backgroundY }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#d946ef]/10 blur-[120px] rounded-full"
        />
      </div>
    </>
  );
}

function StaticBackground() {
  return (
    <>
      {/* Static Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
              circle 800px at 50% 50%,
              rgba(217, 70, 239, 0.15),
              rgba(168, 85, 247, 0.1) 30%,
              rgba(251, 113, 133, 0.08) 50%,
              transparent 70%
            )`,
          }}
        />
      </div>

      {/* Static blobs without blur/parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#3b1d8f]/20 rounded-full opacity-60" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#d946ef]/10 rounded-full opacity-60" />
      </div>
    </>
  );
}

export function BackgroundEffects({ shouldAnimate }: { shouldAnimate: boolean }) {
  return shouldAnimate ? <AnimatedBackground /> : <StaticBackground />;
}

'use client';

import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -5,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            }
          : {}
      }
      className={`bg-[rgba(26,13,46,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

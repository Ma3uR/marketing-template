'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0f0a1f] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">Оплата успішна!</h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Дякуємо за покупку курсу! Ви отримаєте лист з інструкціями для доступу
          на вашу електронну пошту протягом кількох хвилин.
        </p>

        <div className="bg-[#1a0d2e]/60 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-300">
            <Mail className="w-5 h-5 text-[#a855f7]" />
            <span>Перевірте вашу пошту</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Повернутися на головну
        </Link>
      </motion.div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailurePage() {
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
          className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">Оплата не пройшла</h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          На жаль, платіж не вдалося обробити. Будь ласка, перевірте дані картки
          та спробуйте ще раз. Якщо проблема повторюється, зверніться до служби
          підтримки.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-xl font-bold hover:scale-[1.02] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Спробувати знову
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            На головну
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderReference = searchParams.get('orderReference');
  const status = searchParams.get('status');

  const isSuccess = !status || status === 'Approved';
  const isDeclined = status === 'Declined';

  return (
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
        className={`w-24 h-24 ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full flex items-center justify-center mx-auto mb-8`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        ) : (
          <XCircle className="w-12 h-12 text-red-500" />
        )}
      </motion.div>

      <h1 className="text-3xl font-bold mb-4">
        {isSuccess ? 'Оплата успішна!' : 'Оплата не пройшла'}
      </h1>

      <p className="text-gray-400 mb-8 leading-relaxed">
        {isSuccess ? (
          'Дякуємо за покупку курсу! Ви отримаєте лист з інструкціями для доступу на вашу електронну пошту протягом кількох хвилин.'
        ) : isDeclined ? (
          'На жаль, оплату було відхилено. Будь ласка, спробуйте ще раз або використайте іншу картку.'
        ) : (
          'Виникла помилка під час обробки платежу. Будь ласка, спробуйте ще раз.'
        )}
      </p>

      {orderReference && (
        <div className="bg-[#1a0d2e]/60 border border-white/10 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-sm mb-1">Номер замовлення</p>
          <p className="text-white font-mono">{orderReference}</p>
          {status && (
            <p className={`text-sm mt-2 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
              Статус: {status}
            </p>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="bg-[#1a0d2e]/60 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-300">
            <Mail className="w-5 h-5 text-[#a855f7]" />
            <span>Перевірте вашу пошту</span>
          </div>
        </div>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        {isSuccess ? 'Повернутися на головну' : 'Спробувати ще раз'}
      </Link>
    </motion.div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0f0a1f] text-white flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Завантаження...</h1>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}

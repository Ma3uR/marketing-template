export interface WayForPayProduct {
  name: string;
  price: number;
  count: number;
}

export interface WayForPayRequest {
  merchantAccount: string;
  merchantDomainName: string;
  merchantSignature: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: 'UAH' | 'USD' | 'EUR';
  productName: string[];
  productPrice: number[];
  productCount: number[];
  clientFirstName?: string;
  clientLastName?: string;
  clientEmail?: string;
  clientPhone?: string;
  language?: 'UA' | 'EN' | 'RU';
  returnUrl?: string;
  serviceUrl?: string;
}

export interface WayForPayCallback {
  merchantAccount: string;
  orderReference: string;
  merchantSignature: string;
  amount: number;
  currency: string;
  authCode: string;
  email: string;
  phone: string;
  createdDate: number;
  processingDate: number;
  cardPan: string;
  cardType: string;
  issuerBankCountry: string;
  issuerBankName: string;
  recToken?: string;
  transactionStatus:
    | 'Approved'
    | 'Declined'
    | 'Refunded'
    | 'Expired'
    | 'InProcessing';
  reason: string;
  reasonCode: number;
  fee: number;
  paymentSystem: string;
}

export interface WayForPayCallbackResponse {
  orderReference: string;
  status: 'accept' | 'refuse';
  time: number;
  signature: string;
}

export type TransactionType =
  | 'PURCHASE'
  | 'SETTLE'
  | 'CHARGE'
  | 'REFUND'
  | 'CHECK_STATUS'
  | 'P2P_CREDIT'
  | 'CREATE_INVOICE'
  | 'TRANSACTION_LIST';

export type PricingTier = 'basic' | 'premium' | 'vip';

export interface PricingConfig {
  title: string;
  price: number;
  originalPrice: number;
  features: string[];
  isPopular: boolean;
  urgency?: string;
}

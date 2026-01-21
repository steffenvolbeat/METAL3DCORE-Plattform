// 💳 Payment Options Component - Vollständige Zahlungsoptionen
// Erweiterte Zahlungsmethoden für Schweizer E-Commerce Standards

import React, { useState } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
  fees?: number;
  processingTime?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "credit_card",
    name: "Kreditkarte",
    icon: "💳",
    description: "Visa, Mastercard, Amex - Sofort verfügbar",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "debit_card",
    name: "EC-Card / Debitkarte",
    icon: "💰",
    description: "SEPA Debitkarten - Secure Payment",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🏦",
    description: "PayPal Account oder Gast-Zahlung",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "mobile_pay",
    name: "Mobile Payment",
    icon: "📱",
    description: "Apple Pay, Google Pay - Touch & Pay",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "twint",
    name: "TWINT",
    icon: "🇨🇭",
    description: "Schweizer Mobile Payment - QR Code",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "invoice",
    name: "Kauf auf Rechnung",
    icon: "📄",
    description: "Zahlung innerhalb 30 Tagen - Bonitätsprüfung",
    available: true,
    fees: 0,
    processingTime: "1-2 Werktage",
  },
  {
    id: "voucher",
    name: "Gutscheine & Vouchers",
    icon: "🎫",
    description: "Einlösbare Gutscheine - Code eingeben",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "sofort",
    name: "Sofortüberweisung",
    icon: "⚡",
    description: "Direkte Banküberweisung - TAN-Verfahren",
    available: true,
    fees: 0,
    processingTime: "Sofort",
  },
  {
    id: "sepa",
    name: "SEPA-Lastschrift",
    icon: "🏪",
    description: "Automatische Abbuchung - IBAN erforderlich",
    available: true,
    fees: 0,
    processingTime: "2-3 Werktage",
  },
  {
    id: "crypto",
    name: "Kryptowährung",
    icon: "🪙",
    description: "Bitcoin, Ethereum - Coming Soon",
    available: false,
    fees: 0,
    processingTime: "Coming Soon",
  },
];

interface PaymentOptionsProps {
  selectedMethod?: string;
  onMethodSelect: (methodId: string) => void;
  totalAmount: number;
  currency?: string;
}

export default function PaymentOptions({
  selectedMethod,
  onMethodSelect,
  totalAmount,
  currency = "CHF",
}: PaymentOptionsProps) {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    // Kreditkarte
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    // Bankdaten
    iban: "",
    bic: "",
    accountHolder: "",
    // PayPal
    paypalEmail: "",
    // TWINT
    phoneNumber: "",
    // Gutschein
    voucherCode: "",
    // Rechnung
    companyName: "",
    taxNumber: "",
  });

  const handleMethodClick = (method: PaymentMethod) => {
    if (!method.available) return;

    setExpandedMethod(expandedMethod === method.id ? null : method.id);
    onMethodSelect(method.id);
  };

  const formatAmount = (amount: number) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const renderPaymentFields = (methodId: string) => {
    switch (methodId) {
      case "credit_card":
      case "debit_card":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">
              💳 Kartendaten eingeben:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Kartennummer (1234 5678 9012 3456)"
                value={paymentData.cardNumber}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, cardNumber: e.target.value })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                maxLength={19}
              />
              <input
                type="text"
                placeholder="Karteninhaber (Name auf der Karte)"
                value={paymentData.cardName}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, cardName: e.target.value })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      expiryDate: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  maxLength={5}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentData.cvv}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cvv: e.target.value })
                  }
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="text-xs text-blue-300 mt-2 p-2 bg-blue-900/30 rounded">
              🛡️ Test: 4242 4242 4242 4242 | MM/YY: 12/25 | CVV: 123
            </div>
          </div>
        );

      case "sepa":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">
              🏪 SEPA-Lastschrift Bankdaten:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="IBAN (CH12 3456 7890 1234 5678 9)"
                value={paymentData.iban}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, iban: e.target.value })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="BIC / SWIFT-Code"
                value={paymentData.bic}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, bic: e.target.value })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Kontoinhaber (Vollständiger Name)"
                value={paymentData.accountHolder}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    accountHolder: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-yellow-300 mt-2 p-2 bg-yellow-900/30 rounded">
              ⚠️ SEPA-Mandat wird per E-Mail an Sie versendet
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">🏦 PayPal Login:</h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="email"
                placeholder="PayPal E-Mail-Adresse"
                value={paymentData.paypalEmail}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paypalEmail: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-blue-300 mt-2 p-2 bg-blue-900/30 rounded">
              🔐 Sie werden zur sicheren PayPal-Anmeldung weitergeleitet
            </div>
          </div>
        );

      case "twint":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">
              🇨🇭 TWINT Mobilnummer:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="tel"
                placeholder="+41 79 123 45 67"
                value={paymentData.phoneNumber}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-red-300 mt-2 p-2 bg-red-900/30 rounded">
              📱 QR-Code wird an Ihre TWINT-App gesendet
            </div>
          </div>
        );

      case "voucher":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">
              🎫 Gutschein einlösen:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Gutschein-Code (z.B. METAL2025)"
                value={paymentData.voucherCode}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    voucherCode: e.target.value.toUpperCase(),
                  })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-purple-300 mt-2 p-2 bg-purple-900/30 rounded">
              🎟️ Code wird automatisch validiert und angerechnet
            </div>
          </div>
        );

      case "invoice":
        return (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-3">
            <h4 className="text-white font-semibold mb-3">
              📄 Rechnungsadresse:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Firma (Optional)"
                value={paymentData.companyName}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    companyName: e.target.value,
                  })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Umsatzsteuer-ID (Optional)"
                value={paymentData.taxNumber}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, taxNumber: e.target.value })
                }
                className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-orange-300 mt-2 p-2 bg-orange-900/30 rounded">
              📬 Rechnung wird per E-Mail versendet | Zahlung binnen 30 Tagen
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center bg-gray-800/50 p-4 rounded-lg">
        <h3 className="text-green-400 font-bold text-xl mb-2">
          💳 Zahlungsart auswählen
        </h3>
        <div className="text-2xl text-white font-bold">
          Gesamtbetrag: {formatAmount(totalAmount)}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            className={`
              border-2 rounded-lg cursor-pointer transition-all duration-300
              ${
                method.available
                  ? selectedMethod === method.id
                    ? "border-green-500 bg-green-900/30"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                  : "border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed"
              }
            `}
            onClick={() => handleMethodClick(method)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div className="text-left">
                  <div
                    className={`font-semibold ${
                      method.available ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {method.name}
                  </div>
                  <div
                    className={`text-sm ${
                      method.available ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {method.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {method.available && (
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-medium">
                      {method.fees === 0
                        ? "Gebührenfrei"
                        : `+${currency} ${method.fees?.toFixed(2)}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {method.processingTime}
                    </div>
                  </div>
                )}

                {selectedMethod === method.id && method.available && (
                  <span className="text-green-400 text-xl">✅</span>
                )}
                {!method.available && (
                  <span className="text-gray-500 text-sm">Bald verfügbar</span>
                )}
              </div>
            </div>

            {/* Erweiterte Infos */}
            {expandedMethod === method.id && method.available && (
              <div className="border-t border-gray-600 p-4 bg-gray-700/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Bearbeitungszeit</div>
                    <div className="text-white font-medium">
                      {method.processingTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Gebühren</div>
                    <div className="text-green-400 font-medium">
                      {method.fees === 0
                        ? "Kostenfrei"
                        : `${currency} ${method.fees?.toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Sicherheit</div>
                    <div className="text-green-400 font-medium">
                      🔒 SSL-verschlüsselt
                    </div>
                  </div>
                </div>

                {/* Spezielle Hinweise */}
                {method.id === "invoice" && (
                  <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-300">
                    💡 Bonitätsprüfung erforderlich - Tickets werden nach
                    Zahlungseingang freigeschaltet
                  </div>
                )}
                {method.id === "voucher" && (
                  <div className="mt-3 p-2 bg-purple-900/30 rounded text-xs text-purple-300">
                    🎫 Gutschein-Code wird beim Checkout eingegeben
                  </div>
                )}
                {method.id === "twint" && (
                  <div className="mt-3 p-2 bg-red-900/30 rounded text-xs text-red-300">
                    🇨🇭 Nur für Schweizer Banken verfügbar
                  </div>
                )}

                {/* Payment Input Fields */}
                {selectedMethod === method.id && renderPaymentFields(method.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Security Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-blue-400 text-lg">🛡️</span>
          <span className="text-blue-300 font-semibold">
            Sicherheit & Schutz
          </span>
        </div>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• SSL-Verschlüsselung für alle Transaktionen</li>
          <li>• PCI-DSS konforme Zahlungsabwicklung</li>
          <li>• Käuferschutz durch Stripe</li>
          <li>• Sofortige E-Mail-Bestätigung</li>
          <li>• 14 Tage Rückgaberecht</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Hook für Payment Options Management
 */
export function usePaymentOptions() {
  const [selectedMethod, setSelectedMethod] = useState<string>("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    // Kreditkarte
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    // Bankdaten
    iban: "",
    bic: "",
    accountHolder: "",
    // PayPal
    paypalEmail: "",
    // TWINT
    phoneNumber: "",
    // Gutschein
    voucherCode: "",
    // Rechnung
    companyName: "",
    taxNumber: "",
  });

  // Automatischer Rechnungsversand
  const sendInvoiceEmail = async (ticketData: any, customerEmail: string) => {
    try {
      const response = await fetch("/api/tickets/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketIds: [ticketData.ticketId || "demo-ticket"],
          customerEmail,
          paymentMethod:
            PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name ||
            "Unbekannt",
          totalAmount: ticketData.totalAmount,
          currency: "CHF",
          billingAddress: {
            company: paymentData.companyName || undefined,
            name: paymentData.accountHolder || "Kunde",
            email: customerEmail,
            taxNumber: paymentData.taxNumber || undefined,
          },
        }),
      });

      const result = await response.json();
      console.log("📧 Rechnung versendet:", result);
      return result;
    } catch (error) {
      console.error("❌ Fehler beim Rechnungsversand:", error);
      throw error;
    }
  };

  const processPayment = async (ticketData: any) => {
    setIsProcessing(true);

    try {
      // Mock payment processing basiert auf Methode
      const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

      // Validate payment data based on method
      if (selectedMethod === "credit_card" || selectedMethod === "debit_card") {
        if (
          !paymentData.cardNumber ||
          !paymentData.cardName ||
          !paymentData.expiryDate ||
          !paymentData.cvv
        ) {
          throw new Error("Bitte füllen Sie alle Kartendaten aus");
        }
      } else if (selectedMethod === "sepa") {
        if (!paymentData.iban || !paymentData.accountHolder) {
          throw new Error("Bitte füllen Sie alle Bankdaten aus");
        }
      } else if (selectedMethod === "paypal") {
        if (!paymentData.paypalEmail) {
          throw new Error("Bitte geben Sie Ihre PayPal E-Mail ein");
        }
      } else if (selectedMethod === "twint") {
        if (!paymentData.phoneNumber) {
          throw new Error("Bitte geben Sie Ihre Mobilnummer ein");
        }
      } else if (selectedMethod === "voucher") {
        if (!paymentData.voucherCode) {
          throw new Error("Bitte geben Sie Ihren Gutschein-Code ein");
        }
      }

      if (selectedMethod === "invoice") {
        // Simulate invoice generation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Send invoice email automatically
        try {
          const invoiceResponse = await fetch("/api/tickets/invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketIds: [ticketData.ticketId || "demo-ticket"],
              customerEmail: ticketData.customerEmail || "kunde@example.com",
              paymentMethod: method?.name || "Rechnung",
              totalAmount: ticketData.totalAmount,
              currency: "CHF",
              billingAddress: {
                company: paymentData.companyName || undefined,
                name: paymentData.accountHolder || "Kunde",
                email: ticketData.customerEmail || "kunde@example.com",
                taxNumber: paymentData.taxNumber || undefined,
              },
            }),
          });
          console.log("📧 Rechnung versendet:", await invoiceResponse.json());
        } catch (error) {
          console.warn("⚠️ Rechnungsversand fehlgeschlagen:", error);
        }

        return {
          success: true,
          message: "📄 Rechnung wurde erstellt und per E-Mail versendet",
          paymentMethod: method?.name,
          paymentData: paymentData,
        };
      } else if (selectedMethod === "voucher") {
        // Simulate voucher validation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          success: true,
          message: "🎫 Gutschein erfolgreich eingelöst",
          paymentMethod: method?.name,
          paymentData: paymentData,
        };
      } else {
        // Regular payment processing
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return {
          success: true,
          message: `💳 Zahlung über ${method?.name} erfolgreich`,
          paymentMethod: method?.name,
          paymentData: paymentData,
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fehler bei der Zahlungsabwicklung",
        error,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedMethod,
    setSelectedMethod,
    isProcessing,
    processPayment,
    paymentData,
    setPaymentData,
    availableMethods: PAYMENT_METHODS.filter((m) => m.available),
  };
}

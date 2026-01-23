"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentResult {
  sessionId: string;
  paymentStatus: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  testMode: boolean;
}

function SuccessContent() {
  const [paymentData, setPaymentData] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setError("Keine Session ID gefunden");
      setLoading(false);
      return;
    }

    // Payment Status von Stripe abrufen
    fetch(`/api/payments/stripe/checkout?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPaymentData(data);
        }
      })
      .catch((err) => {
        setError("Fehler beim Laden der Payment-Daten");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-orange-500 mx-auto mb-8"></div>
          <h2 className="text-2xl text-white font-bold mb-4">
            Payment wird verarbeitet...
          </h2>
          <p className="text-gray-400">
            Bitte warten Sie, während wir Ihre Zahlung bestätigen.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-8">❌</div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Fehler bei der Zahlung
          </h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <Link
            href="/tickets"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Zurück zu Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-8">🎉</div>
          <h1 className="text-5xl font-bold text-green-400 mb-4">
            Payment Erfolgreich!
          </h1>
          <p className="text-xl text-gray-300">
            Ihre Metal3DCore Tickets wurden erfolgreich gekauft!
          </p>
        </div>

        {/* Payment Details */}
        {paymentData && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-green-500/30 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                💳 Payment Details
                {paymentData.testMode && (
                  <span className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    TEST MODE
                  </span>
                )}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Session ID</div>
                  <div className="text-white font-mono text-sm bg-gray-700/50 p-2 rounded">
                    {paymentData.sessionId.slice(0, 20)}...
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="text-green-400 font-bold">
                    ✅ {paymentData.paymentStatus.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <div className="text-white">{paymentData.customerEmail}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Betrag</div>
                  <div className="text-2xl font-bold text-green-400">
                    €{(paymentData.totalAmount / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Mode Info */}
            {paymentData.testMode && (
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  🧪 Test-Modus Information
                </h3>
                <p className="text-gray-300 mb-4">
                  Diese Transaktion wurde im Stripe Test-Modus durchgeführt.
                  <strong> Es wurde kein echtes Geld abgebucht!</strong>
                </p>
                <div className="text-sm text-gray-400">
                  <div>• Ideal für Demos und Entwicklung</div>
                  <div>• Vollständiger Stripe-Flow ohne echte Zahlungen</div>
                  <div>• PDF-Tickets funktionieren trotzdem normal</div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-orange-400 mb-3">
                📧 Nächste Schritte
              </h3>
              <div className="space-y-2 text-gray-300">
                <div>✅ PDF-Tickets werden automatisch generiert</div>
                <div>✅ Email-Bestätigung wird versendet</div>
                <div>✅ QR-Codes für Mobile-Zugang erstellt</div>
                <div>✅ Account wurde mit Ticket-Berechtigung aktualisiert</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-x-4">
              <Link
                href="/"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-colors inline-block"
              >
                🏠 Zurück zur 3D-Platform
              </Link>

              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-colors inline-block"
              >
                📋 Meine Tickets anzeigen
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>🎸 Metal3DCore Platform - The Ultimate 3D Metal Experience</p>
        </div>
      </div>
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">🎫 Lade Payment-Daten...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

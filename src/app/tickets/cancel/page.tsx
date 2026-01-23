"use client";

import Link from "next/link";

export default function StripeCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-16">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-8">😔</div>
          <h1 className="text-5xl font-bold text-red-400 mb-4">
            Payment Abgebrochen
          </h1>
          <p className="text-xl text-gray-300">
            Der Ticket-Kauf wurde abgebrochen oder unterbrochen.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Info Box */}
          <div className="bg-gray-800/50 rounded-2xl p-8 border border-red-500/30 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              🎫 Was passiert jetzt?
            </h2>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">•</span>
                <div>
                  <strong>Keine Zahlung erfolgt:</strong> Es wurde kein Geld
                  abgebucht
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">•</span>
                <div>
                  <strong>Keine Tickets reserviert:</strong> Die gewählten
                  Tickets sind wieder verfügbar
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-red-400 text-xl">•</span>
                <div>
                  <strong>Kein Account-Update:</strong> Ihre Berechtigung wurde
                  nicht geändert
                </div>
              </div>
            </div>
          </div>

          {/* Retry Options */}
          <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-orange-400 mb-3">
              🔄 Möchten Sie es erneut versuchen?
            </h3>
            <p className="text-gray-300 mb-4">
              Sie können jederzeit zum Ticket-Kauf zurückkehren und es erneut
              versuchen. Alle Ihre Daten bleiben erhalten.
            </p>

            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mt-4">
              <h4 className="text-blue-400 font-bold mb-2">
                🧪 Test-Mode Hinweise:
              </h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>
                  • Verwenden Sie Test-Kreditkarten: 4242 4242 4242 4242
                </div>
                <div>• Beliebiges Zukunftsdatum und CVV</div>
                <div>• Kein echtes Geld wird abgebucht</div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="bg-gray-700/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-3">
              ❓ Häufige Probleme
            </h3>

            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <strong>Zahlung fehlgeschlagen:</strong> Überprüfen Sie Ihre
                Kartendaten oder verwenden Sie eine andere Karte
              </div>

              <div>
                <strong>Browser-Probleme:</strong> Deaktivieren Sie
                Pop-up-Blocker für diese Seite
              </div>

              <div>
                <strong>Netzwerk-Timeout:</strong> Überprüfen Sie Ihre
                Internetverbindung
              </div>
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
              href="/?room=ticket"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-colors inline-block"
            >
              🎫 Ticket-Kauf wiederholen
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="text-center mt-16">
          <div className="bg-gray-800/30 inline-block rounded-lg p-6 border border-gray-600">
            <h4 className="text-white font-bold mb-2">🆘 Support benötigt?</h4>
            <p className="text-gray-400 text-sm">
              Kontaktieren Sie uns über das Contact-Stage in der 3D-Platform
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>🎸 Metal3DCore Platform - The Ultimate 3D Metal Experience</p>
        </div>
      </div>
    </div>
  );
}

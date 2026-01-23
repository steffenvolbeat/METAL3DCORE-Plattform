"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  useEffect(() => {
    // Suppress any hydration mismatches for this error page
    const suppressErrors = () => {
      // Do nothing - just prevent hydration issues
    };
    suppressErrors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* Large 404 Display */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
            404
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full"></div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">🎸 Diese Seite wurde nicht gefunden</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Die angeforderte Seite existiert nicht oder wurde verschoben. Kehre zurück zur Metal3DCore Platform.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Zur Startseite
          </Link>

          <div className="text-gray-400 text-sm">oder nutze die Navigation oben</div>
        </motion.div>

        {/* Background Decoration */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl -z-10"
        />
      </motion.div>
    </div>
  );
}

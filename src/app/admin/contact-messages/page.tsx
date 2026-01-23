"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "IN_PROGRESS" | "RESPONDED" | "CLOSED" | "SPAM";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  isSpam: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  respondedBy?: {
    id: string;
    name: string;
  };
  replies: ContactReply[];
}

interface ContactReply {
  id: string;
  content: string;
  isInternal: boolean;
  sentByEmail: boolean;
  createdAt: string;
  admin: {
    id: string;
    name: string;
  };
}

interface Stats {
  NEW?: number;
  READ?: number;
  IN_PROGRESS?: number;
  RESPONDED?: number;
  CLOSED?: number;
  SPAM?: number;
}

export default function AdminContactMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [replyContent, setReplyContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auth Check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (
      session?.user &&
      session.user.role &&
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch Messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/contact-messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, statusFilter, priorityFilter, searchQuery]);

  // Send Reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    setSendingReply(true);
    try {
      const response = await fetch("/api/admin/contact-messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          content: replyContent,
          isInternal,
          sendEmail: !isInternal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplyContent("");
        setIsInternal(false);
        fetchMessages();
        // Refresh selected message
        const updatedMessage = messages.find(
          (m) => m.id === selectedMessage.id
        );
        if (updatedMessage) {
          setSelectedMessage({
            ...updatedMessage,
            replies: [...updatedMessage.replies, data.data],
          });
        }
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("Fehler beim Senden der Antwort");
    } finally {
      setSendingReply(false);
    }
  };

  // Update Status
  const updateStatus = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status: newStatus }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, status: newStatus as any } : null
          );
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Update Priority
  const updatePriority = async (messageId: string, newPriority: string) => {
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, priority: newPriority }),
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="section-card max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-theme-primary">Lade Support-Nachrichten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary py-12">
      <div className="app-shell space-y-8">
        {/* Header */}
        <header className="section-card text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">📧</span>
            <h1 className="panel-heading text-3xl sm:text-4xl">
              Contact Message Management
            </h1>
          </div>
          <p className="text-theme-secondary max-w-2xl mx-auto">
            Support Ticket System - GDPR-Compliant & Secure
          </p>
        </header>

        {/* Stats Bar */}
        <section className="section-card">
          <h2 className="panel-heading text-xl mb-4 text-center">
            📊 Status Overview
          </h2>
          <div className="content-grid">
            {Object.entries(stats).map(([status, count]) => (
              <div
                key={status}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? "" : status)
                }
                className={`glass-panel p-4 text-center cursor-pointer transition-all hover:-translate-y-1 ${
                  statusFilter === status ? "ring-2 ring-orange-500" : ""
                }`}
              >
                <div className="text-3xl font-bold text-orange-400">
                  {count}
                </div>
                <div className="text-sm text-theme-secondary mt-2 uppercase tracking-wide">
                  {status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Messages List */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="glass-panel p-6 mx-2">
              <h3 className="panel-heading text-lg mb-4">🔍 Filter & Suche</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="🔍 Suche: Name, Email, Betreff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-orange-500 transition-colors"
                />

                <div className="action-row">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="flex-1 px-4 py-3 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-orange-500"
                  >
                    <option value="">✓ Alle Prioritäten</option>
                    <option value="LOW">Niedrig</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Hoch</option>
                    <option value="URGENT">Dringend</option>
                  </select>

                  <button
                    onClick={() => {
                      setStatusFilter("");
                      setPriorityFilter("");
                      setSearchQuery("");
                    }}
                    className="button-secondary px-6 py-3"
                  >
                    ✕ Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div>
              <h3 className="panel-heading text-lg mb-6">
                📬 Nachrichten ({messages.length})
              </h3>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="glass-panel p-8 text-center mx-2">
                    <p className="text-theme-secondary text-lg">
                      📭 Keine Nachrichten gefunden
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`glass-panel p-6 mx-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg text-center ${
                        selectedMessage?.id === msg.id
                          ? "ring-2 ring-orange-500 bg-orange-500/5"
                          : ""
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap justify-center">
                            <span
                              className={`chip text-xs font-bold ${
                                msg.priority === "URGENT"
                                  ? "bg-red-500 text-white"
                                  : msg.priority === "HIGH"
                                  ? "bg-orange-500 text-white"
                                  : msg.priority === "NORMAL"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {msg.priority}
                            </span>
                            <span
                              className={`chip text-xs ${
                                msg.status === "NEW"
                                  ? "bg-green-900/50 text-green-300 border border-green-500/30"
                                  : msg.status === "IN_PROGRESS"
                                  ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30"
                                  : msg.status === "RESPONDED"
                                  ? "bg-blue-900/50 text-blue-300 border border-blue-500/30"
                                  : msg.status === "CLOSED"
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-red-900/50 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>

                          <div className="text-xs text-theme-secondary whitespace-nowrap">
                            🕒{" "}
                            {new Date(msg.createdAt).toLocaleDateString(
                              "de-DE"
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-bold text-theme-primary text-base break-words">
                            {msg.subject}
                          </h3>
                          <p className="text-sm text-theme-secondary break-words">
                            👤 {msg.name} • 📧 {msg.email}
                          </p>
                        </div>

                        <p className="text-sm text-theme-secondary line-clamp-3 break-words mx-auto max-w-prose">
                          {msg.message}
                        </p>

                        {msg.replies.length > 0 && (
                          <div className="pt-2 border-t border-theme-secondary">
                            <span className="text-sm text-orange-400">
                              💬 {msg.replies.length} Antwort(en)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail & Reply */}
          <div className="space-y-4">
            {selectedMessage ? (
              <div className="glass-panel p-6 mx-2 sticky top-4">
                <div className="space-y-5">
                  {/* Header */}
                  <div>
                    <h2 className="panel-heading text-xl mb-3 break-words">
                      📋 {selectedMessage.subject}
                    </h2>
                    <div className="glass-panel p-4 space-y-2 text-sm text-theme-secondary text-center">
                      <p className="break-words">
                        👤 <strong>Von:</strong> {selectedMessage.name}
                      </p>
                      <p className="break-words">
                        📧 <strong>Email:</strong> {selectedMessage.email}
                      </p>
                      <p>
                        🕒 <strong>Erstellt:</strong>{" "}
                        {new Date(selectedMessage.createdAt).toLocaleString(
                          "de-DE"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Control */}
                  <div>
                    <label className="block text-sm font-bold text-theme-primary mb-2 text-center">
                      📊 Status:
                    </label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) =>
                        updateStatus(selectedMessage.id, e.target.value)
                      }
                      className="w-full px-4 py-3 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-orange-500 transition-colors text-center"
                    >
                      <option value="NEW">🆕 Neu</option>
                      <option value="READ">👁️ Gelesen</option>
                      <option value="IN_PROGRESS">⏳ In Bearbeitung</option>
                      <option value="RESPONDED">✅ Beantwortet</option>
                      <option value="CLOSED">🔒 Abgeschlossen</option>
                      <option value="SPAM">🚫 Spam</option>
                    </select>
                  </div>

                  {/* Priority Control */}
                  <div>
                    <label className="block text-sm font-bold text-theme-primary mb-2 text-center">
                      🎯 Priorität:
                    </label>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) =>
                        updatePriority(selectedMessage.id, e.target.value)
                      }
                      className="w-full px-4 py-3 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-orange-500 transition-colors text-center"
                    >
                      <option value="LOW">🟢 Niedrig</option>
                      <option value="NORMAL">🔵 Normal</option>
                      <option value="HIGH">🟠 Hoch</option>
                      <option value="URGENT">🔴 Dringend</option>
                    </select>
                  </div>

                  {/* Original Message */}
                  <div>
                    <h3 className="text-sm font-bold text-theme-primary mb-2 text-center">
                      💬 Nachricht:
                    </h3>
                    <div className="glass-panel p-4 text-center">
                      <p className="text-sm text-theme-primary whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Replies History */}
                  {selectedMessage.replies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-theme-primary mb-2">
                        📜 Verlauf ({selectedMessage.replies.length}):
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedMessage.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`glass-panel p-3 text-sm ${
                              reply.isInternal
                                ? "border-l-4 border-yellow-500"
                                : "border-l-4 border-blue-500"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-theme-primary">
                                👤 {reply.admin.name}
                              </span>
                              <span className="text-xs text-theme-secondary">
                                {new Date(reply.createdAt).toLocaleString(
                                  "de-DE"
                                )}
                              </span>
                            </div>
                            <p className="text-theme-primary whitespace-pre-wrap">
                              {reply.content}
                            </p>
                            {reply.isInternal && (
                              <span className="inline-block mt-2 chip bg-yellow-900/50 text-yellow-300 text-xs">
                                🔒 Interne Notiz
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="space-y-3 pt-4 border-t border-theme-secondary">
                    <h3 className="text-sm font-bold text-theme-primary">
                      ✍️ Antwort schreiben:
                    </h3>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Ihre Antwort hier eingeben..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary text-center placeholder:text-center resize-none focus:outline-none focus:border-orange-500 transition-colors"
                    />

                    <label className="flex items-center gap-3 text-sm text-theme-primary cursor-pointer hover:text-yellow-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="w-5 h-5 accent-yellow-500"
                      />
                      <span>
                        🔒 Interne Notiz (keine E-Mail-Benachrichtigung)
                      </span>
                    </label>

                    <button
                      onClick={handleSendReply}
                      disabled={!replyContent.trim() || sendingReply}
                      className="button-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingReply ? (
                        <>
                          <span className="inline-block animate-spin mr-2">
                            ⏳
                          </span>
                          Wird gesendet...
                        </>
                      ) : isInternal ? (
                        "💾 Notiz speichern"
                      ) : (
                        "📧 Antwort senden"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-12 mx-2 text-center">
                <span className="text-6xl mb-4 block">📬</span>
                <p className="text-theme-secondary text-lg">
                  Wähle eine Nachricht aus,
                  <br />
                  um Details zu sehen
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

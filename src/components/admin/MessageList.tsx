"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Trash2, Loader2 } from "lucide-react";
import { setMessageRead, deleteMessage } from "@/app/actions/admin";

export type MessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function MessageList({ messages }: { messages: MessageRecord[] }) {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-black)", marginBottom: "24px" }}>
        İletişim Mesajları
      </h1>

      {messages.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--color-gray-500)",
          }}
        >
          Henüz mesaj bulunmuyor.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}

      <style>{`
        .spin { animation: kutuklu-spin 1s linear infinite; }
        @keyframes kutuklu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function MessageCard({ message }: { message: MessageRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${message.isRead ? "var(--color-border)" : "var(--color-gold)"}`,
        borderRadius: "12px",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: "var(--color-black)", marginBottom: "3px" }}>
            {message.subject || "Konu belirtilmemiş"}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
            <strong>{message.name}</strong> ·{" "}
            <a href={`mailto:${message.email}`} style={{ color: "var(--color-green)" }}>
              {message.email}
            </a>{" "}
            · {new Date(message.createdAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setMessageRead(message.id, !message.isRead))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "var(--color-gray-100)",
              border: "none",
              color: "var(--color-gray-700)",
              padding: "7px 12px",
              borderRadius: "5px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {pending ? (
              <Loader2 size={13} className="spin" />
            ) : message.isRead ? (
              <Mail size={13} />
            ) : (
              <MailOpen size={13} />
            )}
            {message.isRead ? "Okunmadı yap" : "Okundu yap"}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Mesaj silinsin mi?")) return;
              run(() => deleteMessage(message.id));
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#FEE2E2",
              border: "none",
              color: "#DC2626",
              padding: "7px 12px",
              borderRadius: "5px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Trash2 size={13} /> Sil
          </button>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--color-gray-700)",
          lineHeight: 1.7,
          margin: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {message.message}
      </p>
    </div>
  );
}

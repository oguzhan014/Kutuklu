import { prisma } from "@/lib/prisma";
import { MessageList, type MessageRecord } from "@/components/admin/MessageList";

export const metadata = {
  title: "Mesajlar | Kütüklü Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    // Okunmayanlar en üstte.
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const serialized: MessageRecord[] = messages.map((message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  }));

  return <MessageList messages={serialized} />;
}

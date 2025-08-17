import { ChatMessage } from "@repo/types";
import { CheckCheck } from "lucide-react"; // ✅ install lucide-react

export default function ChatMessageContainer({
  messages,
  clientId,
}: {
  messages: ChatMessage[];
  clientId: string;
}) {
  return (
    <section className="flex flex-col gap-3 p-4 h-full overflow-y-auto flex-1">
      {messages.map((message, i) => {
        const isOwnMessage = message.username === clientId;

        return (
          <div
            key={`${message.timestamp}_${i}`}
            className={`flex flex-col max-w-[75%] ${
              isOwnMessage ? "self-end items-end" : "self-start items-start"
            }`}
          >
            {/* Username + timestamp */}
            <p className="text-xs text-zinc-400 mb-1">
              <span className="font-medium text-zinc-500">
                {message.username?.slice(0, 8)}
              </span>{" "}
              •{" "}
              <span className="text-zinc-400">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>

            {/* Chat bubble */}
            <div
              className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
                isOwnMessage
                  ? "bg-green-500 text-white"
                  : "bg-zinc-200 text-zinc-800"
              }`}
            >
              {message.message}

              {/* ✅ Delivered checkmark */}
              {isOwnMessage && (
                <span className="absolute -bottom-4 right-1 flex items-center text-green-600 text-xs">
                  <CheckCheck size={14} strokeWidth={2} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

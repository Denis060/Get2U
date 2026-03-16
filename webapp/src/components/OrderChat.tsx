import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrderChatProps {
  orderId: string;
  currentUserId: string;
}

type MessageResponse = {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; email: string; image: string | null; role: string };
};

type OptimisticMessage = MessageResponse & { optimistic?: boolean };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ msg, isOwn }: { msg: OptimisticMessage; isOwn: boolean }) {
  const isAdmin = msg.sender.role === "admin";
  return (
    <div className={cn("flex flex-col gap-1 max-w-[80%]", isOwn ? "items-end self-end" : "items-start self-start")}>
      <div className="flex items-center gap-1.5">
        {!isOwn ? (
          <span className="text-[11px] font-medium text-muted-foreground">{msg.sender.name}</span>
        ) : null}
        {isAdmin ? (
          <span className="rounded px-1 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">Admin</span>
        ) : null}
      </div>
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm leading-snug shadow-sm",
          isOwn
            ? "bg-orange-500 text-white rounded-br-sm"
            : isAdmin
            ? "bg-purple-50 border border-purple-200 text-purple-900 rounded-bl-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm",
          msg.optimistic ? "opacity-60" : ""
        )}
      >
        {msg.content}
      </div>
      <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
    </div>
  );
}

export default function OrderChat({ orderId, currentUserId }: OrderChatProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", orderId],
    queryFn: () => api.get<MessageResponse[]>(`/api/orders/${orderId}/messages`),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/orders/${orderId}/messages`, { content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["messages", orderId] });
      const previous = queryClient.getQueryData<MessageResponse[]>(["messages", orderId]) ?? [];
      const optimistic: OptimisticMessage = {
        id: `optimistic-${Date.now()}`,
        orderId,
        senderId: currentUserId,
        content,
        createdAt: new Date().toISOString(),
        sender: { id: currentUserId, name: "You", email: "", image: null, role: "user" },
        optimistic: true,
      };
      queryClient.setQueryData<OptimisticMessage[]>(["messages", orderId], [...previous, optimistic]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["messages", orderId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", orderId] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Messages area */}
      <div className="h-[420px] overflow-y-auto flex flex-col gap-3 pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          (messages as OptimisticMessage[]).map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isOwn={msg.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex gap-2 items-center border-t border-border pt-3">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm"
          disabled={sendMutation.isPending}
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
        >
          {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

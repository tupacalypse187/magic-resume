"use client";

import { ChatSession } from "@/types/review";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/compat/client";

interface ChatSessionListProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatSessionList({ sessions, activeSessionId, onSelect, onDelete }: ChatSessionListProps) {
  const t = useTranslations("aiChat");

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        {t("noSessions")}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[200px]">
      <div className="p-2 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group",
              "hover:bg-muted/50 transition-colors",
              session.id === activeSessionId && "bg-primary/10"
            )}
            onClick={() => onSelect(session.id)}
          >
            <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">
                {session.title || "New Chat"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

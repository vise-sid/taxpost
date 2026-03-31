"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
};

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white px-4 py-3">
      <div className="mx-auto flex max-w-[600px] items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 flex-1 rounded-xl border-2 bg-neutral-50 px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-navy focus:bg-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white transition-all hover:bg-brand-navy/90 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

'use client';

import { FormEvent, useState } from 'react';

interface ComposerProps {
  disabled: boolean;
  onSend: (body: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export function Composer({
  disabled,
  onSend,
  onTypingStart,
  onTypingStop,
}: ComposerProps) {
  const [value, setValue] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = value.trim();
    if (!body) {
      return;
    }
    onSend(body);
    setValue('');
    onTypingStop();
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
    >
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder="Write a message"
        onChange={(event) => {
          setValue(event.target.value);
          if (event.target.value) {
            onTypingStart();
          } else {
            onTypingStop();
          }
        }}
        onBlur={onTypingStop}
        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}

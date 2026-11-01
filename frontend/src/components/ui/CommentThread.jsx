import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { formatDate } from '../../lib/format';

/**
 * Enterprise Internal Notes & Comment Thread
 */
export function CommentThread({
  comments = [], // Array of { id, text, authorName, authorRole, timestamp }
  onAddComment = null,
  currentUser = null,
  className = '',
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !onAddComment) return;

    onAddComment({
      id: `comment-${Date.now()}`,
      text: inputText.trim(),
      authorName: currentUser?.name || 'Authorized Staff',
      authorRole: currentUser?.role || 'Staff',
      timestamp: new Date().toISOString(),
    });
    setInputText('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            <MessageSquare className="w-5 h-5 mx-auto mb-1 opacity-40" />
            <span>No internal comments or notes yet.</span>
          </div>
        ) : (
          comments.map((c) => {
            const initials = (c.authorName || 'Staff')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={c.id} className="p-3 rounded-lg bg-slate-50/70 border border-border flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-text-main truncate">
                      {c.authorName}{' '}
                      {c.authorRole && (
                        <span className="font-normal text-[10px] text-text-muted">
                          ({c.authorRole})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {formatDate(c.timestamp, { formatStr: 'dd MMM, hh:mm a' })}
                    </span>
                  </div>
                  <p className="text-xs text-text-main leading-relaxed whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add internal note or operational comment..."
            className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-lg text-text-main placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3.5 py-2 rounded-lg bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
}

// src/components/blog/CommentSection.jsx
"use client";

import { useState } from "react";
import { MessageSquare, Reply, Send, CheckCircle2 } from "lucide-react";

export default function CommentSection({ comments = [] }) {
  const [replyTo, setReplyTo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", content: "" });
    setReplyTo(null);
  };

  return (
    <section className="mt-16 bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl font-[family-name:var(--font-farsi)]">
      <div className="flex items-center gap-2 font-black text-xl md:text-2xl mb-6 border-b-[3px] border-black pb-3">
        <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        <span>دیدگاه کاربران و پرسش و پاسخ</span>
      </div>

      {/* پیام تایید ثبت کامنت */}
      {submitted && (
        <div className="bg-[#12e2a3] border-[2.5px] border-black p-4 rounded-xl mb-6 font-bold text-sm flex items-center gap-2 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>
            دیدگاه شما با موفقیت ثبت شد و پس از تایید مدیریت نمایش داده خواهد
            شد.
          </span>
        </div>
      )}

      {/* فرم ثبت نظر */}
      <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-4">
        {replyTo && (
          <div className="bg-[#fff9c4] border-[2px] border-black p-2.5 rounded-lg text-xs font-black flex items-center justify-between">
            <span>در پاسخ به نظر: {replyTo.authorName}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-red-600 hover:underline"
            >
              انصراف
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            required
            placeholder="نام و نام خانوادگی"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
          />
          <input
            type="email"
            required
            placeholder="ایمیل (نمایش داده نمی‌شود)"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all"
          />
        </div>

        <textarea
          required
          rows={4}
          placeholder="دیدگاه یا سوال خود را اینجا بنویسید..."
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:shadow-[-3px_3px_0_0_rgba(0,0,0,1)] transition-all resize-none"
        />

        <button
          type="submit"
          className="self-start bg-[#ccff00] hover:bg-[#b5e600] border-[2.5px] border-black rounded-xl px-6 py-3 font-black text-sm shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
        >
          <span>ارسال دیدگاه</span>
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      {/* لیست کامنت‌های ثبت‌شده */}
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-[#f8f9fa] border-[2.5px] border-black rounded-xl p-4 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm">{comment.authorName}</span>
              <button
                onClick={() => setReplyTo(comment)}
                className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:underline"
              >
                <Reply className="w-3.5 h-3.5" />
                پاسخ
              </button>
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

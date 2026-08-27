// src/app/dashboard/tickets/page.js
"use client";

import { useState } from "react";
import { Ticket, Plus, Send, MessageSquare, CheckCircle2, Clock } from "lucide-react";

export default function DashboardTicketsPage() {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [tickets, setTickets] = useState([
    {
      id: "TCK-102",
      subject: "سوال در مورد اتصال به اکانت چت جی پی تی",
      orderId: "BL-98421",
      status: "ANSWERED", // ANSWERED | PENDING
      date: "۲۳ مرداد ۱۴۰۵",
      messages: [
        { sender: "user", text: "سلام، IP آلمان برای این اکانت نیازه؟", time: "۱۴:۲۰" },
        { sender: "support", text: "سلام وقت بخیر. بله آی‌پی ثابت آلمان یا آمریکا توصیه میشه.", time: "۱۴:۳۵" },
      ],
    },
  ]);

  const [newSubject, setNewSubject] = useState("");
  const [newOrderId, setNewOrderId] = useState("BL-98421");
  const [newMessage, setNewMessage] = useState("");

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;

    const createdTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      subject: newSubject,
      orderId: newOrderId,
      status: "PENDING",
      date: "امروز",
      messages: [{ sender: "user", text: newMessage, time: "همین الان" }],
    };

    setTickets([createdTicket, ...tickets]);
    setNewSubject("");
    setNewMessage("");
    setShowNewTicketForm(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* هدر بخش تیکت‌ها */}
      <div className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black">پشتیبانی و تیکت‌ها</h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            در صورت بروز مشکل در اکانت یا سوال قبل و بعد خرید، تیکت بگذارید.
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="bg-[#ccff00] hover:bg-[#b5e600] border-[2.5px] border-black px-4 py-2.5 rounded-xl font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer text-black"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ارسال تیکت جدید</span>
        </button>
      </div>

      {/* فرم ثبت تیکت جدید */}
      {showNewTicketForm && (
        <form
          onSubmit={handleCreateTicket}
          className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4"
        >
          <h3 className="font-black text-base border-b-[2px] border-black pb-2">ثبت درخواست پشتیبانی جدید</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black">موضوع تیکت:</label>
              <input
                type="text"
                required
                placeholder="مثال: مشکل در ورود به اکانت"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="bg-[#f8f9fa] border-[2px] border-black rounded-xl p-3 text-xs font-bold outline-none focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black">مربوط به کدام سفارش؟</label>
              <select
                value={newOrderId}
                onChange={(e) => setNewOrderId(e.target.value)}
                className="bg-[#f8f9fa] border-[2px] border-black rounded-xl p-3 text-xs font-bold outline-none focus:bg-white"
              >
                <option value="BL-98421">سفارش BL-98421 (ChatGPT Plus)</option>
                <option value="none">سوال عمومی پیش از خرید</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black">متن کامل پیام شما:</label>
            <textarea
              required
              rows={4}
              placeholder="توضیحات دقیق خطا یا سوال خود را اینجا بنویسید..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="bg-[#f8f9fa] border-[2px] border-black rounded-xl p-3 text-xs font-bold outline-none focus:bg-white resize-none"
            />
          </div>

          <button
            type="submit"
            className="self-start bg-[#12e2a3] border-[2.5px] border-black px-6 py-2.5 rounded-xl font-black text-xs shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>ثبت و ارسال تیکت</span>
          </button>
        </form>
      )}

      {/* لیست تیکت‌های موجود */}
      <div className="flex flex-col gap-4">
        {tickets.map((tck) => (
          <div
            key={tck.id}
            className="bg-white border-[3.5px] border-black rounded-[24px] p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="text-xs font-black dir-ltr text-gray-500 block">{tck.id}</span>
                <h3 className="font-black text-sm md:text-base mt-0.5">{tck.subject}</h3>
              </div>

              {tck.status === "ANSWERED" ? (
                <span className="bg-[#12e2a3] border-[1.5px] border-black px-2.5 py-0.5 rounded-lg text-xs font-black">
                  پاسخ داده‌شده
                </span>
              ) : (
                <span className="bg-amber-200 border-[1.5px] border-black px-2.5 py-0.5 rounded-lg text-xs font-black">
                  در انتظار پاسخ
                </span>
              )}
            </div>

            {/* مکالمات چت داخل تیکت */}
            <div className="flex flex-col gap-3 bg-[#f8f9fa] border-[2px] border-black p-4 rounded-xl">
              {tck.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border-[1.5px] border-black max-w-[85%] text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-white border-black self-start"
                      : "bg-[#ccff00] border-black self-end"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-black">
                    <span>{msg.sender === "user" ? "شما" : "پشتیبانی بای لیمیت"}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed text-black">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
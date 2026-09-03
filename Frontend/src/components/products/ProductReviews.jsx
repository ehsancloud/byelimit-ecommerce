// Frontend/src/components/products/ProductReviews.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle2, MessageSquarePlus, Send, AlertCircle, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function ProductReviews({ reviews: initialReviews = [], average = 5, count = 0, productId }) {
  const { user } = useAuth();

  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // استعلام نظرات تاییدشده از سرور
  const fetchApprovedReviews = useCallback(async () => {
    if (!productId) return;
    try {
      const liveReviews = await apiFetch(`/api/reviews/${productId}`, { silent404: true });
      if (Array.isArray(liveReviews) && liveReviews.length > 0) {
        // ادغام نظرات اولیه و نظرات جدید سرور با حذف شناسه‌های تکراری
        const combined = [...liveReviews];
        initialReviews.forEach((initRev) => {
          if (!combined.some((c) => c.id === initRev.id)) {
            combined.push(initRev);
          }
        });
        setReviewsList(combined);
      }
    } catch {
      /* در صورت بروز خطا لیست اولیه نمایش داده می‌شود */
    }
  }, [productId, initialReviews]);

  useEffect(() => {
    fetchApprovedReviews();
  }, [fetchApprovedReviews]);

  // ثبت نظر در دیتابیس
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!comment.trim() || comment.trim().length < 3) {
      setErrorMessage("لطفاً متن نظر خود را (حداقل ۳ کاراکتر) بنویسید.");
      return;
    }

    if (!productId) {
      setErrorMessage("شناسه محصول نامعتبر است.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          authorName: authorName.trim() || user?.fullName || "کاربر بای لیمیت",
        }),
      });

      setSubmitSuccess(true);
      setComment("");
      setRating(5);
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err) {
      setErrorMessage(err.message || "خطا در ثبت نظر. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReviewsCount = reviewsList.length > 0 ? reviewsList.length : count;

  return (
    <div className="flex flex-col gap-8">
      {/* هدر بخش نظرات */}
      <div className="bg-white border-[2.5px] border-black p-5 rounded-2xl shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-black">نظرات و تجربیات خریداران</h3>
          <p className="text-xs font-bold text-gray-600 mt-1">
            میانگین امتیاز: <span className="font-black text-black">{average} از ۵</span> (ثبت‌شده توسط{" "}
            {totalReviewsCount.toLocaleString("fa-IR")} کاربر)
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(average)
                  ? "fill-amber-400 text-black stroke-[1.5]"
                  : "text-gray-300 stroke-[1]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* فرم ثبت نظر جدید */}
      <div className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b-[2px] border-black pb-3">
          <MessageSquarePlus className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
          <h4 className="font-black text-sm md:text-base">ارسال نظر و امتیاز برای این محصول</h4>
        </div>

        {submitSuccess ? (
          <div className="bg-[#ccff00] border-[2px] border-black p-4 rounded-xl flex items-center gap-3 shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
            <CheckCircle2 className="w-6 h-6 text-black stroke-[2.5] shrink-0" />
            <p className="font-black text-xs md:text-sm text-black">
              نظر شما با موفقیت ثبت شد و پس از بررسی تیم پشتیبانی در این صفحه منتشر خواهد شد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            {/* انتخاب امتیاز ستاره‌ای */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs font-black text-gray-700">امتیاز شما به کیفیت سرویس:</span>
              <div className="flex items-center gap-1.5" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-black stroke-[1.5]"
                          : "text-gray-300 stroke-[1]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* نام کاربر */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-700">نام نمایشی (اختیاری):</label>
              <input
                type="text"
                maxLength={60}
                placeholder={user?.fullName || "مثال: علی رضایی (در صورت خالی ماندن: کاربر بای لیمیت)"}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-[#f8f9fa] border-[2px] border-black rounded-xl p-3 text-xs md:text-sm font-bold outline-none focus:bg-white focus:shadow-[-2px_2px_0_0_rgba(0,0,0,1)] transition-all"
              />
            </div>

            {/* متن دیدگاه */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-gray-700">متن دیدگاه یا تجربه استفاده:</label>
              <textarea
                required
                rows={3}
                maxLength={1000}
                placeholder="نقاط قوت، سرعت تحویل اکانت و تجربه استفاده از این سرویس را بنویسید..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-[#f8f9fa] border-[2px] border-black rounded-xl p-3 text-xs md:text-sm font-bold outline-none focus:bg-white focus:shadow-[-2px_2px_0_0_rgba(0,0,0,1)] transition-all resize-none"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="self-end bg-[#ccff00] hover:bg-[#b5e600] border-[2.5px] border-black px-6 py-3 rounded-xl font-black text-xs md:text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer text-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت نظر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>ثبت و ارسال دیدگاه</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* لیست نظرات ثبت‌شده */}
      <div className="flex flex-col gap-4">
        {reviewsList.length === 0 ? (
          <div className="bg-white border-[2.5px] border-black p-8 rounded-2xl text-center shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="font-black text-sm text-gray-700">
              هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که تجربه خود را به اشتراک می‌گذارد!
            </p>
          </div>
        ) : (
          reviewsList.map((rev, index) => {
            const displayName = rev.authorName || rev.userName || "کاربر بای لیمیت";
            const formattedDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString("fa-IR")
              : "به تازگی";

            return (
              <div
                key={rev.id || index}
                className="bg-white border-[2.5px] border-black p-4 md:p-5 rounded-xl shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs md:text-sm">{displayName}</span>
                    <span className="bg-[#12e2a3] border-[1px] border-black text-black px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      خریدار تاییدشده
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5" dir="ltr">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? "fill-amber-400 text-black stroke-[1.5]"
                            : "text-gray-300 stroke-[1]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed">
                  {rev.comment}
                </p>

                <span className="text-[10px] font-bold text-gray-400 self-end">
                  {formattedDate}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
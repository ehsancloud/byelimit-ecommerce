// src/components/blog/BlogImage.jsx
import Image from "next/image";

export default function BlogImage({ src, alt, caption }) {
  return (
    <figure className="my-8 dir-rtl">
      <div className="relative w-full h-[320px] md:h-[420px] border-[3px] border-black rounded-[16px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] bg-gray-100">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs md:text-sm font-extrabold text-gray-700 bg-[#fff9c4] border-[2px] border-black rounded-lg py-1.5 px-3 inline-block mx-auto w-full">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

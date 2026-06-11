"use client";

import { Bell } from "lucide-react";

export function NoticeMarquee({ importantNews }: { importantNews: any[] }) {
  if (importantNews.length === 0) return null;

  return (
    <div className="bg-primary text-white overflow-hidden py-2 px-4 flex items-center">
      <Bell className="w-4 h-4 mr-3 flex-shrink-0 animate-pulse" />
      <span className="font-bold mr-4 shrink-0 uppercase text-xs tracking-widest">Latest:</span>
      <div className="relative flex overflow-hidden w-full">
        <div className="flex whitespace-nowrap animate-marquee gap-10">
          {[...importantNews, ...importantNews].map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-sm font-medium shrink-0">
              {item.title}
              {item.titleAssamese && ` • ${item.titleAssamese}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

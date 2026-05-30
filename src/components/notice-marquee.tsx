"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export function NoticeMarquee({ importantNews }: { importantNews: any[] }) {
  if (importantNews.length === 0) return null;

  return (
    <div className="bg-primary text-white overflow-hidden py-2 px-4 flex items-center">
      <Bell className="w-4 h-4 mr-3 flex-shrink-0 animate-pulse" />
      <span className="font-bold mr-4 shrink-0 uppercase text-xs tracking-widest">Latest:</span>
      <div className="relative flex overflow-x-hidden w-full whitespace-nowrap">
        <motion.div
          className="flex whitespace-nowrap gap-10"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {[...importantNews, ...importantNews, ...importantNews].map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-sm font-medium">
              {item.title}
              {item.titleAssamese && ` • ${item.titleAssamese}`}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

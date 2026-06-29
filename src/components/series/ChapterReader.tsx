"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List, Settings, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { BuyChapterAction } from "@/actions/points";
import { UpdateHistoryAction } from "@/actions/user";
import { AdPlayer } from "@/components/ui/AdPlayer";
import { CommentSection } from "@/components/series/CommentSection";
import { toast } from "react-hot-toast";

interface ChapterReaderProps {
  slug: string;
  initialChapter: any;
}

export function ChapterReader({ slug, initialChapter }: ChapterReaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState(initialChapter);
  const [buying, setBuying] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  
  const isFreeChapter = !chapter.isLocked;
  const showAd = isFreeChapter && !adWatched;
  
  useEffect(() => {
    setChapter(initialChapter);
  }, [initialChapter]);

  useEffect(() => {
    if (session && chapter?.seriesId && chapter?.id) {
      UpdateHistoryAction(chapter.seriesId, chapter.id).catch(console.error);
    }
  }, [session, chapter?.seriesId, chapter?.id]);

  const handleBuy = async () => {
    if (!session) {
      toast.error("Please sign in to unlock this chapter.");
      return;
    }
    setBuying(true);
    try {
      const res = await BuyChapterAction(chapter.id);
      if (res.success) {
        if ((window as any).__refreshNavPoints) {
          (window as any).__refreshNavPoints();
        }
        toast.success("Chapter unlocked successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to unlock chapter.");
      }
    } catch (error) {
      console.error("Failed to buy chapter:", error);
      toast.error("Failed to unlock chapter. Check your point balance.");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Chapter Header/Navigation */}
      <div className="sticky top-16 z-30 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <Link href={`/series/${slug}`} className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
              {chapter.series.title}
            </Link>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">
              Chapter {chapter.number} {chapter.title && `- ${chapter.title}`}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 glass glass-hover rounded-lg">
                <Settings className="w-4 h-4 text-white/70" />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-1" />
            <div className="flex items-center gap-1">
              <button 
                disabled={!chapter.prevChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)}
                className="p-2 glass glass-hover rounded-lg disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button className="px-3 py-2 glass glass-hover rounded-lg flex items-center gap-2">
                <List className="w-4 h-4 text-white/70" />
                <span className="text-xs font-bold text-white hidden sm:inline">All Chapters</span>
              </button>
              <button 
                disabled={!chapter.nextChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)}
                className="p-2 glass glass-hover rounded-lg disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <main className="flex-1 flex flex-col items-center bg-black py-4">
        <div className="max-w-[900px] w-full flex flex-col items-center px-4">
          {showAd ? (
            <div className="w-full py-10">
              <AdPlayer onAdComplete={() => setAdWatched(true)} />
            </div>
          ) : chapter.images && chapter.images.length > 0 ? (
            chapter.images.map((img: any) => (
              <img 
                key={img.id}
                src={img.url}
                alt={`Page ${img.order}`}
                className="w-full h-auto object-contain select-none pointer-events-none"
                loading="lazy"
              />
            ))
          ) : chapter.isLocked && !chapter.isPurchased ? (
            <div className="py-20 flex flex-col items-center text-center space-y-6 w-full">
               <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                 <Lock className="w-10 h-10 text-yellow-500" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white mb-2">Chapter Locked</h2>
                 <p className="text-white/60 max-w-md mx-auto">This chapter requires coins to unlock. Support the author by unlocking it now!</p>
               </div>
               <button 
                 onClick={handleBuy}
                 disabled={buying}
                 className="flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50"
               >
                 {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                 Unlock for {chapter.coinCost} Coins
               </button>
            </div>
          ) : (
            <div className="py-20 text-center text-white/30 space-y-4">
               <BookOpen className="w-12 h-12 mx-auto opacity-20" />
               <p>No images found for this chapter.</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="w-full max-w-[800px] mt-8 mb-20 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass rounded-2xl border border-white/5">
            <button 
                disabled={!chapter.prevChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.prevChapterNumber}`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-white font-bold transition-all disabled:opacity-30"
            >
                <ChevronLeft className="w-5 h-5" />
                Previous Chapter
            </button>
            <div className="text-center">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Finished Reading</p>
                <Link href={`/series/${slug}`} className="text-sm font-bold text-primary hover:underline">Back to series info</Link>
            </div>
            <button 
                disabled={!chapter.nextChapterNumber}
                onClick={() => router.push(`/series/${slug}/chapter-${chapter.nextChapterNumber}`)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-30"
            >
                Next Chapter
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <CommentSection chapterId={chapter.id} />
      </main>
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
    </svg>
);

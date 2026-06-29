"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { EarnFromAdAction } from "@/actions/points";
import { useSession } from "@/lib/auth-client";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Play, Gift, CheckCircle2, AlertCircle } from "lucide-react";

// Fallback mock ad for the final sponsored link
const MOCK_AD = { 
  id: 1, 
  title: "Super Warrior RPG", 
  sponsor: "Game Studio X", 
  image: "https://wsrv.nl/?url=cdn.meowing.org/uploads/H70SqQB-7tA&w=800",
  link: "https://example.com/sponsor-link"
};

export default function RewardsPage() {
  return (
    <Suspense fallback={null}>
      <RewardsContent />
    </Suspense>
  );
}

function RewardsContent() {
  const { data: session, isPending } = useSession();
  const searchParams = useSearchParams();

  // Ad Pack State
  const [targetAds, setTargetAds] = useState(5);
  const [watchedAds, setWatchedAds] = useState(0);
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Claim & Verification State
  const [claiming, setClaiming] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(0);

  // Initialize random target (5-15)
  const generateTarget = useCallback(() => {
    return Math.floor(Math.random() * 11) + 5; // 5 to 15
  }, []);

  useEffect(() => {
    setTargetAds(generateTarget());
  }, [generateTarget]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment successful! Your points have been added to your account.");
      if ((window as any).__refreshNavPoints) {
        (window as any).__refreshNavPoints();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  // Watch Ad Logic
  const handleWatchAd = () => {
    if (watching || watchedAds >= targetAds) return;
    
    setWatching(true);
    setProgress(0);

    const duration = 5000; // 5 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setWatching(false);
        setWatchedAds(prev => prev + 1);
        toast.success("Ad watched successfully!");
      }
    }, interval);
  };

  // Final Claim Verification Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifying && verificationTimeLeft > 0) {
      timer = setInterval(() => {
        setVerificationTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (verifying && verificationTimeLeft === 0) {
      completeReward();
    }
    return () => clearInterval(timer);
  }, [verifying, verificationTimeLeft]);

  const handleClaimClick = () => {
    setClaiming(true);
  };

  const handleFinalAdClick = () => {
    // Open sponsor link
    window.open(MOCK_AD.link, '_blank');
    
    // Start verification timer (10 to 60 seconds)
    const randomWait = Math.floor(Math.random() * 51) + 10;
    setVerificationTimeLeft(randomWait);
    setVerifying(true);
    setClaiming(false);
    toast("Verifying your visit... Please wait.", { icon: "⏳", duration: 4000 });
  };

  const completeReward = async () => {
    setVerifying(false);
    const amount = targetAds * 10;
    
    try {
      const res = await EarnFromAdAction(amount);
      if (!res.success) throw new Error(res.message);
      
      // Refresh points in navbar
      if ((window as any).__refreshNavPoints) {
        (window as any).__refreshNavPoints();
      }

      toast.success(`Success! You earned ${amount} points!`, { duration: 5000 });
      
      // Reset flow
      setTargetAds(generateTarget());
      setWatchedAds(0);
      setProgress(0);
    } catch (error) {
      console.error("Failed to earn points:", error);
      toast.error("Error earning points. Please try again.");
    }
  };

  if (isPending) return null;

  const isReadyToClaim = watchedAds >= targetAds;

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-[48rem] w-full mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading tracking-tight mb-4">Rewards Center</h1>
          <p className="text-muted-foreground text-lg">
            Complete the Ad Pack to earn massive points for your favorite series!
          </p>
        </div>

        {/* Dynamic Ad Pack Card */}
        <div className="w-full max-w-lg glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] pointer-events-none" />

          {claiming ? (
            // State 2: Final Ad Click
            <div className="flex flex-col items-center text-center space-y-6">
              <Gift className="w-16 h-16 text-yellow-500 animate-bounce" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Final Step!</h2>
                <p className="text-muted-foreground text-sm">
                  Click the sponsored banner below to claim your {targetAds * 10} points.
                </p>
              </div>
              
              <button 
                onClick={handleFinalAdClick}
                className="w-full aspect-video rounded-xl overflow-hidden relative group border-2 border-primary/30 hover:border-primary transition-colors"
              >
                <img src={MOCK_AD.image} alt={MOCK_AD.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow-xl shadow-black/50 transform group-hover:scale-110 transition-transform">
                    Click to Claim Reward
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white/70 uppercase">
                  Sponsored by {MOCK_AD.sponsor}
                </div>
              </button>
            </div>
          ) : verifying ? (
            // State 3: Verifying
            <div className="flex flex-col items-center text-center space-y-8 py-8">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                  {verificationTimeLeft}s
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verifying Visit</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Please stay on the sponsor page or wait here for the timer to finish...
                </p>
              </div>
            </div>
          ) : (
            // State 1: Watching Ads
            <div className="flex flex-col items-center space-y-8">
              {/* Progress Circle */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                    className="text-primary transition-all duration-500 ease-out"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (watchedAds / targetAds))}`}
                  />
                </svg>
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl font-bold">{watchedAds}</span>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">of {targetAds}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Ads Watched</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full space-y-4">
                {isReadyToClaim ? (
                  <button
                    onClick={handleClaimClick}
                    className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black text-lg shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Gift className="w-6 h-6" />
                    Claim {targetAds * 10} Points!
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleWatchAd}
                      disabled={watching}
                      className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {watching ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Watching...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          Watch Next Ad
                        </>
                      )}
                    </button>
                    
                    {/* Watch Progress Bar */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-75 ease-linear" 
                        style={{ width: `${watching ? progress : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex items-center gap-2 text-muted-foreground text-sm max-w-md text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You can earn points continuously by completing Ad Packs. The number of required ads is randomized between 5 and 15!
        </div>
      </main>

      <Footer />
    </div>
  );
}

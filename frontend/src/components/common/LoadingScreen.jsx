import React, { useState, useEffect } from 'react';

/**
 * Premium Khyber Motors Cinematic Loading Screen
 * 
 * Features:
 * - Full-screen deep black automotive background with subtle radial glow
 * - Centered Khyber Motors logo
 * - Elegant animated red light sweep across the logo
 * - "DRIVING INNOVATION" text with wide letter-spacing
 * - Sleek animated red progress line with glowing head
 * - Smooth fade-out on content ready
 * - Responsive for mobile and desktop
 */
export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock body scroll while loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startTime = Date.now();
    const MIN_LOAD_TIME = 1800; // Optimal duration for automotive animation (1.8s)
    const MAX_TIMEOUT = 3500;   // Safety cap so loader never hangs (3.5s)

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeFraction = Math.min(elapsed / MIN_LOAD_TIME, 1);
      
      // Cinematic automotive easing (accelerates, cruises, eases out)
      let targetProgress;
      if (timeFraction < 0.4) {
        targetProgress = Math.pow(timeFraction / 0.4, 1.8) * 45;
      } else if (timeFraction < 0.8) {
        targetProgress = 45 + ((timeFraction - 0.4) / 0.4) * 40;
      } else {
        targetProgress = 85 + ((timeFraction - 0.8) / 0.2) * 15;
      }

      setProgress(Math.min(targetProgress, 99));
    }, 25);

    const finishLoading = () => {
      clearInterval(progressInterval);
      setProgress(100);

      // Short pause at 100% before smooth fade-out
      setTimeout(() => {
        setIsFadingOut(true);
        // Wait for CSS fade-out transition to complete before unmounting
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = originalOverflow;
        }, 650);
      }, 200);
    };

    // Listen for window load or fallback timer
    let safetyTimer;
    if (document.readyState === 'complete') {
      safetyTimer = setTimeout(finishLoading, MIN_LOAD_TIME);
    } else {
      const onLoad = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(MIN_LOAD_TIME - elapsed, 0);
        safetyTimer = setTimeout(finishLoading, remaining);
      };
      window.addEventListener('load', onLoad, { once: true });
      safetyTimer = setTimeout(finishLoading, MAX_TIMEOUT);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(safetyTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505] select-none overflow-hidden transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      role="status"
      aria-label="Loading Khyber Motors"
      aria-live="polite"
    >
      {/* Cinematic Styles */}
      <style>{`
        @keyframes kmRedLightSweep {
          0% {
            transform: translateX(-140%) skewX(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(240%) skewX(-25deg);
            opacity: 0;
          }
        }

        @keyframes kmRadialPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.08);
          }
        }

        @keyframes kmTextGlow {
          0%, 100% {
            opacity: 0.85;
            letter-spacing: 0.42em;
          }
          50% {
            opacity: 1;
            letter-spacing: 0.46em;
          }
        }

        @keyframes kmFlarePulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }

        .km-sweep-beam {
          animation: kmRedLightSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .km-pulse-ambient {
          animation: kmRadialPulse 3.5s ease-in-out infinite;
        }

        .km-tracking-glow {
          animation: kmTextGlow 3s ease-in-out infinite;
        }

        .km-flare {
          animation: kmFlarePulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Atmospheric Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none km-pulse-ambient"
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(200, 16, 46, 0.16) 0%, rgba(200, 16, 46, 0.04) 38%, rgba(5, 5, 5, 0.95) 70%, #000000 100%)',
        }}
      />

      {/* Subtle Automotive Grid / Horizon Line */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_transparent_50%,_#000000_100%)] opacity-80" />
      <div className="absolute w-full h-px top-1/2 -translate-y-12 bg-gradient-to-r from-transparent via-red-900/25 to-transparent pointer-events-none" />

      {/* Center Automotive Cluster */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-sm sm:max-w-md w-full">
        
        {/* Logo Container with Red Light Sweep */}
        <div className="relative flex items-center justify-center p-3 sm:p-4 overflow-hidden rounded-xl group">
          
          {/* Backlight Glow Behind Logo */}
          <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full km-flare pointer-events-none" />

          {/* Official Khyber Motors Logo */}
          <img
            src="/logos/jac-khyber-logo.png"
            alt="Khyber Motors"
            className="h-16 sm:h-20 md:h-22 w-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(200,16,46,0.4)]"
            loading="eager"
            fetchPriority="high"
          />

          {/* High-Precision Red Light Sweep Effect */}
          <div
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
            style={{ mixBlendMode: 'screen' }}
          >
            <div
              className="absolute top-0 bottom-0 w-24 sm:w-32 km-sweep-beam"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(200, 16, 46, 0.15) 20%, rgba(230, 25, 55, 0.85) 50%, rgba(255, 255, 255, 0.95) 53%, rgba(230, 25, 55, 0.85) 56%, rgba(200, 16, 46, 0.15) 80%, transparent 100%)',
                boxShadow: '0 0 25px rgba(200, 16, 46, 0.7)',
              }}
            />
          </div>
        </div>

        {/* Cinematic Slogan Text: DRIVING INNOVATION */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center text-center">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.42em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-neutral-100 to-neutral-400 km-tracking-glow select-none pl-[0.42em]">
            DRIVING INNOVATION
          </span>
        </div>

        {/* Sleek Animated Red Progress Line */}
        <div className="mt-6 sm:mt-7 w-40 sm:w-56 flex flex-col items-center">
          <div className="w-full h-[2px] bg-neutral-900/90 rounded-full overflow-hidden relative border border-neutral-800/40 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-800 via-[#C8102E] to-red-500 relative transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(200, 16, 46, 0.85), 0 0 20px rgba(200, 16, 46, 0.4)',
              }}
            >
              {/* Glowing Laser Head at leading edge */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_#ffffff,0_0_14px_#C8102E]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;

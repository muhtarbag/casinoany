import { useEffect, useRef, useState } from 'react';

interface TriggerConditions {
  time_on_page?: number;
  scroll_depth?: number;
  exit_intent?: boolean;
  page_load?: boolean;
}

interface UseTriggerOptions {
  conditions: TriggerConditions;
  onTrigger: () => void;
}

export const useNotificationTriggers = ({ conditions, onTrigger }: UseTriggerOptions) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const pageLoadTime = useRef<number>(Date.now());
  const exitIntentShown = useRef<boolean>(false);

  // Time on page trigger
  useEffect(() => {
    if (!conditions.time_on_page || hasTriggered) return;

    const timer = setTimeout(() => {
      onTrigger();
      setHasTriggered(true);
    }, conditions.time_on_page * 1000);

    return () => clearTimeout(timer);
  }, [conditions.time_on_page, hasTriggered, onTrigger]);

  // Scroll depth trigger
  useEffect(() => {
    if (!conditions.scroll_depth || hasTriggered) return;

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= conditions.scroll_depth!) {
        onTrigger();
        setHasTriggered(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [conditions.scroll_depth, hasTriggered, onTrigger]);

  // Exit intent trigger
  useEffect(() => {
    if (!conditions.exit_intent || hasTriggered || exitIntentShown.current) return;

    // Desktop: mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        exitIntentShown.current = true;
        onTrigger();
        setHasTriggered(true);
      }
    };

    // Mobile: scroll up detection
    let lastScrollY = window.scrollY;
    let scrollUpCount = 0;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && currentScrollY < 100) {
        scrollUpCount++;
        if (scrollUpCount >= 3) {
          exitIntentShown.current = true;
          onTrigger();
          setHasTriggered(true);
        }
      } else {
        scrollUpCount = 0;
      }
      lastScrollY = currentScrollY;
    };

    // Mobile: back button detection
    const handlePopState = () => {
      if (!exitIntentShown.current) {
        exitIntentShown.current = true;
        onTrigger();
        setHasTriggered(true);
        window.history.pushState(null, '', window.location.href);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [conditions.exit_intent, hasTriggered, onTrigger]);

  // Page load trigger
  useEffect(() => {
    if (conditions.page_load && !hasTriggered) {
      onTrigger();
      setHasTriggered(true);
    }
  }, [conditions.page_load, hasTriggered, onTrigger]);

  return { hasTriggered };
};

import { OptimizedImage } from "@/components/OptimizedImage";

interface DynamicBannerProps {
  imageUrl: string;
  mobileImageUrl?: string | null;
  altText: string;
  targetUrl?: string | null;
  title: string;
}

export const DynamicBanner = ({ imageUrl, mobileImageUrl, altText, targetUrl, title }: DynamicBannerProps) => {
  // Use mobile image as fallback if desktop image is not provided
  const desktopImage = imageUrl || mobileImageUrl || '';
  
  const bannerContent = (
    <div className="relative w-full rounded-md sm:rounded-lg overflow-hidden shadow-md">
      <OptimizedImage
        src={desktopImage}
        alt={altText || title}
        className="w-full h-auto aspect-[16/9] sm:aspect-[20/9] md:aspect-[24/9]"
        objectFit="cover"
        width={1920}
        height={720}
        priority={false}
        fetchPriority="low"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
      />
    </div>
  );

  if (targetUrl) {
    return (
      <section className="w-full my-3 md:my-6 lg:my-8 px-4 sm:px-0">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform active:scale-[0.98] md:hover:scale-[1.01]"
        >
          {bannerContent}
        </a>
      </section>
    );
  }

  return (
    <section className="w-full my-3 md:my-6 lg:my-8 px-4 sm:px-0">
      {bannerContent}
    </section>
  );
};

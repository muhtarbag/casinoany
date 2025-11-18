import { OptimizedImage } from "@/components/OptimizedImage";
import cardsBannerImage from "@/assets/cards-banner.jpg";

export const CardsBanner = () => {
  return (
    <section className="w-full my-6 md:my-12 lg:my-16 px-2 sm:px-0">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] rounded-lg md:rounded-xl overflow-hidden shadow-lg md:shadow-2xl">
        <OptimizedImage
          src={cardsBannerImage}
          alt="Full House, Royal Flush - Kartların Gücünü Hisset"
          className="w-full h-full"
          objectFit="cover"
          width={1920}
          height={720}
          priority={false}
          fetchPriority="low"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
        />
      </div>
    </section>
  );
};

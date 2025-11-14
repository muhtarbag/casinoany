interface DynamicBannerProps {
  imageUrl: string;
  altText: string;
  targetUrl?: string | null;
  title: string;
}

export const DynamicBanner = ({ imageUrl, altText, targetUrl, title }: DynamicBannerProps) => {
  const bannerContent = (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] rounded-lg md:rounded-xl overflow-hidden shadow-lg md:shadow-2xl">
      <img
        src={imageUrl}
        alt={altText || title}
        className="w-full h-full object-cover object-center"
        loading="lazy"
      />
    </div>
  );

  if (targetUrl) {
    return (
      <section className="w-full my-6 md:my-12 lg:my-16 px-2 sm:px-0">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform active:scale-[0.98] md:hover:scale-[1.02]"
        >
          {bannerContent}
        </a>
      </section>
    );
  }

  return (
    <section className="w-full my-6 md:my-12 lg:my-16 px-2 sm:px-0">
      {bannerContent}
    </section>
  );
};

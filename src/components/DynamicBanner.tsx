interface DynamicBannerProps {
  imageUrl: string;
  mobileImageUrl?: string | null;
  altText: string;
  targetUrl?: string | null;
  title: string;
}

export const DynamicBanner = ({ imageUrl, mobileImageUrl, altText, targetUrl, title }: DynamicBannerProps) => {
  const bannerContent = (
    <div className="relative w-full rounded-md sm:rounded-lg overflow-hidden shadow-md">
      <picture>
        {mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        )}
        <img
          src={imageUrl}
          alt={altText || title}
          className="w-full h-auto object-cover object-center aspect-[16/9] sm:aspect-[20/9] md:aspect-[24/9]"
          loading="lazy"
        />
      </picture>
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

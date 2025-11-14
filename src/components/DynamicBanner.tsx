interface DynamicBannerProps {
  imageUrl: string;
  altText: string;
  targetUrl?: string | null;
  title: string;
}

export const DynamicBanner = ({ imageUrl, altText, targetUrl, title }: DynamicBannerProps) => {
  const bannerContent = (
    <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] rounded-md sm:rounded-lg overflow-hidden shadow-md">
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

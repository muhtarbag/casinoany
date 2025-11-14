interface DynamicBannerProps {
  imageUrl: string;
  altText: string;
  targetUrl?: string | null;
  title: string;
}

export const DynamicBanner = ({ imageUrl, altText, targetUrl, title }: DynamicBannerProps) => {
  const bannerContent = (
    <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-xl overflow-hidden shadow-2xl">
      <img
        src={imageUrl}
        alt={altText || title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );

  if (targetUrl) {
    return (
      <section className="w-full my-12 md:my-16">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-[1.02]"
        >
          {bannerContent}
        </a>
      </section>
    );
  }

  return (
    <section className="w-full my-12 md:my-16">
      {bannerContent}
    </section>
  );
};

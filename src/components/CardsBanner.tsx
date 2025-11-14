import cardsBannerImage from "@/assets/cards-banner.jpg";

export const CardsBanner = () => {
  return (
    <section className="w-full my-12 md:my-16">
      <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-xl overflow-hidden shadow-2xl">
        <img
          src={cardsBannerImage}
          alt="Full House, Royal Flush - Kartların Gücünü Hisset"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
};

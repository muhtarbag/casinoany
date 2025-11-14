import slotBannerImage from "@/assets/slot-banner.jpg";

export const SlotBanner = () => {
  return (
    <section className="w-full my-6 md:my-12 lg:my-16 px-2 sm:px-0">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] rounded-lg md:rounded-xl overflow-hidden shadow-lg md:shadow-2xl">
        <img
          src={slotBannerImage}
          alt="Kazandıran Slot Dünyasını Keşfet - CasinoAny"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
    </section>
  );
};

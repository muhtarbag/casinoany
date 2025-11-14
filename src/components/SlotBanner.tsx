import slotBannerImage from "@/assets/slot-banner.jpg";

export const SlotBanner = () => {
  return (
    <section className="w-full my-12 md:my-16">
      <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-xl overflow-hidden shadow-2xl">
        <img
          src={slotBannerImage}
          alt="Kazandıran Slot Dünyasını Keşfet - CasinoAny"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
};

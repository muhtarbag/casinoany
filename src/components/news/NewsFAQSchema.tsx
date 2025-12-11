import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface NewsFAQSchemaProps {
  category?: string;
}

/**
 * Generate FAQ Schema for news categories
 * Helps with rich snippets in Google Search
 */
export function NewsFAQSchema({ category }: NewsFAQSchemaProps) {
  // Category-specific FAQs
  const getFAQs = (): FAQItem[] => {
    const commonFAQs: FAQItem[] = [
      {
        question: 'CasinoAny.com haberler bölümünde ne tür içerikler bulabilirim?',
        answer: 'CasinoAny.com haberler bölümünde online casino, spor bahisleri, slot oyunları, Süper Lig ve iGaming sektörü hakkında güncel haberler, analizler ve gelişmeleri bulabilirsiniz.',
      },
      {
        question: 'Haberler ne sıklıkla güncelleniyor?',
        answer: 'Haberlerimiz günlük olarak güncellenmekte ve iGaming sektöründeki en son gelişmeler anında paylaşılmaktadır.',
      },
      {
        question: 'Casino ve bahis haberleri güvenilir mi?',
        answer: 'Tüm haberlerimiz güvenilir kaynaklardan derlenmekte ve editör ekibimiz tarafından doğrulanmaktadır. Kaynak linkleri her haberin altında mevcuttur.',
      },
    ];

    // Add category-specific FAQs
    const categoryFAQs: Record<string, FAQItem[]> = {
      'Spor Haberleri': [
        {
          question: 'Spor bahisleri haberleri hangi ligleri kapsıyor?',
          answer: 'Süper Lig başta olmak üzere Türkiye ve dünya liglerinden güncel haberler, maç analizleri ve bahis önerileri paylaşılmaktadır.',
        },
      ],
      'Slot Haberleri': [
        {
          question: 'Yeni çıkan slot oyunları hakkında bilgi alabiliyor muyum?',
          answer: 'Evet, slot haberleri bölümünde en yeni slot oyunları, oyun sağlayıcıları ve RTP oranları hakkında detaylı bilgiler bulabilirsiniz.',
        },
      ],
      'Bonus Haberleri': [
        {
          question: 'Casino bonusları hakkında güncel haberler var mı?',
          answer: 'Bonus haberleri bölümünde en yeni casino bonusları, promosyonlar ve özel teklifler hakkında güncel bilgiler paylaşılmaktadır.',
        },
      ],
    };

    return category && categoryFAQs[category]
      ? [...commonFAQs, ...categoryFAQs[category]]
      : commonFAQs;
  };

  const faqs = getFAQs();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

import { ProsConsBlock } from "./ProsConsBlock";
import { CasinoVerdictBlock } from "./CasinoVerdictBlock";
import { ExpertReviewBlock } from "./ExpertReviewBlock";
import { GameOverviewBlock } from "./GameOverviewBlock";
import { LoginGuideBlock } from "./LoginGuideBlock";
import { WithdrawalGuideBlock } from "./WithdrawalGuideBlock";
import { FAQBlock } from "./FAQBlock";

interface CasinoReviewCoreContentProps {
  pros?: string[];
  cons?: string[];
  verdict?: string;
  expertReview?: string;
  gameCategories?: Record<string, string>;
  loginGuide?: string;
  withdrawalGuide?: string;
  faq?: Array<{ question: string; answer: string }>;
}

export const CasinoReviewCoreContent = ({
  pros,
  cons,
  verdict,
  expertReview,
  gameCategories,
  loginGuide,
  withdrawalGuide,
  faq,
}: CasinoReviewCoreContentProps) => {
  return (
    <div className="space-y-6">
      <ProsConsBlock pros={pros} cons={cons} />
      <CasinoVerdictBlock verdict={verdict} />
      <ExpertReviewBlock expertReview={expertReview} />
      <GameOverviewBlock gameCategories={gameCategories} />
      <LoginGuideBlock loginGuide={loginGuide} />
      <WithdrawalGuideBlock withdrawalGuide={withdrawalGuide} />
      <FAQBlock faq={faq} />
    </div>
  );
};

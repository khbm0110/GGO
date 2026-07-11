import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { data } from '@/lib/data';
import NewsCard from '@/components/NewsCard';
import MatchTicker from '@/components/MatchTicker';
import StandingsWidget from '@/components/StandingsWidget';
import { Category } from '@/types';

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 border-r-4 border-primary pr-3 bg-gradient-to-l from-slate-900 to-transparent p-2 rounded-r">
      <h2 className="text-xl font-black text-white">{title}</h2>
      {link && (
        <Link href={link} className="text-xs text-primary hover:text-emerald-400 flex items-center transition-colors font-bold">
          المزيد <ChevronLeft size={14} />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [articles, matches, standings] = await Promise.all([
    data.getArticles(),
    data.getMatches(),
    data.getStandings(),
  ]);

  const breaking = articles.filter((a) => a.isBreaking);
  const featuredArticle = breaking[0] ?? articles[0];
  const latestNews = articles
    .filter((a) => a.id !== featuredArticle?.id && a.category !== Category.VIDEO)
    .slice(0, 9);
  const sideNews = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 5);

  return (
    <div className="pb-12">
      <MatchTicker matches={matches} />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {featuredArticle ? (
              <NewsCard article={featuredArticle} featured />
            ) : (
              <div className="h-full w-full bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
                لا توجد مقالات لعرضها.
              </div>
            )}
          </div>
          <div className="space-y-4">
            {sideNews.map((article) => (
              <NewsCard key={article.id} article={article} compact />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 container mx-auto px-4">
        <div className="space-y-12 lg:col-span-9">
          <section>
            <SectionHeader title="آخر الأخبار" />
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <StandingsWidget standings={standings} />
        </div>
      </div>
    </div>
  );
}

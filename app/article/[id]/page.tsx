import { notFound } from 'next/navigation';
import { Clock, Eye } from 'lucide-react';
import { data } from '@/lib/data';
import { formatTimeAgo } from '@/lib/services/dateService';
import ArticleComments from '@/components/ArticleComments';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await data.getArticleById(id);

  if (!article) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <span className="text-xs font-bold text-primary mb-2 block">{article.category}</span>
      <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-6 border-b border-slate-800 pb-4">
        <span className="flex items-center gap-1">
          <Clock size={14} /> {formatTimeAgo(article.date)}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={14} /> {article.views.toLocaleString()}
        </span>
        <span>بقلم {article.author}</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={article.imageUrl} alt={article.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-6" />

      <p className="text-lg text-slate-300 leading-relaxed mb-6 font-bold">{article.summary}</p>
      <div className="prose prose-invert max-w-none text-slate-300 leading-loose whitespace-pre-line mb-8">{article.content}</div>

      <div className="border-t border-slate-800 pt-6">
        <ArticleComments articleId={article.id} />
      </div>
    </div>
  );
}

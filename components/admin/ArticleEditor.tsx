'use client';

import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { Article, Category } from '@/types';

interface ArticleEditorProps {
  initialData: Partial<Article>;
  onSave: (article: Article) => Promise<void>;
  onCancel: () => void;
  mode: 'NEW' | 'EDIT';
}

export default function ArticleEditor({ initialData, onSave, onCancel, mode }: ArticleEditorProps) {
  const [article, setArticle] = useState<Partial<Article>>(initialData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setArticle(initialData);
  }, [initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setArticle((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!article.title || !article.content) return;
    setSaving(true);
    await onSave(article as Article);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4 pb-10 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onCancel} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{mode === 'NEW' ? 'مقال جديد' : 'تعديل المقال'}</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-slate-400 mb-1">العنوان</label>
            <input name="title" value={article.title || ''} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">التصنيف</label>
              <select name="category" value={article.category} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                {Object.values(Category).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="isBreaking" checked={!!article.isBreaking} onChange={handleChange} className="w-4 h-4" />
                خبر عاجل
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">رابط الصورة</label>
            <input name="imageUrl" value={article.imageUrl || ''} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">الملخص</label>
            <textarea name="summary" value={article.summary || ''} onChange={handleChange} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">المحتوى</label>
            <textarea name="content" value={article.content || ''} onChange={handleChange} required rows={8} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <p className="text-[11px] text-amber-500/80 border-t border-slate-800 pt-3">
            ⚠️ إعادة الكتابة بالذكاء الاصطناعي (Gemini) والاستيراد التلقائي عبر RSS سيُضافان في مرحلة لاحقة.
          </p>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold">إلغاء</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
            <Save size={16} /> {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
}

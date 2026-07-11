'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Plus, Edit, Trash2, LayoutGrid, FileText, Users, Settings, Check, Ban,
  MessageCircle, Clock, ShoppingBag, Globe, Megaphone, BarChart2, Bot, Save,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { data } from '@/lib/data';
import ArticleEditor from '@/components/admin/ArticleEditor';
import ClubEditor from '@/components/admin/ClubEditor';
import { Category, type Article, type User, type Comment, type ClubProfile, type Sponsor, type SeoSettings, type FeatureFlags } from '@/types';

type AdminTab = 'OVERVIEW' | 'ARTICLES' | 'USERS' | 'MODERATION' | 'CLUBS' | 'SPONSORS' | 'SEO' | 'ADS' | 'ANALYTICS' | 'AUTOPILOT' | 'SETTINGS';

const COMING_SOON_TABS: { key: AdminTab; label: string; icon: typeof ShoppingBag; note: string }[] = [
  { key: 'ANALYTICS', label: 'التحليلات', icon: BarChart2, note: 'يحتاج ربط Google Analytics أولاً' },
  { key: 'AUTOPILOT', label: 'الأتمتة (RSS + AI)', icon: Bot, note: 'استيراد RSS، إعادة الكتابة بـ Gemini، النشر التلقائي' },
];

export default function AdminDashboardPage() {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [clubs, setClubs] = useState<ClubProfile[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [seoSettings, setSeoSettings] = useState<SeoSettings | null>(null);
  const [featureFlags, setFeatureFlagsState] = useState<FeatureFlags | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editorMode, setEditorMode] = useState<'NEW' | 'EDIT'>('NEW');
  const [editingClub, setEditingClub] = useState<ClubProfile | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/');
  }, [isAdmin, loading, router]);

  async function refreshAll() {
    const [a, u, c, cl, sp, seo, ff] = await Promise.all([
      data.getArticles(),
      data.getUsers(),
      data.getAllComments(),
      data.getClubs(),
      data.getSponsors(),
      data.getSeoSettings(),
      data.getFeatureFlags(),
    ]);
    setArticles(a);
    setUsers(u);
    setComments(c);
    setClubs(cl);
    setSponsors(sp);
    setSeoSettings(seo);
    setFeatureFlagsState(ff);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  if (loading || !isAdmin) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">جارٍ التحقق من الصلاحيات...</div>;
  }

  async function handleSaveArticle(articleData: Article) {
    if (articleData.id && !articleData.id.startsWith('new-')) {
      await data.updateArticle(articleData);
    } else {
      const newArticle: Article = { ...articleData, id: `article-${Date.now()}`, date: new Date().toISOString(), author: currentUser?.name || 'Admin', views: 0 };
      await data.addArticle(newArticle);
    }
    setEditingArticle(null);
    refreshAll();
  }

  async function handleDeleteArticle(id: string) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا المقال؟')) {
      await data.deleteArticle(id);
      refreshAll();
    }
  }

  async function handleToggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    if (confirm(`هل أنت متأكد أنك تريد ${newStatus === 'banned' ? 'حظر' : 'إلغاء حظر'} هذا المستخدم؟`)) {
      await data.updateUserStatus(user.id, newStatus);
      refreshAll();
    }
  }

  async function handleDeleteUser(id: string, name: string) {
    if (confirm(`هل أنت متأكد أنك تريد حذف المستخدم ${name} بشكل دائم؟`)) {
      await data.deleteUser(id);
      refreshAll();
    }
  }

  async function handleModerate(id: string, status: Comment['status']) {
    await data.updateCommentStatus(id, status);
    refreshAll();
  }

  async function handleSaveClub(clubData: ClubProfile) {
    const exists = clubs.some((c) => c.id === clubData.id);
    if (exists) await data.updateClub(clubData);
    else await data.addClub(clubData);
    setEditingClub(null);
    refreshAll();
  }

  async function handleDeleteClub(id: string) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا النادي؟')) {
      await data.deleteClub(id);
      refreshAll();
    }
  }

  async function handleToggleSponsor(sponsor: Sponsor) {
    await data.updateSponsor({ ...sponsor, active: !sponsor.active });
    refreshAll();
  }

  async function handleDeleteSponsor(id: string) {
    if (confirm('هل تريد حذف هذا الراعي؟')) {
      await data.deleteSponsor(id);
      refreshAll();
    }
  }

  async function handleAddSponsor() {
    const name = prompt('اسم الراعي:');
    if (!name) return;
    await data.addSponsor({ id: `sponsor-${Date.now()}`, name, logo: '', url: '', active: true });
    refreshAll();
  }

  async function handleSaveSeo(e: React.FormEvent) {
    e.preventDefault();
    if (!seoSettings) return;
    await data.updateSeoSettings(seoSettings);
    alert('تم حفظ إعدادات SEO');
  }

  async function handleToggleFlag(key: keyof FeatureFlags) {
    if (!featureFlags) return;
    const newValue = !featureFlags[key];
    await data.setFeatureFlag(key, newValue);
    refreshAll();
  }

  const NAV_ITEMS: { key: AdminTab; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'OVERVIEW', label: 'نظرة عامة', icon: LayoutGrid },
    { key: 'ARTICLES', label: 'المقالات', icon: FileText },
    { key: 'CLUBS', label: 'الأندية', icon: ShoppingBag },
    { key: 'USERS', label: 'المستخدمون', icon: Users },
    { key: 'MODERATION', label: 'مراقبة التعليقات', icon: MessageCircle },
    { key: 'SPONSORS', label: 'الرعاة والإعلانات', icon: Megaphone },
    { key: 'SEO', label: 'SEO', icon: Globe },
    { key: 'SETTINGS', label: 'الإعدادات العامة', icon: Settings },
    ...COMING_SOON_TABS,
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-l border-slate-800 p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="text-red-500" size={24} />
          <span className="font-black text-white text-lg">لوحة التحكم</span>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === item.key ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        {activeTab === 'OVERVIEW' && (
          <div>
            <h1 className="text-2xl font-black text-white mb-6">نظرة عامة</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="المقالات" value={articles.length} icon={FileText} />
              <StatCard label="المستخدمون" value={users.length} icon={Users} />
              <StatCard label="التعليقات" value={comments.length} icon={MessageCircle} />
              <StatCard label="مقالات عاجلة" value={articles.filter((a) => a.isBreaking).length} icon={Clock} />
            </div>
          </div>
        )}

        {activeTab === 'ARTICLES' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white">المقالات ({articles.length})</h1>
              <button
                onClick={() => {
                  setEditorMode('NEW');
                  setEditingArticle({ id: 'new-article', title: '', summary: '', content: '', category: Category.SAUDI, imageUrl: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-bold text-sm"
              >
                <Plus size={16} /> مقال جديد
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-400 text-xs">
                  <tr>
                    <th className="p-3 text-right">العنوان</th>
                    <th className="p-3 text-right">التصنيف</th>
                    <th className="p-3 text-center">المشاهدات</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white font-bold max-w-xs truncate">{article.title}</td>
                      <td className="p-3 text-slate-400">{article.category}</td>
                      <td className="p-3 text-center text-slate-400">{article.views.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditorMode('EDIT');
                              setEditingArticle(article);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                          >
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteArticle(article.id)} className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div>
            <h1 className="text-2xl font-black text-white mb-6">المستخدمون ({users.length})</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-400 text-xs">
                  <tr>
                    <th className="p-3 text-right">المستخدم</th>
                    <th className="p-3 text-right">البريد</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white font-bold">{user.name} <span className="text-slate-500 font-normal">@{user.username}</span></td>
                      <td className="p-3 text-slate-400">{user.email}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${user.status === 'banned' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {user.status === 'banned' ? 'محظور' : 'نشط'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleToggleUserStatus(user)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" title={user.status === 'banned' ? 'إلغاء الحظر' : 'حظر'}>
                            {user.status === 'banned' ? <Check size={14} /> : <Ban size={14} />}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id, user.name)} className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'MODERATION' && (
          <div>
            <h1 className="text-2xl font-black text-white mb-6">مراقبة التعليقات ({comments.length})</h1>
            {comments.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800 border-dashed text-slate-500">لا توجد تعليقات بعد.</div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{c.user}</p>
                      <p className="text-sm text-slate-400 truncate">{c.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.status === 'reported' ? 'bg-amber-500/10 text-amber-400' : c.status === 'hidden' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {c.status === 'reported' ? 'مُبلَّغ عنه' : c.status === 'hidden' ? 'مخفي' : 'ظاهر'}
                      </span>
                      {c.status !== 'hidden' && (
                        <button onClick={() => handleModerate(c.id, 'hidden')} className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-300">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {c.status !== 'visible' && (
                        <button onClick={() => handleModerate(c.id, 'visible')} className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-500 rounded text-slate-300">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'CLUBS' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white">الأندية ({clubs.length})</h1>
              <button
                onClick={() =>
                  setEditingClub({
                    id: `club-${Date.now()}`,
                    name: '',
                    englishName: '',
                    apiFootballId: 0,
                    logo: '',
                    coverImage: '',
                    founded: new Date().getFullYear(),
                    stadium: '',
                    coach: '',
                    nickname: '',
                    colors: { primary: '#10b981', secondary: '#0f172a', text: '#ffffff' },
                    social: { twitter: '', instagram: '' },
                    fanCount: 0,
                    squad: [],
                    trophies: [],
                    country: Category.SAUDI,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-bold text-sm"
              >
                <Plus size={16} /> نادٍ جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div key={club.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{club.name}</p>
                    <p className="text-xs text-slate-500">{club.country}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditingClub(club)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteClub(club.id)} className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SPONSORS' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white">الرعاة والإعلانات ({sponsors.length})</h1>
              <button onClick={handleAddSponsor} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-bold text-sm">
                <Plus size={16} /> راعٍ جديد
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-400 text-xs">
                  <tr>
                    <th className="p-3 text-right">الاسم</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sponsors.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-white font-bold">{s.name}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSponsor(s)}
                          className={`text-xs px-2 py-1 rounded-full font-bold ${s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}
                        >
                          {s.active ? 'مفعّل' : 'موقوف'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteSponsor(s.id)} className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded text-slate-300 mx-auto">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500 text-sm">
              ⚠️ ربط Google AdSense الحقيقي (رموز الإعلانات المباشرة) يحتاج حساب AdSense معتمد — سيُضاف لاحقًا.
            </div>
          </div>
        )}

        {activeTab === 'SEO' && seoSettings && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black text-white mb-6">إعدادات SEO</h1>
            <form onSubmit={handleSaveSeo} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">عنوان الموقع</label>
                <input
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">الوصف التعريفي (Meta Description)</label>
                <textarea
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">الكلمات المفتاحية</label>
                <input
                  value={seoSettings.metaKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">رابط صورة المشاركة (OG Image)</label>
                <input
                  value={seoSettings.ogImageUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogImageUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2">
                <Save size={16} /> حفظ الإعدادات
              </button>
            </form>
          </div>
        )}

        {activeTab === 'SETTINGS' && featureFlags && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-black text-white mb-6">تفعيل/تعطيل ميزات الموقع</h1>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
              {(Object.keys(featureFlags) as (keyof FeatureFlags)[]).map((key) => (
                <div key={key} className="flex items-center justify-between p-4">
                  <span className="text-slate-300 font-bold">{key}</span>
                  <button
                    onClick={() => handleToggleFlag(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${featureFlags[key] ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${featureFlags[key] ? 'right-0.5' : 'right-6'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {COMING_SOON_TABS.some((t) => t.key === activeTab) && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            {(() => {
              const tab = COMING_SOON_TABS.find((t) => t.key === activeTab)!;
              const Icon = tab.icon;
              return (
                <>
                  <Icon size={40} className="text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">{tab.label} — قريبًا</h3>
                  <p className="text-slate-500 text-sm max-w-sm">{tab.note}</p>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {editingArticle && (
        <ArticleEditor
          initialData={editingArticle}
          mode={editorMode}
          onSave={handleSaveArticle}
          onCancel={() => setEditingArticle(null)}
        />
      )}

      {editingClub && <ClubEditor initialData={editingClub} onSave={handleSaveClub} onCancel={() => setEditingClub(null)} />}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <Icon size={18} className="text-primary mb-2" />
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-slate-500 font-bold">{label}</div>
    </div>
  );
}

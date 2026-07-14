'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Plus, Edit, Trash2, LayoutGrid, FileText, Users, Settings, Check, Ban,
  MessageCircle, Clock, ShoppingBag, Globe, Megaphone, BarChart2, Bot, Save, LogOut,
  Home,
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
  const { currentUser, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

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
    return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--fg-faint)]">جارٍ التحقق من الصلاحيات...</div>;
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

  const NAV_GROUPS: { group: string; items: { key: AdminTab; label: string; icon: typeof LayoutGrid }[] }[] = [
    { group: 'عام', items: [{ key: 'OVERVIEW', label: 'نظرة عامة', icon: LayoutGrid }] },
    {
      group: 'المحتوى',
      items: [
        { key: 'ARTICLES', label: 'المقالات', icon: FileText },
        { key: 'CLUBS', label: 'الأندية', icon: ShoppingBag },
      ],
    },
    {
      group: 'المجتمع',
      items: [
        { key: 'USERS', label: 'المستخدمون', icon: Users },
        { key: 'MODERATION', label: 'مراقبة التعليقات', icon: MessageCircle },
      ],
    },
    {
      group: 'الموقع',
      items: [
        { key: 'SPONSORS', label: 'الرعاة والإعلانات', icon: Megaphone },
        { key: 'SEO', label: 'SEO', icon: Globe },
        { key: 'SETTINGS', label: 'الإعدادات العامة', icon: Settings },
        ...COMING_SOON_TABS,
      ],
    },
  ];

  const activeTabMeta = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.key === activeTab);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:h-screen lg:sticky lg:top-0 bg-[var(--bg-surface)] border-b lg:border-b-0 lg:border-l border-[var(--border-subtle)] flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b border-[var(--border-subtle)]">
          <Shield className="text-red-500" size={24} />
          <span className="font-black text-[var(--fg)] text-lg">لوحة التحكم</span>
        </div>

        <nav className="flex-1 lg:overflow-y-auto p-3">
          <div className="flex lg:hidden gap-1 overflow-x-auto no-scrollbar">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === item.key ? 'bg-primary/10 text-primary' : 'text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg)]'
                }`}
              >
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:block space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.group}>
                <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--fg-faint)]">{group.group}</p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeTab === item.key ? 'bg-primary/10 text-primary' : 'text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg)]'
                      }`}
                    >
                      <item.icon size={16} /> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg)] transition-colors">
            <Home size={16} /> العودة للموقع
          </Link>
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 min-w-0 px-2 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--bg-surface-2)] flex items-center justify-center flex-shrink-0">
                {currentUser?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <Shield size={14} className="text-[var(--fg-faint)]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--fg)] truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-[var(--fg-faint)] truncate">مدير الموقع</p>
              </div>
            </div>
            <button onClick={handleLogout} title="تسجيل الخروج" className="flex-shrink-0 p-2 rounded-lg text-[var(--fg-faint)] hover:bg-red-500/10 hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        {activeTab !== 'OVERVIEW' && activeTabMeta && (
          <p className="text-xs font-bold text-[var(--fg-faint)] mb-1">لوحة التحكم / {activeTabMeta.label}</p>
        )}

        {activeTab === 'OVERVIEW' && (
          <div>
            <h1 className="text-2xl font-black text-[var(--fg)] mb-1">نظرة عامة</h1>
            <p className="text-sm text-[var(--fg-faint)] mb-6">مرحبًا {currentUser?.name}، هذا ملخص سريع لحالة الموقع.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="المقالات" value={articles.length} icon={FileText} />
              <StatCard label="المستخدمون" value={users.length} icon={Users} />
              <StatCard label="الأندية" value={clubs.length} icon={ShoppingBag} />
              <StatCard label="الرعاة" value={sponsors.length} icon={Megaphone} />
              <StatCard label="التعليقات" value={comments.length} icon={MessageCircle} />
              <StatCard label="مقالات عاجلة" value={articles.filter((a) => a.isBreaking).length} icon={Clock} />
              <StatCard label="تعليقات مُبلَّغ عنها" value={comments.filter((c) => c.status === 'reported').length} icon={MessageCircle} />
              <StatCard label="مستخدمون محظورون" value={users.filter((u) => u.status === 'banned').length} icon={Ban} />
            </div>

            <h2 className="text-sm font-black text-[var(--fg-subtle)] mb-3">اختصارات سريعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => { setEditorMode('NEW'); setEditingArticle({ id: 'new-article', title: '', summary: '', content: '', category: Category.SAUDI, imageUrl: '' }); }} className="flex items-center gap-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-primary/50 transition-colors text-sm font-bold text-[var(--fg-muted)] hover:text-primary">
                <Plus size={16} /> مقال جديد
              </button>
              <button onClick={() => setActiveTab('MODERATION')} className="flex items-center gap-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-primary/50 transition-colors text-sm font-bold text-[var(--fg-muted)] hover:text-primary">
                <MessageCircle size={16} /> مراقبة التعليقات
              </button>
              <button onClick={() => setActiveTab('USERS')} className="flex items-center gap-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-primary/50 transition-colors text-sm font-bold text-[var(--fg-muted)] hover:text-primary">
                <Users size={16} /> إدارة المستخدمين
              </button>
              <button onClick={() => setActiveTab('SETTINGS')} className="flex items-center gap-2 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-primary/50 transition-colors text-sm font-bold text-[var(--fg-muted)] hover:text-primary">
                <Settings size={16} /> إعدادات الموقع
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ARTICLES' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-[var(--fg)]">المقالات ({articles.length})</h1>
              <button
                onClick={() => {
                  setEditorMode('NEW');
                  setEditingArticle({ id: 'new-article', title: '', summary: '', content: '', category: Category.SAUDI, imageUrl: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-[var(--fg)] rounded-lg font-bold text-sm"
              >
                <Plus size={16} /> مقال جديد
              </button>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-surface-2)] text-[var(--fg-subtle)] text-xs">
                  <tr>
                    <th className="p-3 text-right">العنوان</th>
                    <th className="p-3 text-right">التصنيف</th>
                    <th className="p-3 text-center">المشاهدات</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-[color-mix(in_srgb,var(--bg-surface-2)_30%,transparent)]">
                      <td className="p-3 text-[var(--fg)] font-bold max-w-xs truncate">{article.title}</td>
                      <td className="p-3 text-[var(--fg-subtle)]">{article.category}</td>
                      <td className="p-3 text-center text-[var(--fg-subtle)]">{article.views.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditorMode('EDIT');
                              setEditingArticle(article);
                            }}
                            className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] rounded text-[var(--fg-muted)]"
                          >
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteArticle(article.id)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-red-500/20 hover:text-red-500 rounded text-[var(--fg-muted)]">
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
            <h1 className="text-2xl font-black text-[var(--fg)] mb-6">المستخدمون ({users.length})</h1>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-surface-2)] text-[var(--fg-subtle)] text-xs">
                  <tr>
                    <th className="p-3 text-right">المستخدم</th>
                    <th className="p-3 text-right">البريد</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[color-mix(in_srgb,var(--bg-surface-2)_30%,transparent)]">
                      <td className="p-3 text-[var(--fg)] font-bold">{user.name} <span className="text-[var(--fg-faint)] font-normal">@{user.username}</span></td>
                      <td className="p-3 text-[var(--fg-subtle)]">{user.email}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${user.status === 'banned' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {user.status === 'banned' ? 'محظور' : 'نشط'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleToggleUserStatus(user)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] rounded text-[var(--fg-muted)]" title={user.status === 'banned' ? 'إلغاء الحظر' : 'حظر'}>
                            {user.status === 'banned' ? <Check size={14} /> : <Ban size={14} />}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id, user.name)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-red-500/20 hover:text-red-500 rounded text-[var(--fg-muted)]">
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
            <h1 className="text-2xl font-black text-[var(--fg)] mb-6">مراقبة التعليقات ({comments.length})</h1>
            {comments.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] border-dashed text-[var(--fg-faint)]">لا توجد تعليقات بعد.</div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--fg)]">{c.user}</p>
                      <p className="text-sm text-[var(--fg-subtle)] truncate">{c.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.status === 'reported' ? 'bg-amber-500/10 text-amber-400' : c.status === 'hidden' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {c.status === 'reported' ? 'مُبلَّغ عنه' : c.status === 'hidden' ? 'مخفي' : 'ظاهر'}
                      </span>
                      {c.status !== 'hidden' && (
                        <button onClick={() => handleModerate(c.id, 'hidden')} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-red-500/20 hover:text-red-500 rounded text-[var(--fg-muted)]">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {c.status !== 'visible' && (
                        <button onClick={() => handleModerate(c.id, 'visible')} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-emerald-500/20 hover:text-emerald-500 rounded text-[var(--fg-muted)]">
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
              <h1 className="text-2xl font-black text-[var(--fg)]">الأندية ({clubs.length})</h1>
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
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-[var(--fg)] rounded-lg font-bold text-sm"
              >
                <Plus size={16} /> نادٍ جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div key={club.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--fg)] truncate">{club.name}</p>
                    <p className="text-xs text-[var(--fg-faint)]">{club.country}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditingClub(club)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] rounded text-[var(--fg-muted)]">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteClub(club.id)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-red-500/20 hover:text-red-500 rounded text-[var(--fg-muted)]">
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
              <h1 className="text-2xl font-black text-[var(--fg)]">الرعاة والإعلانات ({sponsors.length})</h1>
              <button onClick={handleAddSponsor} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-600 text-[var(--fg)] rounded-lg font-bold text-sm">
                <Plus size={16} /> راعٍ جديد
              </button>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-surface-2)] text-[var(--fg-subtle)] text-xs">
                  <tr>
                    <th className="p-3 text-right">الاسم</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {sponsors.map((s) => (
                    <tr key={s.id} className="hover:bg-[color-mix(in_srgb,var(--bg-surface-2)_30%,transparent)]">
                      <td className="p-3 text-[var(--fg)] font-bold">{s.name}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSponsor(s)}
                          className={`text-xs px-2 py-1 rounded-full font-bold ${s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--bg-surface-2)] text-[var(--fg-faint)]'}`}
                        >
                          {s.active ? 'مفعّل' : 'موقوف'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDeleteSponsor(s.id)} className="p-1.5 bg-[var(--bg-surface-2)] hover:bg-red-500/20 hover:text-red-500 rounded text-[var(--fg-muted)] mx-auto">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] border border-dashed border-[var(--border-subtle)] rounded-xl p-4 text-center text-[var(--fg-faint)] text-sm">
              ⚠️ ربط Google AdSense الحقيقي (رموز الإعلانات المباشرة) يحتاج حساب AdSense معتمد — سيُضاف لاحقًا.
            </div>
          </div>
        )}

        {activeTab === 'SEO' && seoSettings && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black text-[var(--fg)] mb-6">إعدادات SEO</h1>
            <form onSubmit={handleSaveSeo} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-[var(--fg-subtle)] mb-1">عنوان الموقع</label>
                <input
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--fg-subtle)] mb-1">الوصف التعريفي (Meta Description)</label>
                <textarea
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--fg-subtle)] mb-1">الكلمات المفتاحية</label>
                <input
                  value={seoSettings.metaKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--fg-subtle)] mb-1">رابط صورة المشاركة (OG Image)</label>
                <input
                  value={seoSettings.ogImageUrl}
                  onChange={(e) => setSeoSettings({ ...seoSettings, ogImageUrl: e.target.value })}
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-primary hover:bg-emerald-600 text-[var(--fg)] rounded-lg font-bold flex items-center gap-2">
                <Save size={16} /> حفظ الإعدادات
              </button>
            </form>
          </div>
        )}

        {activeTab === 'SETTINGS' && featureFlags && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-black text-[var(--fg)] mb-6">تفعيل/تعطيل ميزات الموقع</h1>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
              {(Object.keys(featureFlags) as (keyof FeatureFlags)[]).map((key) => (
                <div key={key} className="flex items-center justify-between p-4">
                  <span className="text-[var(--fg-muted)] font-bold">{key}</span>
                  <button
                    onClick={() => handleToggleFlag(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${featureFlags[key] ? 'bg-primary' : 'bg-[var(--bg-surface-3)]'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${featureFlags[key] ? 'right-0.5' : 'right-6'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {COMING_SOON_TABS.some((t) => t.key === activeTab) && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] rounded-2xl border border-[var(--border-subtle)] border-dashed">
            {(() => {
              const tab = COMING_SOON_TABS.find((t) => t.key === activeTab)!;
              const Icon = tab.icon;
              return (
                <>
                  <Icon size={40} className="text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-[var(--fg-muted)] mb-2">{tab.label} — قريبًا</h3>
                  <p className="text-[var(--fg-faint)] text-sm max-w-sm">{tab.note}</p>
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
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
      <Icon size={18} className="text-primary mb-2" />
      <div className="text-2xl font-black text-[var(--fg)]">{value}</div>
      <div className="text-xs text-[var(--fg-faint)] font-bold">{label}</div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { Category, type ClubProfile } from '@/types';

interface ClubEditorProps {
  initialData: ClubProfile;
  onSave: (club: ClubProfile) => Promise<void>;
  onCancel: () => void;
}

export default function ClubEditor({ initialData, onSave, onCancel }: ClubEditorProps) {
  const [club, setClub] = useState<ClubProfile>(initialData);
  const [saving, setSaving] = useState(false);

  useEffect(() => setClub(initialData), [initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name.startsWith('colors.')) {
      const key = name.split('.')[1];
      setClub((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
    } else {
      setClub((prev) => ({ ...prev, [name]: name === 'founded' || name === 'fanCount' ? Number(value) : value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!club.name) return;
    setSaving(true);
    await onSave(club);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4 pb-10 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onCancel} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">بيانات النادي</h2>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="اسم النادي (عربي)" name="name" value={club.name} onChange={handleChange} />
            <Field label="الاسم بالإنجليزية" name="englishName" value={club.englishName} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="رابط الشعار" name="logo" value={club.logo} onChange={handleChange} />
            <Field label="رابط صورة الغلاف" name="coverImage" value={club.coverImage} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="سنة التأسيس" name="founded" value={String(club.founded)} onChange={handleChange} type="number" />
            <Field label="الملعب" name="stadium" value={club.stadium} onChange={handleChange} />
            <Field label="المدرب" name="coach" value={club.coach} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="اللقب" name="nickname" value={club.nickname} onChange={handleChange} />
            <div>
              <label className="block text-sm text-slate-400 mb-1">الدوري/الدولة</label>
              <select name="country" value={club.country} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                {Object.values(Category).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="اللون الأساسي" name="colors.primary" value={club.colors?.primary || ''} onChange={handleChange} type="color" />
            <Field label="اللون الثانوي" name="colors.secondary" value={club.colors?.secondary || ''} onChange={handleChange} type="color" />
            <Field label="عدد المشجعين" name="fanCount" value={String(club.fanCount || 0)} onChange={handleChange} type="number" />
          </div>

          <p className="text-[11px] text-amber-500/80 border-t border-slate-800 pt-3">
            ⚠️ تعديل قائمة اللاعبين والتشكيلة والبطولات سيُضاف في نسخة قادمة من محرر النادي.
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

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
    </div>
  );
}

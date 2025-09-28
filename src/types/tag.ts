export interface Tag {
  id: string;
  text: string;
  color: TagColor;
  createdAt: Date;
  updatedAt: Date;
}

export type TagColor =
  | 'rose'
  | 'pink'
  | 'fuchsia'
  | 'purple'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'teal'
  | 'emerald'
  | 'green'
  | 'lime'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'red'
  | 'stone'
  | 'neutral'
  | 'zinc'
  | 'gray'
  | 'slate';

export interface TagFormData {
  text: string;
  color: TagColor;
}

export const TAG_COLORS: Record<TagColor, { name: string; bgClass: string; textClass: string }> = {
  rose: { name: 'Rose', bgClass: 'bg-rose-100', textClass: 'text-rose-800' },
  pink: { name: 'Pink', bgClass: 'bg-pink-100', textClass: 'text-pink-800' },
  fuchsia: { name: 'Fuchsia', bgClass: 'bg-fuchsia-100', textClass: 'text-fuchsia-800' },
  purple: { name: 'Purple', bgClass: 'bg-purple-100', textClass: 'text-purple-800' },
  violet: { name: 'Violet', bgClass: 'bg-violet-100', textClass: 'text-violet-800' },
  indigo: { name: 'Indigo', bgClass: 'bg-indigo-100', textClass: 'text-indigo-800' },
  blue: { name: 'Blue', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
  sky: { name: 'Sky', bgClass: 'bg-sky-100', textClass: 'text-sky-800' },
  cyan: { name: 'Cyan', bgClass: 'bg-cyan-100', textClass: 'text-cyan-800' },
  teal: { name: 'Teal', bgClass: 'bg-teal-100', textClass: 'text-teal-800' },
  emerald: { name: 'Emerald', bgClass: 'bg-emerald-100', textClass: 'text-emerald-800' },
  green: { name: 'Green', bgClass: 'bg-green-100', textClass: 'text-green-800' },
  lime: { name: 'Lime', bgClass: 'bg-lime-100', textClass: 'text-lime-800' },
  yellow: { name: 'Yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' },
  amber: { name: 'Amber', bgClass: 'bg-amber-100', textClass: 'text-amber-800' },
  orange: { name: 'Orange', bgClass: 'bg-orange-100', textClass: 'text-orange-800' },
  red: { name: 'Red', bgClass: 'bg-red-100', textClass: 'text-red-800' },
  stone: { name: 'Stone', bgClass: 'bg-stone-100', textClass: 'text-stone-800' },
  neutral: { name: 'Neutral', bgClass: 'bg-neutral-100', textClass: 'text-neutral-800' },
  zinc: { name: 'Zinc', bgClass: 'bg-zinc-100', textClass: 'text-zinc-800' },
  gray: { name: 'Gray', bgClass: 'bg-gray-100', textClass: 'text-gray-800' },
  slate: { name: 'Slate', bgClass: 'bg-slate-100', textClass: 'text-slate-800' },
};

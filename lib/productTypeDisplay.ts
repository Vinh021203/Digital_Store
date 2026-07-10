const FILLED_STYLES = ['bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-blue-600', 'bg-orange-600', 'bg-cyan-600'];
const SOFT_STYLES = [
  'bg-indigo-50 text-indigo-700 border-indigo-100', 'bg-purple-50 text-purple-700 border-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100', 'bg-amber-50 text-amber-700 border-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100', 'bg-blue-50 text-blue-700 border-blue-100',
  'bg-orange-50 text-orange-700 border-orange-100', 'bg-cyan-50 text-cyan-700 border-cyan-100',
];

const styleIndex = (value: string) => Array.from(value || 'product').reduce((sum, char) => sum + char.charCodeAt(0), 0) % FILLED_STYLES.length;
export const getProductTypeFilledStyle = (format: string) => FILLED_STYLES[styleIndex(format)];
export const getProductTypeSoftStyle = (format: string) => SOFT_STYLES[styleIndex(format)];

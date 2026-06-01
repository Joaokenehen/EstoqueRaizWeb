function pad(n: number) { return n < 10 ? '0' + n : String(n); }
function timestamp() {
  const d = new Date();
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function formatArg(a: any) {
  if (a instanceof Error) return a.stack || a.message;
  if (typeof a === 'object') {
    try { return JSON.stringify(a); } catch { return String(a); }
  }
  return String(a);
}

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

export const info = (...args: any[]) => {
  console.log(`${timestamp()} ${GREEN}[info]${RESET}: ${args.map(formatArg).join(' ')}`);
};

export const warn = (...args: any[]) => {
  console.warn(`${timestamp()} ${YELLOW}[warn]${RESET}: ${args.map(formatArg).join(' ')}`);
};

export const error = (...args: any[]) => {
  console.error(`${timestamp()} ${RED}[error]${RESET}: ${args.map(formatArg).join(' ')}`);
};

export default { info, warn, error };

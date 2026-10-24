import { useState } from "react";

const PATHS = {
  id: (<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.6-1.6 2-2.5 3-2.5s2.4.9 3 2.5" /><path d="M15 10h3M15 14h3" /></>),
  book: (<><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></>),
  users: (<><circle cx="9" cy="8" r="3" /><path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5" /><circle cx="17" cy="9" r="2.2" /><path d="M16 14.2c2.6.2 4.4 1.9 5 4.8" /></>),
  file: (<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></>),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export default function Icon({ name, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

export function Logo() {
  const [missing, setMissing] = useState(false);
  if (!missing) return <img className="logo-img" src="/images/logo.png" alt="" onError={() => setMissing(true)} />;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#17408b" />
      <path d="M9.5 7h10l4 4v14h-14z" fill="#fff" />
      <path d="M19.5 7v4h4z" fill="#c8102e" />
      <path d="M12.5 15h8M12.5 18.5h8M12.5 22h5" stroke="#17408b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

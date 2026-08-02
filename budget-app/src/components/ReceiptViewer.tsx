import { useEffect, useState } from 'react';
import { getReceiptSignedUrl } from '../lib/receipts';
import { Modal } from './ui/Modal';

export function ReceiptButton({ path }: { path: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
      >
        📎 קבלה
      </button>
      {open && <ReceiptModal path={path} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReceiptModal({ path, onClose }: { path: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReceiptSignedUrl(path).then((signedUrl) => {
      if (cancelled) return;
      if (signedUrl) setUrl(signedUrl);
      else setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <Modal title="קבלה" onClose={onClose}>
      {error && <p className="text-sm text-rose-600">לא הצלחנו לטעון את הקבלה. נסו שוב.</p>}
      {!error && !url && <p className="text-sm text-slate-400">טוען...</p>}
      {url && <img src={url} alt="קבלה" className="mx-auto max-h-[70vh] w-auto rounded-lg" />}
    </Modal>
  );
}

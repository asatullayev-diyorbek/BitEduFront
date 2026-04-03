import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PDF URL dan blob URL yasab beruvchi hook
 *
 * @param {string | null | undefined} pdfUrl  — serverdan kelgan PDF manzili
 * @returns {{ blobUrl: string|null, loading: boolean, error: string|null }}
 *
 * Misol:
 *   const { blobUrl, loading } = usePdfBlobUrl(subject?.book_url);
 *   <FlipBookViewer pdfBlobUrl={blobUrl} />
 */
const usePdfBlobUrl = (pdfUrl) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!pdfUrl) return;

    let objectUrl = null;
    setLoading(true);
    setError(null);

    axios
      .get(pdfUrl, { responseType: 'blob' })
      .then((res) => {
        objectUrl = window.URL.createObjectURL(
          new Blob([res.data], { type: 'application/pdf' })
        );
        setBlobUrl(objectUrl);
      })
      .catch((err) => {
        console.error('PDF yuklanmadi:', err);
        setError('PDF yuklanmadi');
      })
      .finally(() => setLoading(false));

    // Komponent unmount bo'lganda xotirani tozala
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl]);

  return { blobUrl, loading, error };
};

export default usePdfBlobUrl;
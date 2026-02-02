import { useEffect, useState } from 'react';

async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency || 0,
  ];

  const dataString = components.join('|||');
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    generateFingerprint().then(fp => {
      if (isMounted) {
        setFingerprint(fp);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { fingerprint, loading };
}

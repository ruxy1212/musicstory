import { RENDER_SERVER_URL } from '@/utils/video/constants';
import { toast } from 'sonner';

export async function wakeServer() {
  try {
    await fetch(`${RENDER_SERVER_URL}/health`);
  } catch {
    // fire-and-forget — ignore errors
  }
}

export async function pollServer(): Promise<boolean> {
  const MAX_RETRIES = 10;
  const INTERVAL_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt === 1) {
      toast.info('Preparing composer...', {
        description: 'Waiting for the compose server to wake up.',
      });
    }

    if (attempt === MAX_RETRIES) {
      toast.error('Server unavailable', {
        description:
          'Compose server did not respond in time. Please try again shortly.',
      });
    }

    try {
      const res = await fetch(`${RENDER_SERVER_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data?.status === 'ok' && data?.bundleReady === true) {
          return true;
        }
      }
    } catch {
      // server not up yet, continue polling
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
  }

  return false;
}

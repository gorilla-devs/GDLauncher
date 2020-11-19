export function handleMessage(type, fn) {
  if (typeof window === 'undefined' || !window.__GD__) return;
  return window.__GD__.handleMessage(type, fn);
}

// Public API: sending and receiving messages
export default function sendMessage(type, value) {
  if (typeof window === 'undefined' || !window.__GD__) return Promise.resolve();
  return window.__GD__.sendMessage(type, value);
}

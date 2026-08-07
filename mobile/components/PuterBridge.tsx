import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export type PuterChatOptions = { prompt: string };
export type PuterBridgeHandle = {
  isReady: () => boolean;
  chat: (options: PuterChatOptions) => Promise<string>;
  openConnect: () => void;
  closeConnect: () => void;
};

type Pending = {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

const PUTER_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
      function post(type, payload) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
        } catch (e) {}
      }

      function isPuterReady() {
        return !!(window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function');
      }

      (function waitForPuter() {
        if (isPuterReady()) {
          post('ready', {});
        } else {
          setTimeout(waitForPuter, 500);
        }
      })();

      async function handleIncoming(raw) {
        const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!msg || !msg.type) return;

        if (msg.type === 'ping') {
          post('pong', { ready: isPuterReady() });
          return;
        }
        
        if (msg.type === 'chat') {
          const id = msg.id;
          try {
            if (!isPuterReady()) throw new Error('Puter not ready');
            const result = await window.puter.ai.chat(msg.prompt, { model: 'gpt-4o-mini' });
            const text = typeof result === 'string' ? result : (result?.text || result?.content || String(result));
            post('chat_ok', { id, text });
          } catch (e) {
            post('chat_error', { id, message: String(e?.message || e) });
          }
        }
      }

      document.addEventListener('message', e => handleIncoming(e.data));
      window.addEventListener('message', e => handleIncoming(e.data));
    </script>
  </body>
</html>`;

export const PuterBridge = forwardRef<PuterBridgeHandle, { timeoutMs?: number }>(
  function PuterBridgeInner({ timeoutMs = 30000 }, ref) {
    const webviewRef = useRef<WebView>(null);
    const [ready, setReady] = useState(false);
    const pendingRef = useRef<Record<string, Pending>>({});

    const cleanup = useCallback((id: string) => {
      const pending = pendingRef.current[id];
      if (pending) {
        clearTimeout(pending.timeoutId);
        delete pendingRef.current[id];
      }
    }, []);

    const onMessage = useCallback((evt: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(evt.nativeEvent.data);
        if (!msg?.type) return;

        if (msg.type === 'ready') {
          setReady(true);
          return;
        }

        if (msg.type === 'pong') {
          setReady(!!msg.ready);
          return;
        }

        if (msg.type === 'chat_ok') {
          const pending = pendingRef.current[msg.id];
          if (pending) {
            cleanup(msg.id);
            pending.resolve(String(msg.text || '').trim());
          }
          return;
        }

        if (msg.type === 'chat_error') {
          const pending = pendingRef.current[msg.id];
          if (pending) {
            cleanup(msg.id);
            pending.reject(new Error(msg.message || 'Chat failed'));
          }
        }
      } catch {}
    }, [cleanup]);

    useImperativeHandle(ref, () => ({
      isReady: () => ready,
      openConnect: () => {},
      closeConnect: () => {},
      chat: async ({ prompt }) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        return new Promise<string>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup(id);
            reject(new Error('Chat timed out'));
          }, timeoutMs);
          pendingRef.current[id] = { resolve, reject, timeoutId };
          webviewRef.current?.postMessage(JSON.stringify({ type: 'chat', id, prompt }));
        });
      },
    }));

    return (
      <View style={styles.hidden}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          source={{ html: PUTER_HTML }}
          style={styles.webview}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, left: -9999, top: -9999 },
  webview: { flex: 1 },
});

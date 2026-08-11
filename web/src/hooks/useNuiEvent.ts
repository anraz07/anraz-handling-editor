import { useEffect, useRef } from 'react';

interface NuiMessageData<T = unknown> {
  type: string;
  data: T;
  [key: string]: any;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * Hook to listen for NUI messages from the game client
 * @param action - the action name (type) to listen for
 * @param handler - the callback function when the event fires
 */
export const useNuiEvent = <T = any>(action: string, handler: NuiHandlerSignature<T>) => {
  const savedHandler = useRef<NuiHandlerSignature<T> | null>(null);

  // Save the latest handler if it changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
      const { type, data, ...rest } = event.data;

      // Some scripts send 'action' instead of 'type'
      const eventAction = type || event.data.action;

      if (savedHandler.current && eventAction === action) {
        // Pass data if available, else pass the whole object (for old scripts)
        savedHandler.current(data !== undefined ? data : (rest as any));
      }
    };

    window.addEventListener('message', eventListener);
    return () => window.removeEventListener('message', eventListener);
  }, [action]);
};

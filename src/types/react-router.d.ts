declare global {
  interface Window {
    __reactRouterFutureFlags: {
      v7_startTransition: boolean;
      v7_relativeSplatPath: boolean;
    }
  }
}

export {};

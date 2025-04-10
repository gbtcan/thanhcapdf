// This optional code is used to register a service worker.
// register() is not called by default.

import { APP_VERSION } from './core/utils/appVersion';

// This lets the app know when a new version of the service worker is activated
const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
  // Whenever there's a new version of the service worker,
  // dispatch an event that the app can listen to
  const waitingServiceWorker = registration.waiting;
  if (waitingServiceWorker) {
    waitingServiceWorker.addEventListener('statechange', (event) => {
      const target = event.target as ServiceWorker;
      if (target.state === 'activated') {
        window.dispatchEvent(new CustomEvent('serviceWorkerUpdateReady'));
      }
    });
    
    // Immediately update if opted in
    if (window.localStorage.getItem('APP_AUTO_UPDATE') === 'true') {
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }
};

// Register the service worker
export function register(config?: {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}) {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    
    // Service workers won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen with CDN, etc.
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
      
      if (import.meta.env.DEV) {
        // In development, check if a service worker exists
        checkValidServiceWorker(swUrl, config);
      } else {
        // In production, register the service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: any) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Check for updates every 24 hours
      setInterval(() => {
        registration.update();
      }, 24 * 60 * 60 * 1000);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log('New content is available and will be used when all tabs are closed.');
              
              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              
              // Also trigger our custom update handler
              onServiceWorkerUpdate(registration);
            } else {
              // At this point, everything has been precached.
              console.log('Content is cached for offline use.');
              
              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: any) {
  // Check if the service worker can be found.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

// Unregister service worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Force an update of the service worker
export function forceUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        // Send a message to the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload once the new service worker takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
    });
  }
}

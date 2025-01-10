import { createSignal, Show, type Component } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'
import { Modal } from './components'

import css from './PWABadge.module.css'

/** Custom event for the PWA installation event */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string
  }
  >;
}

const PWABadge: Component = () => {
  // Don't install the service worker if disabled
  if (import.meta.env.IO_DISABLE_SW) {
    return null;
  }

  /** Intercepts the install event for the PWA */
  const [installEvent, setInstallEvent] = createSignal<BeforeInstallPromptEvent | null>(null);

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevent the default install prompt
    setInstallEvent(e as BeforeInstallPromptEvent); // Save the event for later use
  });

  /** Handles intercepting the install event */
  function handleInstall() {
    const promptEvent = installEvent();
    if (!promptEvent) return;

    promptEvent.prompt(); // Show the install prompt
    promptEvent.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallEvent(null); // Clear the saved event
      close();
    });
  }

  // check for updates every 1m
  const period = 1 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(serviceUrl, reg) {
      if (period <= 0) return;

      if (reg?.active?.state === 'activated') {
        return registerPeriodicSync(period, serviceUrl, reg);
      }
      if (reg?.installing) {
        reg.installing.addEventListener('statechange', (e) => {
          const worker = e.target as ServiceWorker;
          if (worker.state === 'activated') registerPeriodicSync(period, serviceUrl, reg);
        });
      }
    },
    onNeedRefresh() {
      setNeedRefresh(true)
    },
    onOfflineReady() {
      setOfflineReady(true)
    }
  });

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div class={css.Container} role="alert" aria-labelledby="toast-message">
      <Modal show={offlineReady() || needRefresh()} onClose={close}>
        <Show when={offlineReady()}>
          <h2 class="subtitle">Aplicación lista sin conexión</h2>

          <div class="field is-flex is-justify-content-center" style={{ gap: "5%" }}>
            <button class="column button is-success is-outlined" onClick={handleInstall}>Instalar</button>
            <button class="column button is-danger is-outlined" onClick={close}>Cerrar</button>
          </div>
        </Show>
        <Show when={needRefresh()}>
          <h2 class="subtitle has-text-centered">Hay una actualización disponible</h2>

          <div class="field is-flex is-justify-content-center" style={{ gap: "5%" }}>
            <button class="column button is-success is-outlined" onClick={() => updateServiceWorker(true)}>
              Actualizar
            </button>
            <button class="column button is-danger is-outlined" onClick={close}>Cerrar</button>
          </div>
        </Show>
      </Modal>
    </div>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every 10m, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, workerUrl: string, reg: ServiceWorkerRegistration) {
  if (period <= 0) return;

  setInterval(async () => {
    if (!navigator.onLine) {
      return;
    }

    const response = await fetch(workerUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    });

    if (response?.status === 200)
      await reg.update();
  }, period);
}

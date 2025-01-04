import { useRegisterSW } from 'virtual:pwa-register/solid'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'

import css from './PWABadge.module.css'
import { Modal } from './components'

const PWABadge: Component = () => {
  // check for updates every 10m
  const period = 10 * 60 * 1000;

  const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(serviceUrl, reg) {
      if (period <= 0) {
        return;
      } else if (reg?.active?.state === 'activated') {
        registerPeriodicSync(period, serviceUrl, reg)
      } else if (reg?.installing) {
        reg.installing.addEventListener('statechange', (e) => {
          const worker = e.target as ServiceWorker;
          if (worker.state === 'activated')
            registerPeriodicSync(period, serviceUrl, reg)
        })
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

  function updateSW() {
    updateServiceWorker(true).then(() => window.location.reload())
  }

  return (
    <div class={css.Container} role="alert" aria-labelledby="toast-message">
      <Modal show={offlineReady() || needRefresh()} onClose={close}>
        <Show when={offlineReady()}>
          <div class={css.Message}>
            <span id="toast-message">Aplicación lista sin conexión</span>
          </div>
        </Show>
        <Show when={needRefresh()}>
          <div class={css.Message}>
            <span id="toast-message">Hay una actualización disponible</span>
          </div>

          <div class="field is-flex is-justify-content-center" style={{ gap: "5%" }}>
            <button class="column button is-success is-outlined" onClick={updateSW}>Actualizar</button>
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

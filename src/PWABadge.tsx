import { useRegisterSW } from 'virtual:pwa-register/solid'
import type { Component } from 'solid-js'
import { Show } from 'solid-js'

import css from './PWABadge.module.css'

const PWABadge: Component = () => {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
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
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div class={css.Container} role="alert" aria-labelledby="toast-message"><div class="begin">
      <Show when={offlineReady() || needRefresh()}>
        <div class={css.Toast}>
          <div class={css.Message}>
            <Show
              fallback={<span id="toast-message">Hay una actualización disponible. Da click para actualizar.</span>}
              when={offlineReady()}
            >
              <span id="toast-message">Aplicación lista sin conexión</span>
            </Show>
          </div>
          <div>
            <Show when={needRefresh()}>
              <button class={css.ToastButton} onClick={() => updateServiceWorker(true)}>Recargar</button>
            </Show>
            <button class={css.ToastButton} onClick={() => close()}>Cerrar</button>
          </div>
        </div>
      </Show></div>
    </div>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, workerUrl: string, reg: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) {
      return;
    }

    const resp = await fetch(workerUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    });

    if (resp?.status === 200)
      await reg.update();
  }, period);
}

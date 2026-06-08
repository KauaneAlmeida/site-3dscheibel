// Single source of truth for the Android check. Android gets the lightweight
// video fallbacks instead of the heavy WebGL scenes.
//
// `?android` (or `?android=1`) in the URL forces the Android path on any
// device, so the video version can be previewed/tested on desktop. `?android=0`
// forces it OFF even on a real Android.
function compute() {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  if (q.has('android')) return q.get('android') !== '0'
  return /Android/i.test(navigator.userAgent)
}

export const IS_ANDROID = compute()

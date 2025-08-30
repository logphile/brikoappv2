self.onmessage = async (_e: MessageEvent) => {
  // TODO: off-main-thread PDF creation with jsPDF
  // @ts-ignore
  self.postMessage({ ok: true })
}
export {}

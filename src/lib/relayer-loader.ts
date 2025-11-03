const SDK_CDN_URL =
  "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs";

type FhevmWindow = Window & {
  relayerSDK?: any & { __initialized__?: boolean };
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export async function loadRelayerSDK(): Promise<void> {
  if (!isBrowser()) throw new Error("Relayer SDK can only run in browser");
  const w = window as unknown as FhevmWindow;
  if (w.relayerSDK) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src=\"${SDK_CDN_URL}\"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_CDN_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${SDK_CDN_URL}`));
    document.head.appendChild(s);
  });
}

export async function getRelayer(): Promise<any> {
  await loadRelayerSDK();
  const w = window as unknown as FhevmWindow;
  if (!w.relayerSDK) throw new Error("Relayer SDK not available on window");
  if (w.relayerSDK.__initialized__ !== true) {
    const ok = await w.relayerSDK.initSDK();
    if (!ok) throw new Error("Relayer SDK init failed");
    w.relayerSDK.__initialized__ = true;
  }
  return w.relayerSDK;
}

let __instance: any | undefined;

export async function getFhevmInstance(): Promise<any> {
  if (__instance) return __instance;
  const sdk = await getRelayer();
  // Build config for Sepolia using SDK defaults; network set to RPC URL for consistency
  const network = (import.meta as any).env?.VITE_RPC_URL || "https://1rpc.io/sepolia";
  const config = { ...sdk.SepoliaConfig, network };
  __instance = await sdk.createInstance(config);
  return __instance;
}



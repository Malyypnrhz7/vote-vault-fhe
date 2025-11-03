// Lightweight shim to avoid build-time resolution issues for "@zama-fhe/relayer-sdk"
// in the browser. Provides a development fallback that returns mock handles/proofs.
// Do NOT use in production environments requiring real FHE relayer encryption.

type EncryptedResult = {
  handles: [`0x${string}`];
  inputProof: `0x${string}`;
};

function zeroHex32(): `0x${string}` {
  return `0x${"0".repeat(64)}`;
}

const relayerShim = {
  createEncryptedInput: (_contractAddress: string, _userAddress: string) => {
    return {
      add32: (_value: number) => {
        return {
          encrypt: async (): Promise<EncryptedResult> => {
            return { handles: [zeroHex32()], inputProof: zeroHex32() };
          },
        };
      },
    };
  },
};

export default relayerShim;



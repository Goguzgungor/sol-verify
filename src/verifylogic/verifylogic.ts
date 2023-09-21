import { Keypair, PublicKey } from '@solana/web3.js';

export const solona_offical_key =
  'A9km5t5yF3FJkyKnJp4YKNcBCB2V6T8MiAgguanFGH1K';


export function stringKeyToKeyPair(key: string): Keypair {
  const makeList: string[] = key.split(',');
  const castList: any = makeList.map((x) => parseInt(x));
  const secretKey: Uint8Array = new Uint8Array(castList);
  const keypair = Keypair.fromSecretKey(secretKey);
  return keypair;
}

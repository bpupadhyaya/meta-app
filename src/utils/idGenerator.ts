import * as Crypto from 'expo-crypto';

export function generateId(): string {
  return Crypto.randomUUID();
}

export function generateComponentId(type: string): string {
  return `${type}-${Crypto.randomUUID().slice(0, 8)}`;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter {
  private prefix: string;

  constructor(appId: string) {
    this.prefix = `metaapp_${appId}_`;
  }

  async get(key: string): Promise<unknown> {
    const raw = await AsyncStorage.getItem(this.prefix + key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(this.prefix + key, serialized);
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(this.prefix + key);
  }

  async getAllKeys(): Promise<string[]> {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys
      .filter((k) => k.startsWith(this.prefix))
      .map((k) => k.slice(this.prefix.length));
  }

  async getMultiple(keys: string[]): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }

  async setMultiple(entries: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value);
    }
  }

  async clear(): Promise<void> {
    const keys = await this.getAllKeys();
    for (const key of keys) {
      await this.remove(key);
    }
  }
}

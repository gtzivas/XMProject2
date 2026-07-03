// Mock for react-native-mmkv
const storage = new Map<string, string>();

export class MMKV {
  set(key: string, value: string | number | boolean): void {
    storage.set(key, JSON.stringify(value));
  }
  getString(key: string): string | undefined {
    const v = storage.get(key);
    return v !== undefined ? JSON.parse(v) : undefined;
  }
  getNumber(key: string): number | undefined {
    const v = storage.get(key);
    return v !== undefined ? JSON.parse(v) : undefined;
  }
  getBoolean(key: string): boolean | undefined {
    const v = storage.get(key);
    return v !== undefined ? JSON.parse(v) : undefined;
  }
  delete(key: string): void {
    storage.delete(key);
  }
  clearAll(): void {
    storage.clear();
  }
  contains(key: string): boolean {
    return storage.has(key);
  }
}

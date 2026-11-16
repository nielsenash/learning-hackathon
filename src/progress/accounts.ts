export type Account = {
  id: string;
  name: string;
  email: string;
};

type StoredAccount = Account & {
  passwordHash: string;
};

type KeyValueStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const ACCOUNTS_KEY = "pitch-recognition-accounts";
const SESSION_KEY = "pitch-recognition-session";

function readAccounts(storage: Pick<KeyValueStore, "getItem">): StoredAccount[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(ACCOUNTS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (account): account is StoredAccount =>
        Boolean(account) &&
        typeof account === "object" &&
        typeof account.id === "string" &&
        typeof account.name === "string" &&
        typeof account.email === "string" &&
        typeof account.passwordHash === "string",
    );
  } catch {
    return [];
  }
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicAccount(account: StoredAccount): Account {
  const { passwordHash: _passwordHash, ...safeAccount } = account;
  return safeAccount;
}

export function loadSession(storage: Pick<KeyValueStore, "getItem"> = localStorage): Account | null {
  const sessionId = storage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  return readAccounts(storage).map(publicAccount).find((account) => account.id === sessionId) ?? null;
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
  storage: KeyValueStore = localStorage,
): Promise<Account> {
  const accounts = readAccounts(storage);
  if (accounts.some((account) => account.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }
  const account: StoredAccount = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    passwordHash: await hashPassword(password),
  };
  storage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  storage.setItem(SESSION_KEY, account.id);
  return publicAccount(account);
}

export async function login(
  email: string,
  password: string,
  storage: KeyValueStore = localStorage,
): Promise<Account> {
  const account = readAccounts(storage).find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!account || account.passwordHash !== (await hashPassword(password))) {
    throw new Error("Email or password is incorrect.");
  }
  storage.setItem(SESSION_KEY, account.id);
  return publicAccount(account);
}

export function logout(storage: KeyValueStore = localStorage): void {
  storage.setItem(SESSION_KEY, "");
}

export function progressStorageKey(accountId: string): string {
  return `pitch-recognition-progress:${accountId}`;
}

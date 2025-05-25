import { getAuth, UserRecord } from 'firebase-admin/auth';

export async function getUsers(users: UserRecord[] = [], nextPageToken?: string): Promise<UserRecord[]> {
  const result = await getAuth().listUsers(1000, nextPageToken);
  users = users.concat(result.users);
  if (result.pageToken) {
    return getUsers(users, result.pageToken);
  }

  return users;
}

export function firestoreAutoId(): string {
  // Alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  while (autoId.length < 20) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

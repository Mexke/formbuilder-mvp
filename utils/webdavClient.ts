import { createClient } from 'webdav'

export function buildWebdavClient(baseUrl: string, username: string, password: string){
  return createClient(baseUrl, { username, password });
}

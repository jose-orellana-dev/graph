import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Project } from '../types/proyect';

interface MyDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>('ProjectsDB', 1, {
      upgrade(db) {
        db.createObjectStore('projects', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function addProjects(projects: Project[]) {
  const db = await getDB();
  const tx = db.transaction('projects', 'readwrite');
  for (const project of projects) {
    await tx.store.put(project);
  }
  await tx.done;
}

export async function getAllProjects() {
  const db = await getDB();
  return db.getAll('projects');
}
export async function getProjectsByDependency(parentId: string) {
    const db = await getDB();
    const allProjects = await db.getAll('projects');
    return allProjects.filter(
      (p: Project) => Array.isArray(p.dependencies) && p.dependencies.includes(parentId)
    );
  }

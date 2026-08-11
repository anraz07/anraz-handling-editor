import { oxmysql } from '@overextended/oxmysql';
export function getExport<T = any>(resource: string): T {
  const res = (globalThis as any).exports?.[resource];
  if (!res) {
    throw new Error(`Export resource '${resource}' is not loaded or missing.`);
  }
  return res as T;
}

export interface QBCoreExport {
  getCoreObject: () => any;
}

export interface ESXExport {
  getSharedObject(): any;
}

declare namespace CitizenFX {
  namespace Core {
    interface Exports {
      ['qb-core']: QBCoreExport;
      ['es_extended']: ESXExport;
    }
  }
}
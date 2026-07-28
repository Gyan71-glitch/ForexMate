"use client";

import { useSyncStream } from '@/hooks/useSyncStream';

export function SyncListener() {
  useSyncStream();
  return null;
}

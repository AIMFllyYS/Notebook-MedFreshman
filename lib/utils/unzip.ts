import { unzipSync, type Unzipped } from "fflate";

/**
 * 带安全上限的 unzipSync：用户导入的 zip/skill/pptx 均不可信，
 * 无界解压会被 zip bomb（声明或实际解压体积巨大）打爆内存。
 * filter 在解压每个条目前生效，超限/不命中的条目直接跳过。
 */

export class UnsafeArchiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeArchiveError";
  }
}

export interface UnzipLimits {
  /** 压缩包本体字节上限（默认 256 MB）。 */
  maxInputBytes?: number;
  /** 单条文件解压后字节上限（默认 64 MB）。 */
  maxFileBytes?: number;
  /** 全部解压输出合计字节上限（默认 256 MB）。 */
  maxTotalBytes?: number;
  /** 解压条目数上限（默认 4096）。 */
  maxEntries?: number;
  /** 只解压命中的条目（其余不解压、不进结果）。 */
  include?: (name: string) => boolean;
}

export function unzipWithinLimits(data: Uint8Array, limits: UnzipLimits = {}): Unzipped {
  const maxInputBytes = limits.maxInputBytes ?? 256 * 1024 * 1024;
  const maxFileBytes = limits.maxFileBytes ?? 64 * 1024 * 1024;
  const maxTotalBytes = limits.maxTotalBytes ?? 256 * 1024 * 1024;
  const maxEntries = limits.maxEntries ?? 4096;

  if (data.byteLength > maxInputBytes) {
    throw new UnsafeArchiveError(`archive exceeds ${maxInputBytes} bytes`);
  }

  let accepted = 0;
  let declaredTotal = 0;
  const files = unzipSync(data, {
    filter: (file) => {
      if (accepted >= maxEntries) return false;
      if (file.originalSize > maxFileBytes) return false;
      if (declaredTotal + file.originalSize > maxTotalBytes) return false;
      if (limits.include && !limits.include(file.name)) return false;
      accepted += 1;
      declaredTotal += file.originalSize;
      return true;
    },
  });

  // originalSize 来自 zip 中央目录，可能被谎报；解压后再核一遍实际体积。
  let actualTotal = 0;
  for (const name of Object.keys(files)) {
    actualTotal += files[name].byteLength;
    if (actualTotal > maxTotalBytes) {
      throw new UnsafeArchiveError(`decompressed content exceeds ${maxTotalBytes} bytes`);
    }
  }
  return files;
}

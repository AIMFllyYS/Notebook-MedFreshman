const MAX_AVATAR_BYTES = 350_000;

function canvasToJpeg(source: HTMLImageElement, quality: number): Promise<string> {
  const maxEdge = 256;
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height, 1));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法处理头像");
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("无法处理头像"));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("无法读取头像"));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("无法读取头像"));
    image.src = dataUrl;
  });
}

export async function fileToLocalAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("请选择图片文件");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("无法读取头像"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
  if (dataUrl.length <= MAX_AVATAR_BYTES) return dataUrl;
  const image = await loadImage(dataUrl);
  for (const quality of [0.82, 0.64, 0.48]) {
    const next = await canvasToJpeg(image, quality);
    if (next.length <= MAX_AVATAR_BYTES) return next;
  }
  throw new Error("图片太大，请换一张更小的");
}

export function isLocalAvatarUrl(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("data:image/");
}

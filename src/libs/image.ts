export function convertToStream(base64Image: string): Buffer {
  return Buffer.from(base64Image, 'base64')
}

export function getFileExtension(base64Image: string): string {
  const [part1] = base64Image.split(';')
  return part1.split('/')[1]
}

/**
 * Cloudinary Storage Service
 * Layanan untuk mengunggah gambar produk dari Kamera / Galeri ke Cloudinary Cloud Storage.
 * Mengembalikan HTTPS URL publik yang dapat diakses oleh semua pengguna.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'j8waf8jp',
  apiKey: '821369277989516',
  apiSecret: '3NM4siuCn9bC6z4zsZIz7hzL2xQ',
};

/**
 * Fungsi SHA-1 dalam murni JS untuk membuat signature otentikasi Cloudinary
 */
function sha1(str: string): string {
  function utf8Encode(s: string): string {
    return unescape(encodeURIComponent(s));
  }

  const encodedStr = utf8Encode(str);
  const words: number[] = [];

  for (let i = 0; i < encodedStr.length; i++) {
    words[i >> 2] |= encodedStr.charCodeAt(i) << (24 - (i % 4) * 8);
  }

  const bitLength = encodedStr.length * 8;
  words[bitLength >> 5] |= 0x80 << (24 - (bitLength % 32));
  words[(((bitLength + 64) >> 9) << 4) + 15] = bitLength;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  let e = -1009589776;

  for (let i = 0; i < words.length; i += 16) {
    const w: number[] = new Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = words[i + j] || 0;
    }
    for (let j = 16; j < 80; j++) {
      const val = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (val << 1) | (val >>> 31);
    }

    let tempA = a;
    let tempB = b;
    let tempC = c;
    let tempD = d;
    let tempE = e;

    for (let j = 0; j < 80; j++) {
      let f = 0;
      let k = 0;

      if (j < 20) {
        f = (tempB & tempC) | (~tempB & tempD);
        k = 1518500249;
      } else if (j < 40) {
        f = tempB ^ tempC ^ tempD;
        k = 1859775393;
      } else if (j < 60) {
        f = (tempB & tempC) | (tempB & tempD) | (tempC & tempD);
        k = -1894007588;
      } else {
        f = tempB ^ tempC ^ tempD;
        k = -899497514;
      }

      const temp =
        (((tempA << 5) | (tempA >>> 27)) + f + tempE + k + w[j]) & 0xffffffff;
      tempE = tempD;
      tempD = tempC;
      tempC = (tempB << 30) | (tempB >>> 2);
      tempB = tempA;
      tempA = temp;
    }

    a = (a + tempA) & 0xffffffff;
    b = (b + tempB) & 0xffffffff;
    c = (c + tempC) & 0xffffffff;
    d = (d + tempD) & 0xffffffff;
    e = (e + tempE) & 0xffffffff;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hex(a) + hex(b) + hex(c) + hex(d) + hex(e);
}

/**
 * Mengunggah gambar dari file URI lokal / base64 ke Cloudinary Storage
 * @param imageUri URI lokasi file gambar lokal (misal file:///... atau content://...)
 * @returns Promise<string> URL publik Cloudinary (secure_url)
 */
export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  // Jika URI sudah berupa URL HTTP/HTTPS publik, tidak perlu diunggah lagi
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    return imageUri;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const stringToSign = `timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
  const signature = sha1(stringToSign);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  const formData = new FormData();

  // Memformat file attachment untuk React Native FormData
  if (imageUri.startsWith('data:image')) {
    formData.append('file', imageUri);
  } else {
    const filename = imageUri.split('/').pop() || `product_${Date.now()}.jpg`;
    const fileType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      type: fileType,
      name: filename,
    } as any);
  }

  formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error('[Cloudinary] Upload failed response:', responseData);
    throw new Error(
      responseData?.error?.message || 'Gagal mengunggah foto ke Cloudinary storage.',
    );
  }

  return responseData.secure_url;
}

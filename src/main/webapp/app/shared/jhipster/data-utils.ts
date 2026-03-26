/** Formats a byte count with thousands-separated digits (e.g. '1 024 bytes'). */
const formatAsBytes = (size: number): string => `${size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} bytes`; // NOSONAR

/** Checks whether `str` ends with the given `suffix`. */
export const endsWith = (suffix: string, str: string): boolean => str.includes(suffix, str.length - suffix.length);

/** Returns the number of Base64 padding characters ('=') at the end of a string. */
export const paddingSize = (value: string): number => {
  if (endsWith('==', value)) {
    return 2;
  }
  if (endsWith('=', value)) {
    return 1;
  }
  return 0;
};

/** Calculates the decoded byte size from a Base64-encoded string. */
const size = (value: string): number => (value.length / 4) * 3 - paddingSize(value);

/** Reads a File object and delivers its Base64-encoded content via callback. */
export const toBase64 = (file: File, callback: (base64Data: string) => void): void => {
  const fileReader: FileReader = new FileReader();
  fileReader.onload = (e: ProgressEvent<FileReader>) => {
    if (typeof e.target?.result === 'string') {
      const base64Data: string = e.target.result.substring(e.target.result.indexOf('base64,') + 'base64,'.length);
      callback(base64Data);
    }
  };
  fileReader.readAsDataURL(file);
};

/** Decodes a Base64 string into a Blob and opens it in a new browser tab. */
export const openFile = (data: string, contentType: string | null | undefined): void => {
  contentType ??= '';

  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: contentType,
  });
  const fileURL = globalThis.URL.createObjectURL(blob);
  const win = globalThis.open(fileURL);
  if (win) {
    win.onload = () => URL.revokeObjectURL(fileURL);
  }
};

/** Returns a human-readable byte size string for a Base64-encoded value. */
export const byteSize = (base64String: string): string => formatAsBytes(size(base64String));

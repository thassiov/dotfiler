function ensureString (data: unknown): unknown {
  if (typeof data !== 'string') {
    return JSON.stringify(data);
  }
  return data;
}

function removeNewLines(str: string): string {
  return str.replace(/\s+/g, '');
}

function limitStringSize(str: string, size: number, showTail: boolean): string {
  if (str.length > size ) {
    if (showTail) {
      return '...' + str.substring(str.length - size);
    }
    return str.substring(0, size) + '...';
  }
  return str
}

function strToJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch (err) {
    throw err;
  }
}

export {
  ensureString,
  removeNewLines,
  limitStringSize,
  strToJson,
};

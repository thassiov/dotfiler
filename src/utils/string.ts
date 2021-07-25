function ensureString (data) {
  if (typeof data !== 'string') {
    return JSON.stringify(data);
  }
  return data;
}

function removeNewLines(str) {
  return str.replace(/\s+/g, '');
}

function limitStringSize(str, size, showTail) {
  if (str.length > size ) {
    if (showTail) {
      return '...' + str.substring(str.length - size);
    }
    return str.substring(0, size) + '...';
  }
  return str
}

function strToJson(str) {
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

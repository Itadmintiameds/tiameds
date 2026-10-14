// Minimal reader for legacy Word 97-2003 (.doc) files, enough to pull out the body text and tables.
// Formatting (bold, fonts) is not recoverable this way, so headings are guessed from the text
// ("FINDINGS:", "IMPRESSION"). Written without a dependency because the .doc format is a plain
// OLE2 container: header -> FAT -> directory -> "WordDocument" + "0Table"/"1Table" streams -> piece table.

const ENDOFCHAIN = 0xfffffffe;
const FREESECT = 0xffffffff;

interface DirEntry {
  name: string;
  type: number;
  start: number;
  size: number;
}

class OleFile {
  private view: DataView;
  private sectorSize: number;
  private miniSectorSize: number;
  private miniCutoff: number;
  private fat: number[] = [];
  private miniFat: number[] = [];
  private entries: DirEntry[] = [];
  private miniStream: Uint8Array = new Uint8Array(0);

  constructor(private bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const magic = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    if (bytes.length < 512 || magic.some((b, i) => bytes[i] !== b)) {
      throw new Error('This is not a valid Word .doc file.');
    }
    this.sectorSize = 1 << this.view.getUint16(0x1e, true);
    this.miniSectorSize = 1 << this.view.getUint16(0x20, true);
    this.miniCutoff = this.view.getUint32(0x38, true);

    // FAT sector list: 109 entries in the header, the rest chained through DIFAT sectors
    const fatSectors: number[] = [];
    for (let i = 0; i < 109; i++) {
      const s = this.view.getUint32(0x4c + i * 4, true);
      if (s !== FREESECT) fatSectors.push(s);
    }
    let difat = this.view.getUint32(0x44, true);
    const perSector = this.sectorSize / 4 - 1;
    let guard = 0;
    while (difat !== ENDOFCHAIN && difat !== FREESECT && guard++ < 10000) {
      const off = this.sectorOffset(difat);
      for (let i = 0; i < perSector; i++) {
        const s = this.view.getUint32(off + i * 4, true);
        if (s !== FREESECT) fatSectors.push(s);
      }
      difat = this.view.getUint32(off + perSector * 4, true);
    }
    fatSectors.forEach(s => {
      const off = this.sectorOffset(s);
      for (let i = 0; i < this.sectorSize / 4; i++) this.fat.push(this.view.getUint32(off + i * 4, true));
    });

    const dir = this.readChain(this.view.getUint32(0x30, true));
    for (let off = 0; off + 128 <= dir.length; off += 128) {
      const dv = new DataView(dir.buffer, dir.byteOffset + off, 128);
      const nameLen = Math.max(0, dv.getUint16(0x40, true) - 2);
      let name = '';
      for (let i = 0; i < nameLen; i += 2) name += String.fromCharCode(dv.getUint16(i, true));
      this.entries.push({ name, type: dv.getUint8(0x42), start: dv.getUint32(0x74, true), size: dv.getUint32(0x78, true) });
    }

    const root = this.entries.find(e => e.type === 5);
    if (root) {
      this.miniStream = this.readChain(root.start).subarray(0, root.size);
      const miniFatBytes = this.readChain(this.view.getUint32(0x3c, true));
      const mv = new DataView(miniFatBytes.buffer, miniFatBytes.byteOffset, miniFatBytes.byteLength);
      for (let i = 0; i + 4 <= miniFatBytes.length; i += 4) this.miniFat.push(mv.getUint32(i, true));
    }
  }

  private sectorOffset(sector: number) {
    return (sector + 1) * this.sectorSize;
  }

  private readChain(start: number): Uint8Array {
    const chunks: Uint8Array[] = [];
    let sector = start;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && guard++ < this.fat.length + 1) {
      const off = this.sectorOffset(sector);
      if (off + this.sectorSize > this.bytes.length) break;
      chunks.push(this.bytes.subarray(off, off + this.sectorSize));
      sector = this.fat[sector] ?? ENDOFCHAIN;
    }
    return concat(chunks);
  }

  private readMiniChain(start: number): Uint8Array {
    const chunks: Uint8Array[] = [];
    let sector = start;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && guard++ < this.miniFat.length + 1) {
      const off = sector * this.miniSectorSize;
      chunks.push(this.miniStream.subarray(off, off + this.miniSectorSize));
      sector = this.miniFat[sector] ?? ENDOFCHAIN;
    }
    return concat(chunks);
  }

  stream(name: string): Uint8Array | null {
    const entry = this.entries.find(e => e.type === 2 && e.name === name);
    if (!entry) return null;
    const data = entry.size < this.miniCutoff ? this.readMiniChain(entry.start) : this.readChain(entry.start);
    return data.subarray(0, entry.size);
  }
}

const concat = (chunks: Uint8Array[]) => {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let pos = 0;
  chunks.forEach(c => {
    out.set(c, pos);
    pos += c.length;
  });
  return out;
};

// cp1252 bytes 0x80-0x9F that differ from Latin-1
const CP1252: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š',
  0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
};

// Body text of the document, with Word control characters left in (\r paragraph, \x07 cell end).
const extractRawText = (ole: OleFile): string => {
  const word = ole.stream('WordDocument');
  if (!word || word.length < 0x1a6 + 4) throw new Error('This .doc file has no readable Word content.');
  const wv = new DataView(word.buffer, word.byteOffset, word.byteLength);
  if (wv.getUint16(0, true) !== 0xa5ec) throw new Error('This is not a Word document.');
  if (wv.getUint16(0x0a, true) & 0x0100) throw new Error('This .doc file is encrypted or password protected.');

  const table = ole.stream(wv.getUint16(0x0a, true) & 0x0200 ? '1Table' : '0Table');
  if (!table) throw new Error('This .doc file is damaged (no table stream).');
  const tv = new DataView(table.buffer, table.byteOffset, table.byteLength);

  const ccpText = wv.getUint32(0x4c, true);
  const fcClx = wv.getUint32(0x1a2, true);
  const lcbClx = wv.getUint32(0x1a6, true);

  // Clx = Prc* (type 1, skipped) then Pcdt (type 2) holding the piece table
  let pos = fcClx;
  const end = fcClx + lcbClx;
  while (pos < end && table[pos] === 1) pos += 3 + tv.getUint16(pos + 1, true);
  if (table[pos] !== 2) throw new Error('This .doc file uses an unsupported layout.');
  const plcLen = tv.getUint32(pos + 1, true);
  const plcStart = pos + 5;
  const pieces = Math.floor((plcLen - 4) / 12);

  let text = '';
  for (let i = 0; i < pieces; i++) {
    const cpStart = tv.getUint32(plcStart + i * 4, true);
    const cpEnd = tv.getUint32(plcStart + (i + 1) * 4, true);
    if (cpStart >= ccpText) break;
    const length = Math.min(cpEnd, ccpText) - cpStart;
    const fcRaw = tv.getUint32(plcStart + (pieces + 1) * 4 + i * 8 + 2, true);
    if (fcRaw & 0x40000000) {
      const offset = (fcRaw & 0x3fffffff) >>> 1;
      for (let j = 0; j < length; j++) {
        const b = word[offset + j];
        text += CP1252[b] ?? String.fromCharCode(b);
      }
    } else {
      for (let j = 0; j < length; j++) text += String.fromCharCode(wv.getUint16(fcRaw + j * 2, true));
    }
  }
  return text;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Short line that ends with ":" or is written in capitals, e.g. "FINDINGS:" / "IMPRESSION"
const looksLikeHeading = (line: string) => {
  const text = line.trim();
  if (!text || text.length > 60) return false;
  if (/:$/.test(text)) return true;
  return /[A-Z]/.test(text) && text === text.toUpperCase() && !/\d{3,}/.test(text);
};

// Converts a legacy .doc file into simple HTML (h3 / p / table) for the shared section splitter.
export const legacyDocToHtml = (buffer: ArrayBuffer): string => {
  const ole = new OleFile(new Uint8Array(buffer));
  const raw = extractRawText(ole)
    .replace(/\x13[^\x14\x15]*\x14/g, '') // field code, keep the field result
    .replace(/[\x13\x14\x15\x01\x08]/g, '')
    .replace(/\x0b/g, '\n')
    .replace(/\x0c/g, '\r')
    .replace(/ /g, ' ');

  const html: string[] = [];
  let rows: string[][] = [];
  let cells: string[] = [];
  let cell = '';

  const flushTable = () => {
    if (!rows.length) return;
    html.push(
      `<table>${rows
        .map(r => `<tr>${r.map(c => `<td>${escapeHtml(c.trim())}</td>`).join('')}</tr>`)
        .join('')}</table>`
    );
    rows = [];
  };
  const pushParagraph = (line: string) => {
    const text = line.trim();
    if (!text) return;
    html.push(looksLikeHeading(text) ? `<h3>${escapeHtml(text)}</h3>` : `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`);
  };

  for (const ch of raw) {
    if (ch === '\x07') {
      if (cell === '' && cells.length) {
        // an empty cell mark right after the last cell closes the row
        rows.push(cells);
        cells = [];
      } else {
        cells.push(cell);
        cell = '';
      }
    } else if (ch === '\r') {
      if (cells.length) {
        cell += ' '; // paragraph break inside a table cell
      } else {
        flushTable();
        pushParagraph(cell);
        cell = '';
      }
    } else {
      cell += ch;
    }
  }
  flushTable();
  pushParagraph(cell);
  return html.join('');
};

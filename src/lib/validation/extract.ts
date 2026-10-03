import { unzipSync, strFromU8 } from "fflate";
import { extractText } from "unpdf";

export type ExtractedFile = { path: string; text: string };
export type ExtractedBundle = { files: ExtractedFile[]; warnings: string[] };

export class BundleError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const TEXT_EXTENSIONS = new Set([
  ".php", ".sql", ".conf", ".sh", ".txt", ".md", ".html", ".htm", ".css",
  ".js", ".ini", ".cnf", ".env", ".htaccess", ".log", ".json", ".yml",
  ".yaml", ".xml", ".service", ".timer",
]);

const TEXT_FILENAMES = new Set(["dockerfile", "crontab", "makefile", ".htaccess"]);

const SKIP_DIRS = ["__macosx/", ".git/", "node_modules/", "vendor/"];
const MAX_ENTRIES = 300;
const MAX_ENTRY_SIZE = 2 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;

function extOf(path: string): string {
  const base = path.slice(path.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot).toLowerCase() : "";
}

function isZipMagic(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

function decodeUtf8(bytes: Uint8Array): string {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new BundleError("INVALID_FILE_TYPE", "File is not valid UTF-8 text.");
  }
  if (text.includes("\u0000")) {
    throw new BundleError("INVALID_FILE_TYPE", "File contains NUL bytes — not a text file.");
  }
  return text;
}

function normalizePath(path: string): string | null {
  const cleaned = path.replace(/\\/g, "/").replace(/^(\.\/|\/)+/, "");
  if (!cleaned || cleaned.split("/").some((seg) => seg === "..")) return null;
  return cleaned;
}

function isTextLike(path: string): boolean {
  const base = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  return TEXT_EXTENSIONS.has(extOf(path)) || TEXT_FILENAMES.has(base);
}

function docxToText(bytes: Uint8Array): string {
  const entries = unzipSync(bytes);
  const doc = entries["word/document.xml"];
  if (!doc) throw new BundleError("INVALID_FILE_TYPE", "DOCX has no word/document.xml.");
  const xml = strFromU8(doc);
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function unzipBundle(bytes: Uint8Array): ExtractedBundle {
  const entries = unzipSync(bytes, {
    filter: (file) => !file.name.endsWith("/") && !SKIP_DIRS.some((d) => file.name.toLowerCase().replace(/^\.?\//, "").startsWith(d)),
  });
  const names = Object.keys(entries);
  if (names.length > MAX_ENTRIES) {
    throw new BundleError("ZIP_TOO_LARGE", `Archive has ${names.length} entries (max ${MAX_ENTRIES}).`);
  }
  const files: ExtractedFile[] = [];
  const warnings: string[] = [];
  let total = 0;
  for (const name of names.sort()) {
    const path = normalizePath(name);
    if (!path) {
      warnings.push(`Skipped unsafe path "${name}".`);
      continue;
    }
    const data = entries[name];
    total += data.length;
    if (total > MAX_TOTAL_SIZE) {
      throw new BundleError("ZIP_TOO_LARGE", `Archive expands past the 25 MB limit.`);
    }
    if (data.length > MAX_ENTRY_SIZE) {
      warnings.push(`Skipped "${path}" (larger than 2 MB).`);
      continue;
    }
    const ext = extOf(path);
    if (ext === ".docx" || ext === ".pdf" || ext === ".zip") {
      warnings.push(`Skipped nested "${path}" — include its text content as a plain file.`);
      continue;
    }
    if (!isTextLike(path)) {
      warnings.push(`Skipped "${path}" (not a text file).`);
      continue;
    }
    try {
      files.push({ path, text: decodeUtf8(data) });
    } catch {
      warnings.push(`Skipped "${path}" (not valid UTF-8).`);
    }
  }
  return { files, warnings };
}

/**
 * Extract a submission into a flat list of text files. Nothing is executed or
 * written to disk; paths are used only as labels.
 */
export async function extractBundle(
  fileName: string,
  bytes: Uint8Array,
  allowedExtensions?: string[],
): Promise<ExtractedBundle> {
  const ext = extOf(fileName);
  if (allowedExtensions && !allowedExtensions.includes(ext)) {
    throw new BundleError("INVALID_FILE_TYPE", `Extension "${ext || "(none)"}" is not allowed for this mission.`);
  }

  switch (ext) {
    case ".zip":
      if (!isZipMagic(bytes)) throw new BundleError("INVALID_FILE_TYPE", "File named .zip does not contain ZIP data.");
      return unzipBundle(bytes);
    case ".docx": {
      if (!isZipMagic(bytes)) throw new BundleError("INVALID_FILE_TYPE", "File named .docx is not a valid Office document.");
      const text = docxToText(bytes);
      return { files: [{ path: fileName, text }], warnings: [] };
    }
    case ".pdf": {
      if (!bytes.subarray(0, 5).every((b, i) => b === "%PDF-".charCodeAt(i))) {
        throw new BundleError("INVALID_FILE_TYPE", "File named .pdf does not contain PDF data.");
      }
      const { text } = await extractText(bytes, { mergePages: true });
      const joined = Array.isArray(text) ? text.join("\n") : String(text ?? "");
      const warnings = joined.trim() ? [] : ["PDF has no extractable text"];
      return { files: [{ path: fileName, text: joined }], warnings };
    }
    default: {
      // Text uploads (.txt .md .php .sql .sh .conf .ini, …): must be real UTF-8.
      const text = decodeUtf8(bytes);
      return { files: [{ path: fileName, text }], warnings: [] };
    }
  }
}

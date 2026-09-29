// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'vite';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// 回归测试：管理后台与客户页各自的样式必须随入口按需加载。
// 曾经两个 import() 写在同一个三元表达式里，压缩器把两处预加载调用合并，
// 构建产物里 /admin 只会加载客户页的 CSS，后台完全没有样式；开发模式下看不出来，
// 所以这里对真实构建产物做检查。

const root = resolve(__dirname, '../..');
let outDir = '';
let entry = '';

// 取某个入口动态 import 对应的预加载文件清单
const preloadsOf = (chunkPrefix: string): string[] => {
  const files = JSON.parse(entry.match(/m\.f=(\[[^\]]*\])/)?.[1] ?? '[]') as string[];
  const pattern = new RegExp(`import\\("\\./${chunkPrefix}-[\\w-]+\\.js"\\),__vite__mapDeps\\(\\[([\\d,]+)\\]\\)`);
  const indexes = entry.match(pattern)?.[1];
  if (!indexes) throw new Error(`入口里找不到 ${chunkPrefix} 的预加载清单`);
  return indexes.split(',').map((i) => files[Number(i)]);
};

describe('构建产物的按需加载清单', () => {
  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), 'pansou-build-'));
    await build({ root, logLevel: 'silent', build: { outDir, emptyOutDir: true } });
    const assets = join(outDir, 'assets');
    const entryFile = readdirSync(assets).find((f) => /^index-.*\.js$/.test(f));
    entry = readFileSync(join(assets, entryFile as string), 'utf-8');
  }, 180_000);

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it('/admin 加载管理后台自己的 CSS，不加载客户页的 CSS', () => {
    const deps = preloadsOf('AdminApp');
    expect(deps.some((f) => /AdminApp-[\w-]+\.css$/.test(f))).toBe(true);
    expect(deps.some((f) => /\/App-[\w-]+\.css$/.test(f))).toBe(false);
  });

  it('客户页加载自己的 CSS，不加载管理后台的 CSS', () => {
    const deps = preloadsOf('App');
    expect(deps.some((f) => /\/App-[\w-]+\.css$/.test(f))).toBe(true);
    expect(deps.some((f) => /AdminApp-/.test(f))).toBe(false);
  });
});

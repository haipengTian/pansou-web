import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// 守卫：业务代码只能使用 @/components/ui 中的组件，不能直接写原生控件或原生对话框。
//
// 原生控件让每个页面各带一套样式；原生 alert/confirm/prompt 会被 App 内 WebView、
// 嵌入式浏览器直接屏蔽（调用立即返回、界面无反应）。只有 src/components/ui 可以使用原生元素。

const SRC = join(__dirname, '..');
const UI_DIR = join(SRC, 'components', 'ui');

const RULES: { name: string; pattern: RegExp }[] = [
  { name: '原生控件标签', pattern: /<(button|input|select|textarea|table)(\s|>|$)/ },
  { name: '原生链接 <a>', pattern: /<a(\s|>|$)/ },
  { name: '渲染函数中的原生控件', pattern: /\bh\(\s*['"](button|input|select|textarea|table|a)['"]/ },
  { name: '原生对话框', pattern: /(^|[^\w.$])(window\.)?(alert|confirm|prompt)\s*\(/ },
  { name: '直接引用 naive-ui（应经由 @/components/ui）', pattern: /from\s+['"]naive-ui['"]/ }
];

const collectFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      return full === UI_DIR || name === '__tests__' ? [] : collectFiles(full);
    }
    return /\.(vue|ts)$/.test(name) && !name.endsWith('.spec.ts') ? [full] : [];
  });

// 去掉注释，避免说明文字里提到的标签被误报；保留换行以便报告行号。
const stripComments = (source: string) =>
  source
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

describe('业务代码不直接使用原生控件', () => {
  it('src/components/ui 之外没有原生控件与原生对话框', () => {
    const violations: string[] = [];
    for (const file of collectFiles(SRC)) {
      const lines = stripComments(readFileSync(file, 'utf-8')).split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const rule of RULES) {
          if (rule.pattern.test(line)) {
            violations.push(`${relative(SRC, file).split(sep).join('/')}:${index + 1} ${rule.name}: ${line.trim()}`);
          }
        }
      });
    }
    expect(violations, `请改用 @/components/ui 中的组件：\n${violations.join('\n')}`).toEqual([]);
  });
});

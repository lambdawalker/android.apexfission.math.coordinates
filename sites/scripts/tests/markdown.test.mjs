import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteMarkdown, base } from '../markdown.mjs';
test('raw guides stay Markdown, humans navigate HTML, and code remains untouched',()=>{
 const input = '[API](api.md)\n\n[Install](../../IMPORT.md)\n\n[Source](../../src/main/example.kt)\n\n```kotlin\nval link = "[API](api.md)"\n```';
 const raw = rewriteMarkdown(input,'docs/agents/index.md');
 assert.match(raw,/\[API\]\(api.md\)/); assert.match(raw,/\[Install\]\(..\/IMPORT.md\)/);
 assert.ok(raw.includes('github.com/lambdawalker/android.apexfission.math.coordinates/blob/main/src/main/example.kt'));
 const human = rewriteMarkdown(input,'docs/agents/index.md','human');
 assert.ok(human.includes(`${base}/reference/`)); assert.ok(human.includes('val link = "[API](api.md)"'));
});

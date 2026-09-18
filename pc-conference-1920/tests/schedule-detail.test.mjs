import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("ships a dedicated innovation lecture detail page", async () => {
  const [html, app, config] = await Promise.all([
    read("schedule-detail.html"),
    read("src/pages/schedule-detail/App.jsx"),
    read("vite.config.mjs"),
  ]);

  assert.match(html, /src\/entries\/schedule-detail\.jsx/);
  assert.match(app, /创新大讲堂：技术创新与产业未来/);
  assert.match(app, /09:30 — 11:30/);
  assert.match(app, /广州市海珠区/);
  assert.match(app, /开场致辞：湾区人才协同发展/);
  assert.match(config, /scheduleDetail/);
});

test("links the matching schedule card to its detail page", async () => {
  const schedule = await read("src/pages/schedule/App.jsx");

  assert.match(schedule, /href:\s*"\.\/schedule-detail\.html"/);
  assert.match(schedule, /创新大讲堂：技术创新与产业未来/);
});

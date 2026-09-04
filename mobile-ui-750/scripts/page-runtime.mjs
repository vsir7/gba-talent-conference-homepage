import { PAGE_BY_ID } from './page-registry.mjs?v=20260903-5';
import { PAGE_DATA } from './page-data.mjs?v=20260903-5';
import { renderScreen } from './render-core.mjs?v=20260903-5';

export function renderPageById(pageId) {
  const page = PAGE_BY_ID.get(pageId);
  if (!page) throw new Error(`Unknown page id: ${pageId}`);
  return renderScreen(page, PAGE_DATA[pageId]);
}

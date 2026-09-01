import { PAGE_BY_ID } from './page-registry.mjs';
import { PAGE_DATA } from './page-data.mjs';
import { renderScreen } from './render-core.mjs';

export function renderPageById(pageId) {
  const page = PAGE_BY_ID.get(pageId);
  if (!page) throw new Error(`Unknown page id: ${pageId}`);
  return renderScreen(page, PAGE_DATA[pageId]);
}

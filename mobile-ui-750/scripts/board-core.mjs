export function resolvePageId(hash, pages) {
  const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const requested = params.get('page');
  return pages.some((page) => page.id === requested) ? requested : 'conference-home';
}

export function pageHash(id) {
  return `#page=${encodeURIComponent(id)}`;
}

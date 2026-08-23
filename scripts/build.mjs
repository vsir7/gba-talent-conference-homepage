import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const output = join(root, 'dist');
const inputs = [
  'index.html',
  'styles.css',
  'app.js',
  'schedule.html',
  'schedule.css',
  'schedule.js',
  'schedule-model.js',
  'entry-service.html',
  'entry-service.css',
  'entry-service.js',
  'profile.html',
  'profile.css',
  'profile.js',
  'service-hall.html',
  'service-hall.css',
  'service-hall-tuning.css',
  'service-hall-links.css',
  'service-hall.js',
  'tech-interaction.html',
  'dining-service.html',
  'carnival.html',
  'attendance-guide.html',
  'food-street.html',
  'city-walk.html',
  'transportation.html',
  'faq.html',
  'youth-study.html',
  'accommodation.html',
  'venue-guide.html',
  'schedule-search.html',
  'agenda-detail.html',
  'guest-detail.html',
  'notifications.html',
  'service-pages.css',
  'service-pages-tuning.css',
  'service-pages-rework.css',
  'guide-rework.css',
  'service-pages.js',
  'service-pages-rework.js',
  'service-batch-02.css',
  'service-batch-02.js',
  'service-batch-03.css',
  'batch3-rework-b2.css',
  'service-batch-03.js',
  'personal-info.html',
  'meal-benefits.html',
  'contact-staff.html',
  'cooperation-materials.html',
  'registration-detail.html',
  'service-batch-04.css',
  'service-batch-04.js',
  'edit-registration.html',
  'open-mic-detail.html',
  'entry-result.html',
  'meal-voucher.html',
  'ai-assistant.html',
  'service-batch-05.css',
  'conference-registration.html',
  'information.html',
  'information-rework-b2.css',
  'home-approved.html',
  'home-approved.css',
  'service-batch-06.css',
  'service-batch-06.js',
  'guest-feature.html',
  'guest-feature.css',
  'service-batch-07.css',
  'service-batch-07.js',
  'page-board.html',
  'page-board.css',
  'page-board.js',
  'design-system/tokens',
  'public/assets',
];

if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const input of inputs) {
  const source = join(root, input);
  if (!existsSync(source)) throw new Error(`Missing production input: ${input}`);
  cpSync(source, join(output, input), { recursive: true });
}

console.log(`Production artifact created at ${output}`);

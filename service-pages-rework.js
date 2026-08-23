const assetRoot = 'public/assets/service-batch-01/';
const source = (name) => `${assetRoot}${name}`;

function replaceImage(selector, name, alt) {
  const image = document.querySelector(selector);
  if (!image) return;
  image.src = source(name);
  image.alt = alt;
  image.classList.add('is-source-backed');
}

if (location.pathname.endsWith('/tech-interaction.html')) {
  const hero = document.querySelector('.tech-hero');
  if (hero) {
    hero.style.setProperty('--source-hero', `url("${source('tech-showroom.png')}")`);
    hero.classList.add('is-source-backed');
  }
  ['tech-robot-u1.png', 'tech-robot-t800.png', 'tech-robot-lightning.png', 'tech-robot-bumi.png'].forEach((name, index) => {
    replaceImage(`.product-tile:nth-child(${index + 1}) img`, name, '大会科创产品');
  });
}

if (location.pathname.endsWith('/dining-service.html')) {
  replaceImage('.benefit-card__head img', 'dining-utensils.png', '餐饮权益');
}

if (location.pathname.endsWith('/carnival.html')) {
  const hero = document.querySelector('.carnival-banner');
  if (hero) {
    hero.style.setProperty('--source-hero', `url("${source('carnival-city-scene.png')}")`);
    hero.classList.add('is-source-backed');
  }
  ['carnival-tech.png', 'carnival-culture.png', 'carnival-stage.png', 'carnival-food.png', 'carnival-merch.png', 'carnival-city.png'].forEach((name, index) => {
    replaceImage(`.carnival-route:nth-child(${index + 1}) img`, name, '嘉年华活动插画');
  });
}

if (location.pathname.endsWith('/food-street.html')) {
  ['food-chicken-mascot.png', 'food-macau-mascot.png', 'food-lion-mascot.png', 'food-coffee-mascot.png'].forEach((name, index) => {
    const card = document.querySelector(`.food-card:nth-child(${index + 1})`);
    if (!card) return;
    const marker = document.createElement('img');
    marker.className = 'food-card__marker';
    marker.src = source(name);
    marker.alt = '';
    card.insertBefore(marker, card.firstElementChild);
    card.classList.add('has-source-mascot');
  });
}

if (location.pathname.endsWith('/attendance-guide.html')) {
  const guideCss = document.createElement('link');
  guideCss.rel = 'stylesheet';
  guideCss.href = 'guide-rework.css';
  document.head.append(guideCss);
  const header = document.querySelector('.feature-header');
  if (header) {
    header.style.setProperty('--source-skyline', `url("${source('guide-skyline.png')}")`);
    header.classList.add('is-source-skyline');
  }
  ['guide-opening.png', 'guide-talk.png', 'guide-mic.png', 'guide-trophy.png', 'guide-handshake.png', 'guide-experience.png'].forEach((name, index) => {
    const icon = document.querySelector(`.guide-composition__item:nth-child(${index + 1}) .round-icon`);
    if (!icon) return;
    const image = document.createElement('img');
    image.src = source(name);
    image.alt = '';
    icon.replaceChildren(image);
    icon.classList.add('is-source-icon');
  });
}

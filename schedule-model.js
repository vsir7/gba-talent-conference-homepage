export const scheduleItems = Object.freeze([
  {
    id: 'opening',
    day: '2026-10-25',
    start: '09:00',
    end: '09:50',
    category: 'keynote',
    categoryLabel: '主论坛',
    title: '大会开幕式',
    location: '东莞·松山湖国际会议中心 大礼堂',
    guestCount: 6,
    speakers: [
      { name: '张伟', image: 'public/assets/schedule/speaker-zhang-wei.png' },
      { name: '李明', image: 'public/assets/schedule/speaker-li-ming.png' },
      { name: '王强', image: 'public/assets/schedule/speaker-wang-qiang.png' },
    ],
  },
  {
    id: 'innovation-lecture',
    day: '2026-10-25',
    start: '10:30',
    end: '12:00',
    category: 'lecture',
    categoryLabel: '创新讲堂',
    title: '创新大讲堂：技术创新与产业未来',
    location: '东莞·松山湖国际会议中心 3号厅',
    guestCount: 3,
    speakers: [
      { name: '张伟', image: 'public/assets/schedule/speaker-zhang-wei.png' },
    ],
  },
  {
    id: 'open-mic',
    day: '2026-10-25',
    start: '14:00',
    end: '15:30',
    category: 'open-mic',
    categoryLabel: '开放麦',
    title: '产业专题开放麦：新趋势·新机遇',
    location: '东莞·松山湖科学家活动中心 多功能厅',
    guestCount: 4,
    speakers: [
      { name: '刘洋', image: 'public/assets/schedule/speaker-liu-yang.png' },
      { name: '陈震', image: 'public/assets/schedule/speaker-chen-zhen.png' },
      { name: '赵磊', image: 'public/assets/schedule/speaker-zhao-lei.png' },
    ],
  },
]);

export function selectScheduleItems(filters, followedIds) {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase('zh-CN');
  return scheduleItems.filter((item) => {
    if (item.day !== filters.day) return false;
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.scope === 'mine' && !followedIds.has(item.id)) return false;
    if (!normalizedQuery) return true;

    const searchable = [
      item.title,
      item.location,
      item.categoryLabel,
      ...item.speakers.map((speaker) => speaker.name),
    ].join(' ').toLocaleLowerCase('zh-CN');
    return searchable.includes(normalizedQuery);
  });
}

export function toggleFollowed(current, id) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

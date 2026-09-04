const A = '../assets';
const tabs = ['简介', '嘉宾', '议程', '抢票须知'];
const event = 'AI 时代的人才新范式';
const eventMeta = '08月28日 14:00-17:00 · 深圳国际会展中心 6号馆主会场';
const pass = {
  title: '入场凭证', template: 'pass', name: '陈思远', company: '穗智未来科技有限公司', credentialNo: 'HTDC2026-1025-0186',
  event: '创新大讲堂：技术创新与产业未来', venue: '广州市海珠区广交会展馆 A 区 1.2馆',
  time: '10月25日  09:30—11:30', seat: '准许入场', portrait: `${A}/extracted/pass-person.png`,
  digitalTime: '14:28:36', date: '2026年10月25日', note: '请向现场工作人员出示本页面',
};
const scheduleGuests = [`${A}/schedule/speaker-liu-yang.png`, `${A}/schedule/speaker-chen-zhen.png`, `${A}/schedule/speaker-wang-qiang.png`];
const sessions = [
  { time: '09:00-10:30', tag: '抢票成功', title: '大会开幕式', venue: '东莞·松山湖国际会议中心 大礼堂', copy: '湾区英才共聚，共话高质量发展新机遇。', guests: scheduleGuests, image: `${A}/extracted/schedule-open.png`, status: '368人正在抢票' },
  { time: '10:45-12:00', tag: '可抢票', title: '创新大讲堂：技术创新与产业未来', venue: '东莞·松山湖国际会议中心 3号厅', copy: '聚焦前沿技术突破，洞见未来产业新格局。', guests: scheduleGuests, image: `${A}/extracted/schedule-future.png`, status: '286人正在抢票' },
  { time: '14:00-15:30', tag: '抢票中', title: '产业专题开放麦：新趋势、新机遇', venue: '松山湖科学家活动中心 多功能厅', copy: '畅谈产业新趋势，捕捉湾区发展新机遇。', guests: scheduleGuests, image: `${A}/extracted/schedule-next.png`, status: '419人正在抢票' },
];
const agendaBase = {
  title: '议程详情', template: 'agenda', tabs, hero: `${A}/extracted/agenda-city-hero.png`,
  event: '创新大讲堂：技术创新与产业未来', tag: '创新大讲堂', time: '10月25日  09:30—11:30', venue: '广州市海珠区广交会展馆 A 区 1.2馆', meta: '10月25日 09:30—11:30 · 广州市海珠区广交会展馆 A 区 1.2馆', action: '立即抢票',
};

export const PAGE_DATA = Object.freeze({
  'conference-home': {
    title: '湾区人才大会', template: 'conference', nav: '大会', back: false,
    hero: `${A}/reference/hero-key-visual.png`, sideHero: `${A}/extracted/conference-runner.png`,
    eyebrow: '湾区人才大会 2026', headline: '汇聚人才动能 共创湾区未来', date: '10月25—26日 · 中国东莞',
    portals: [['大会盛典', '▰', 'violet'], ['创新赛事', '◆', 'pink'], ['主题论坛', '▣', 'green'], ['合作洽谈', '♥', 'blue'], ['嘉年华', '✦', 'cyan'], ['同期活动', '♛', 'yellow']],
    about: '汇聚全球英才人才、前沿科技与创新智慧，引领方向。粤港澳大湾区的机遇在这里汇聚，您的影响力与未来从此开始。',
    video: `${A}/reference/opening-stage.png`,
    highlights: [{ title: '嘉宾', meta: '领军人物与行业先锋现场分享', image: `${A}/reference/news-opening.png` }, { title: '开放麦', meta: '开放表达 · 构建产业新视点', image: `${A}/service-batch-03/agenda-hero.png` }, { title: '嘉年华', meta: '多元展示、互动体验与城市活力', image: `${A}/reference/opening-stage.png` }, { title: '科创', meta: '前沿技术与创新成果集中呈现', image: `${A}/service-batch-01/tech-showroom.png` }],
    partners: ['中国银行', 'HUAWEI', 'Tencent 腾讯', 'ALIBABA CLOUD', '中国移动', 'BYD'],
  },
  'ai-assistant': {
    title: 'AI助手', template: 'assistant', back: false, name: '张小湾', hero: `${A}/extracted/assistant-robot-hero-v2.png`,
    subtitle: '我可以帮你查日程、会场、报名和权益',
    prompts: ['大会日程有哪些？', '如何前往会场？', '如何查看我的权益？', '如何获取入场二维码？'],
    messages: [{ role: 'user', text: '我的报名通过了吗？' }, { role: 'assistant', text: '你的报名已通过审核 🎉\n参会证将于大会前3天发送至你的手机号，请留意短信通知。', time: '09:40' }, { role: 'user', text: '午餐怎么使用？' }, { role: 'assistant', text: '大会为您提供午餐券。\n您可在每日10:00后，前往指定用餐区出示参会证或二维码核销使用。', time: '09:40' }],
  },
  schedule: { title: '日程', template: 'schedule', nav: '日程', back: false, headerAction: '◫', dates: ['10月25日 周六', '10月26日 周日'], scheduleTabs: ['全部日程', '我的日程'], filters: ['全部', '大会主场', '博创大赛', '产业论坛', '对接洽谈', '嘉年华', '同期活动'], sessions },
  'agenda-intro': { ...agendaBase, activeTab: 0, sections: [{ copy: '本次大讲堂聚焦技术创新如何驱动产业变革与未来发展，邀请行业专家与领军企业代表，共同探讨前沿趋势、创新实践与产业机遇，助力企业把握未来发展方向。' }] },
  'agenda-guests': { ...agendaBase, activeTab: 1, guests: [{ name: '林嘉言', role: '首席科学家', image: `${A}/extracted/guest-lin.png` }, { name: '周若宁', role: '副院长', image: `${A}/extracted/guest-zhou.png` }, { name: '许文川', role: '主任', image: `${A}/extracted/guest-xu.png` }] },
  'agenda-schedule': { ...agendaBase, activeTab: 2, timeline: [['09:30\n09:50', '开场致辞：湾区人才协同发展'], ['09:50\n10:40', '主题分享：技术创新与产业未来'], ['10:40\n11:30', '圆桌对话：人才、技术与产业融合']] },
  'agenda-ticket-notice': { ...agendaBase, activeTab: 3, notices: ['抢票前请完成登录及个人资料填写。', '请根据实际情况选择报名时段及报名类型。', '普通报名提交后立即抢票成功；限量抢票提交后需等待人工审核。', '审核通过后，请凭入场凭证进行现场核验。', '会议开始前可随时取消报名。'] },
  'registration-picker': {
    title: '议程详情', template: 'sheet', hero: `${A}/extracted/agenda-city-hero.png`, sheetTitle: '选择报名信息',
    slots: [
      { date: '10月25日', time: '09:30—11:30', remaining: '18', topic: '技术创新与产业未来', speaker: '陈志远', speakerImage: `${A}/refreshed/registration-speaker-male.png` },
      { date: '10月25日', time: '14:00—16:00', remaining: '24', topic: '湾区人才与产业协同发展', speaker: '林晓雯', speakerImage: `${A}/refreshed/registration-speaker-female.png` },
    ],
    types: ['听众', '分享者'], action: '抢票',
  },
  'speaker-registration': {
    title: '分享者报名', template: 'speaker-form', subtitle: '填写分享信息，提交后由大会审核',
    session: {
      title: '技术创新与产业未来', date: '10月25日', time: '09:30—11:30',
      speaker: '陈志远', speakerImage: `${A}/refreshed/registration-speaker-male.png`,
    },
    outlines: ['请输入第一个分享要点', '请输入第二个分享要点', '请输入第三个分享要点'],
  },
  'phone-authorization': { title: '手机号授权', template: 'modal', hero: `${A}/extracted/agenda-city-hero.png`, modalTitle: '手机号授权', modalCopy: '用于完成活动报名与接收审核通知', actions: ['暂不授权', '授权手机号'] },
  'registration-review': { title: '报名审核', template: 'result', state: 'pending', illustration: `${A}/extracted/review-hourglass.png`, headline: '等待审核中', copy: '报名申请已提交，请耐心等待审核', event: '创新大讲堂：技术创新与产业未来', meta: '10月25日 09:30—11:30', action: '完成' },
  'entry-pass-schedule': { ...pass, sourceRoute: 'schedule' },
  news: {
    title: '资讯', template: 'news', nav: '资讯', back: false, filters: ['全部', '通知', '动态', '视频'],
    featured: { title: '大会开幕在即：共话人才高质量发展新机遇', meta: '2026-10-20', image: `${A}/extracted/news-venue.png`, body: '第四届粤港澳大湾区人才高质量发展大会将于10月25日在东莞·松山湖启幕。' },
    articles: [{ title: '才聚湾区·博创未来：大会宣传片正式发布', meta: '2026-10-18', image: `${A}/service-batch-01/carnival-city-scene.png` }, { title: '大会筹备工作有序推进', meta: '2026-10-16', image: `${A}/extracted/news-hall.png` }, { title: '参会指南｜注册通道已开启', meta: '2026-10-08', image: `${A}/extracted/news-exterior.png` }],
  },
  'news-detail': { title: '资讯详情', template: 'article', headerAction: '↗', headline: '大会开幕在即：共话人才高质量发展新机遇', kicker: '通知', meta: '2024-10-20  10:30  |  来源：湾区人才发展', hero: `${A}/reference/hero-key-visual.png`, paragraphs: ['第四届粤港澳大湾区人才高质量发展大会将于10月25日在东莞·松山湖启幕。本届大会以“才聚湾区·博创未来”为主题，聚焦人才发展新趋势，汇聚政产学研多方力量，携手共绘湾区人才发展新蓝图。', '大会将发布《湾区人才创新发展报告》，分享人才政策与实践成果，并举行重点人才项目签约仪式，助力湾区打造更具吸引力与创新力的人才高地。'], quote: '诚邀各界嘉宾共赴人才盛会，共创湾区美好未来！', related: [{ title: '才聚湾区·博创未来：大会宣传片正式发布', meta: '2024-10-18  动态', image: `${A}/reference/news-vision.png` }, { title: '大会筹备工作有序推进', meta: '2024-10-16  视频', image: `${A}/reference/opening-stage.png` }, { title: '松山湖：打造大湾区人才创新高地', meta: '2024-10-14  动态', image: `${A}/reference/news-campus.png` }] },
  'service-hall': {
    title: '服务大厅', template: 'service', nav: '服务', back: false, subtitle: '第四届粤港澳大湾区人才高质量发展大会',
    primaryServices: [['入场服务', '快速入场 便捷通行', '▥', 'violet'], ['场馆导览', '地图导览 轻松游览', '⌖', 'pink'], ['交通接驳', '接驳攻略 顺畅出行', '▰', 'blue'], ['餐饮服务', '美食推荐 轻松用餐', '♨', 'green']],
    quick: [['参会指南', '▤'], ['住宿指南', '▥'], ['常见问题', '?'], ['联系会务', '♧']],
    exploreConference: [['嘉年华', '精彩活动', '♢'], ['科创互动', '科技体验', '◉'], ['美食街区', '湾区风味', '◒']],
    exploreBay: [['City Walk', '城市漫游', '⇄'], ['青年人才研学', '探索成长', '♙']],
  },
  'entry-pass-service': { ...pass, sourceRoute: 'service' },
  'venue-guide': { title: '场地导览', template: 'service-story', layout: 'venue', hero: `${A}/service-batch-01/guide-skyline.png`, storyTitle: '场地导览', storySubtitle: '搜索场馆、活动、展位', lead: { title: '大会空间总览', copy: '主会场、创新讲堂、对接洽谈区与嘉年华区一图掌握', image: `${A}/entry-service/arrival-map.png` }, sectionTitle: '大会场馆', storyCards: [{ title: '主会场（大湾区大学体育馆）', copy: '大会开幕式、主旨演讲、高端对话', image: `${A}/extracted/venue-main.png`, route: 'schedule' }, { title: '创新大讲堂', copy: '前沿分享、产业对话、开放麦路演', image: `${A}/extracted/venue-talk.png`, route: 'schedule' }, { title: '对接洽谈区', copy: '成果转化、人才招聘与项目对接', image: `${A}/extracted/venue-match.png`, route: 'contact-staff' }, { title: '嘉年华区', copy: '科创互动、文化展演、热力舞台', image: `${A}/extracted/venue-carnival.png`, route: 'carnival' }] },
  transportation: { title: '交通接驳', template: 'service-story', layout: 'transport', hero: `${A}/service-batch-01/guide-skyline.png`, storyTitle: '交通接驳', storySubtitle: '大会目的地与到场方式', stationImage: `${A}/extracted/transport-station.png`, lead: { title: '大湾区大学（松山湖校区）', copy: '公共交通与自驾均可导航前往', image: `${A}/extracted/transport-destination.png` }, sectionTitle: '到场方式', storyCards: [{ title: '公共交通', copy: '推荐绿色出行', image: `${A}/extracted/transport-public.png`, route: 'venue-guide' }, { title: '自驾', copy: '按导航前往目的地', image: `${A}/extracted/transport-car.png`, route: 'venue-guide' }, { title: '大会接驳', copy: '起点、终点、发车时间及上下车点以最新通知为准', image: `${A}/extracted/transport-bus.png`, route: 'notifications' }, { title: '临时通知', copy: '班次调整与站点调整将及时通知', image: `${A}/extracted/transport-bell.png`, route: 'notifications' }] },
  'dining-service': { title: '餐饮服务', template: 'service-story', layout: 'dining', hero: `${A}/service-batch-01/guide-skyline.png`, storyTitle: '餐饮服务', storySubtitle: '用餐权益与现场安排', lead: { title: '我的餐饮权益', copy: '当前有效 · 嘉宾午餐权益', image: `${A}/extracted/dining-utensils.png` }, sectionTitle: '用餐安排', storyCards: [{ title: '用餐区域', copy: '会务指定餐区，以大会通知为准', image: `${A}/extracted/dining-area.png`, route: 'meal-benefits' }, { title: '开放时间', copy: '具体开放时段以大会安排为准', image: `${A}/extracted/dining-clock.png`, route: 'meal-benefits' }, { title: '使用方式', copy: '凭个人身份识别到指定区域用餐', image: `${A}/extracted/dining-card.png`, route: 'meal-voucher' }, { title: '用餐地点', copy: '查看场地导览并导航前往', image: `${A}/extracted/dining-location.png`, route: 'venue-guide' }] },
  carnival: {
    title: '嘉年华', template: 'service-story', layout: 'carnival', hero: `${A}/refreshed/carnival-hero-art.png`,
    storyTitle: '嘉年华', storySubtitle: '第四届粤港澳大湾区人才高质量发展大会', bannerTitle: '湾聚英才 粤见未来', bannerSubtitle: '青春｜科技｜文化｜活力', sectionTitle: '五处风景线',
    storyCards: [
      { title: '科创互动', image: `${A}/refreshed/carnival-robot.png` },
      { title: '文化展演', image: `${A}/refreshed/carnival-culture.png` },
      { title: '热力舞台', image: `${A}/refreshed/carnival-stage.png` },
      { title: '美食街区', image: `${A}/refreshed/carnival-food.png`, route: 'food-street' },
      { title: '潮流文创', image: `${A}/refreshed/carnival-merch.png` },
    ],
  },
  'food-street': { title: '美食街区', template: 'service-story', layout: 'food', hero: `${A}/food-street/market-scene.png`, storyTitle: '美食街区', storySubtitle: '湾区风味 · 一站体验', sectionTitle: '湾区风味', storyCards: [{ title: '岭南名鸡争霸', copy: '广州白切鸡、客家盐焗鸡、清远水晶鸡、顺德鸡煲、肇庆笔架鸡', mascot: `${A}/service-batch-01/food-chicken-mascot.png`, image: `${A}/food-street/lingnan-chicken.png` }, { title: '港澳风味', copy: '葡式蛋挞、猪扒包、咖喱鱼蛋', mascot: `${A}/service-batch-01/food-macau-mascot.png`, image: `${A}/food-street/macau-snacks.png` }, { title: '东莞美食', copy: '烧鹅濑粉、道滘肉丸、糖不甩、鑫源腊肠', mascot: `${A}/service-batch-01/food-lion-mascot.png`, image: `${A}/food-street/dongguan-food.png` }, { title: '咖啡专区', copy: '湾区特色咖啡文化体验，汇聚冠军咖啡师', mascot: `${A}/service-batch-01/food-coffee-mascot.png`, image: `${A}/food-street/coffee.png` }], footerActions: [['查看位置', 'venue-guide'], ['导航前往', 'venue-guide']] },
  accommodation: { title: '住宿信息', template: 'service-story', layout: 'hotel', lead: { title: '官方住宿信息更新中', copy: '大会将陆续发布官方住宿及周边住宿信息，请以最新通知为准。', image: `${A}/service-batch-02/hotel-update.png` }, sectionTitle: '推荐酒店', storyCards: [{ title: '湾大松山湖学术交流中心', copy: '松山湖园区大学路16号10栋', meta: '0769-22899666 · 距校区约0.41公里', image: `${A}/service-batch-02/hotel-placeholder.png`, route: 'venue-guide' }, { title: '东莞松山湖大学城轻居酒店', copy: '大岭山镇教育路166号银湖大厦', meta: '0769-85189999 · 距校区约1.28公里', image: `${A}/service-batch-02/hotel-update.png`, route: 'venue-guide' }, { title: '东莞松山湖城际酒店', copy: '松山湖园区怡然路2号', meta: '0769-22441888 · 距校区约1.65公里', image: `${A}/service-batch-02/hotel-placeholder.png`, route: 'venue-guide' }] },
  'youth-study': { title: '青年人才研学', template: 'service-story', layout: 'study', hero: `${A}/extracted/study-hero-right.png`, storyTitle: '青年人才研学', storySubtitle: '— 走进湾区  探索创新 —', lead: { title: '活动时间', copy: '10月26日后开展 · 博士博士后青年人才研学', image: `${A}/service-batch-02/study-ai.png` }, storyCards: [{ kicker: '路线 1 · 东莞', title: '大科学装置与前沿科技线', copy: '散裂中子源 · 松山湖材料实验室 · 香港城市大学（东莞）', image: `${A}/extracted/study-route-atom.png` }, { kicker: '路线 2 · 东莞', title: '先进制造与龙头企业线', copy: 'OPPO · 生益科技 · XbotPark机器人基地', image: `${A}/extracted/study-route-robot.png` }, { kicker: '路线 3 · 东莞', title: '创业生态与人才服务线', copy: '松山湖港澳青年创新创业基地 · 松山湖国际创新创业社区', image: `${A}/extracted/study-route-building.png` }, { kicker: '路线 1 · 深圳', title: '人工智能线', copy: '腾讯总部园区 · 优必选 · 众擎 · 智平方', image: `${A}/extracted/study-route-ai.png` }, { kicker: '路线 2 · 深圳', title: '生物医药线', copy: '深圳湾实验室 · 医学科学院 · 合成生物设施', image: `${A}/extracted/study-route-bio.png` }] },
  faq: { title: '常见问题', template: 'faq', groups: [{ title: '报名', icon: '♟', questions: [['如何查看报名结果？', '进入“我的—消息中心”查看审核通知，也可在“我的日程”查看活动状态。'], ['普通活动是否需要再次报名？', '已完成大会注册的参会者，可按活动页面提示进行报名。'], ['开放麦如何报名？', '进入对应开放麦议程详情页，选择场次和参与身份后提交。']] }, { title: '入场', icon: '⚑', questions: [['到现场后如何查看入场结果？', '打开“我的—入场凭证”，向现场工作人员出示动态凭证。'], ['入场需要携带哪些证件？', '请携带报名时使用的有效身份证件，并配合现场核验。']] }, { title: '日程', icon: '▣', questions: [['如何查看活动位置？', '在议程详情页点击“导航前往”查看活动场馆。'], ['普通活动是报名额吗？', '活动名额和参与规则以各议程详情页提示为准。']] }, { title: '场地', icon: '▥', questions: [['场馆内有导览图吗？', '场地导览页提供大会空间总览和分区场馆信息。'], ['如何前往各个场馆？', '在场地导览页选择场馆后点击“导航前往”。']] }, { title: '导航', icon: '⌖', questions: [['是否支持导航？', '支持，导航前往会调用第三方地图应用进行路线规划。'], ['导航会跳转到哪个地图？', '将根据设备已安装地图应用和系统设置选择。']] }, { title: '餐饮', icon: '♨', questions: [['如何查看我的餐饮权益？', '进入“我的—我的餐饮”查看当前可用权益。'], ['餐饮是否需要额外购买？', '请以您的参会身份权益和大会最新通知为准。']] }] },
  profile: { title: '我的HTDC', template: 'profile', nav: '我的', back: false, avatar: `${A}/extracted/profile-zhang.png`, name: '张知远', badge: '个人观众', company: '湾区智能科技  |  销售经理', primaryMenu: [['消息列表', '◎', 'notifications'], ['我的日程', '▣', 'my-schedule'], ['我的餐饮', '♨', 'meal-benefits'], ['邀请好友参加', '↻']], secondaryMenu: [['关于HTDC', 'ⓘ'], ['联系HTDC', '☎', 'contact-staff'], ['隐私协议', '♢']] },
  notifications: { title: '消息中心', template: 'notifications', filters: ['全部消息', '系统通知', '活动提醒'], notices: [{ icon: '▣', title: '大会报名审核已通过', badge: '重要', time: '今天 09:15', copy: '恭喜您！您的大会报名已通过审核，欢迎参加2025全球人工智能产业大会。', unread: true }, { icon: '◉', title: '人工智能产业专题开放麦报名通过', badge: '重要', time: '昨天 16:42', copy: '您报名的“人工智能产业专题开放麦：新趋势·新机遇”已通过审核，期待您的精彩分享！', unread: true }, { icon: '♧', title: '创新大讲堂将于30分钟后开始', badge: '提醒', time: '今天 10:00', copy: '您已报名的“创新大讲堂：技术创新与产业未来”将于10:30在3号厅开始，请提前入场。', unread: true }, { icon: '♨', title: '午餐权益当前可用', badge: '提醒', time: '今天 11:20', copy: '您的午餐权益已生效，可于11:30–13:30在松山湖国际会议中心一层自助餐区使用。', unread: false }, { icon: '▰', title: '大会接驳班次调整通知', time: '今天 12:05', copy: '受交通管制影响，14:00前往会场的接驳车班次调整至13:30发车，请您合理安排时间。', unread: false }] },
  'my-schedule': { title: '我的日程', template: 'my-schedule', dates: ['10 月 25 日', '10 月 26 日'], sessions: [{ time: '09:00–09:50', state: '待审核', title: '大会开幕式', venue: '大湾区大学（松山湖校区）体育馆', category: '主会场' }, { time: '09:50–10:30', state: '报名成功', title: '科创互动展示与对接洽谈巡展', venue: '大湾区大学·科创互动区 / 对接洽谈区', category: '参观交流', action: '查看凭证', route: 'entry-pass-profile' }, { time: '10:30–12:00', state: '报名失败', title: '创新大讲堂', subtitle: 'AI浪潮下共创湾区未来', venue: '大湾区大学·创新大讲堂', category: '主题论坛', action: '查看原因', route: 'notifications' }] },
  'entry-pass-profile': { ...pass, sourceRoute: 'profile' },
  'role-selection': {
    title: '选择参会角色', template: 'role-selection', selectedRole: '个人观众',
    roles: [
      { label: '个人观众', icon: 'person', tone: 'purple' },
      { label: '参展/参招企业', icon: 'company', tone: 'blue' },
      { label: '参赛选手', icon: 'trophy', tone: 'green' },
      { label: '专家', icon: 'expert', tone: 'purple' },
      { label: '政府人员', icon: 'government', tone: 'blue' },
      { label: '嘉宾', icon: 'guest', tone: 'pink' },
      { label: '工作人员', icon: 'staff', tone: 'aqua' },
      { label: '媒体', icon: 'media', tone: 'purple' },
    ],
  },
  'profile-completion': { title: '完善个人信息', template: 'profile-completion', currentRole: '个人观众' },
  'personal-info': {
    title: '个人信息', template: 'profile-info', headerAction: '编辑', headerRoute: 'personal-info-edit',
    rows: [
      { label: '证件照', value: '', icon: 'camera', tone: 'pink', photo: `${A}/refreshed/personal-photo.png` },
      { label: '参会角色', value: '个人观众', icon: 'medal', tone: 'cyan' },
      { label: '姓名', value: '张小湾', icon: 'pen', tone: 'purple' },
      { label: '证件类型', value: '居民身份证', icon: 'id-card', tone: 'blue' },
      { label: '证件号码', value: '4403********1024', icon: 'shield', tone: 'cyan' },
      { label: '手机号', value: '138****1024', icon: 'phone', tone: 'blue' },
      { label: '邮箱', value: 'zhangxiaowan@example.com', icon: 'mail', tone: 'aqua' },
      { label: '所在城市', value: '深圳市', icon: 'location', tone: 'green' },
      { label: '单位', value: '星程科技有限公司', icon: 'building', tone: 'purple' },
      { label: '职务', value: '产品运营', icon: 'briefcase', tone: 'yellow' },
    ],
  },
  'personal-info-edit': { title: '个人信息', template: 'form', headerAction: '保存', avatar: `${A}/profile/avatar-xiaowan.png`, fields: [['姓名', '小湾'], ['性别', '女'], ['手机号', '138****2026'], ['电子邮箱', 'xiaowan@example.com'], ['所在单位', '湾区创新科技有限公司'], ['职位', '产品负责人'], ['关注领域', '人工智能、人才服务']] },
  'meal-benefits': { title: '餐饮权益', template: 'benefits', tabs: ['待使用', '已使用', '已过期'], benefits: [{ type: '大会午餐', date: '08月28日', time: '11:30—14:00', venue: '6号馆二层餐饮区', state: '待使用' }, { type: '能量补给', date: '08月28日', time: '09:00—17:30', venue: '各馆休息区', state: '待使用' }] },
  'meal-voucher': { title: '我的餐饮权益', template: 'voucher', type: '大会午餐', state: '可使用', date: '2026年08月28日', time: '11:30—14:00', venue: '深圳国际会展中心 6号馆二层餐饮区', qr: `${A}/entry-service/qr-code.png`, code: 'MEAL-0828-0186', notes: ['请在规定时间内使用', '每份权益仅限核销一次', '二维码每 60 秒自动刷新'] },
  'contact-staff': { title: '联系会务', template: 'contact', subtitle: '我们将为你的参会体验提供支持', contacts: [{ icon: '☎', title: '会务服务热线', value: '0755-8888 2026', note: '服务时间 08:00—22:00' }, { icon: '▱', title: '在线客服', value: '立即咨询', note: '平均 2 分钟内响应' }, { icon: '✉', title: '会务邮箱', value: 'service@htdc2026.cn', note: '适合资料与合作咨询' }], emergency: '现场紧急情况请前往各馆服务台，或联系身边佩戴紫色证件的大会志愿者。' },
});

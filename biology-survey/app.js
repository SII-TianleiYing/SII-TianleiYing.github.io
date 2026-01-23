/* Biology Innovator Survey (vanilla JS, no deps)
   - 记名 + 身份 + 子领域选择
   - 通用20题：4组×5题，组内对 创新性/可行性/科学价值 排序（1=最高）
   - 自动抽取每组每维度Top1，组间对4个Top1再排序
   - 子领域20题：同上
   - 子领域开放题1-3
   - 导出 JSON / CSV
*/

const DIMENSIONS = [
  { key: "innovation", label: "创新性" },
  { key: "feasibility", label: "可行性" },
  { key: "value", label: "科学价值" },
];

// ---------- 题库（1-100） ----------
// 说明：这里按你粘贴的文本原样内置。后续你要改题干/分组，直接改下面 DATA。
const DATA = {
  general: {
    name: "全领域通用挑战（1–20）",
    questions: [
      { id: 1, text: "AI预测的物理极限： AI模型能否在缺乏实验数据的情况下，准确预测超大复合物（>1 MDa）及其与水分子的协同动力学？" },
      { id: 2, text: "“不可成药”靶点的突破： 如何设计大分子以特异性干预缺乏稳定结合口袋的细胞内蛋白-蛋白相互作用（PPI）？" },
      { id: 3, text: "大分子的“药效团”理论： 是否能像小分子一样，建立一套普适的大分子最小功能域编码规则？" },
      { id: 4, text: "跨物种翻译的本质： 为什么在非人灵长类中表现优异的动力学特征，在人体中经常发生非线性的偏差？" },
      { id: 5, text: "高浓度制剂的物理化学： 如何在不添加大量辅料的前提下，从分子层面抑制高浓度（>200 mg/mL）蛋白质的自结合与凝胶化？" },
      { id: 6, text: "全生命周期监测： 如何开发非侵入性的体内传感技术，实时追踪单个大分子药在组织中的降解与代谢轨迹？" },
      { id: 7, text: "环境鲁棒性设计： 是否能通过分子改造，使生物药脱离冷链，在常温甚至高温下保持数年活性？" },
      { id: 8, text: "大分子的异质性影响： 翻译后修饰（PTM）的微小非均一性如何定量地影响药物的临床疗效？" },
      { id: 9, text: "生物药的“数字化”： 如何构建能够模拟人体全循环系统的生物数字孪生模型，实现给药方案的个体化模拟？" },
      { id: 10, text: "内源性类似物的干扰： 针对内源性蛋白的模拟药物，如何精确区分并评价其对天然平衡的扰动？" },
      { id: 11, text: "化学-生物杂合极限： 大分子与人工合成材料结合后，如何维持生物活性与材料功能的长期协同？" },
      { id: 12, text: "快速响应制造： 面对突发疫情，如何建立从病毒序列解析到g级纯度药物产出的“72小时工业闭环”？" },
      { id: 13, text: "大分子的脑部蓄积： 长期大剂量使用生物药，其在脑组织中的微量累积是否会诱发神经变性风险？" },
      { id: 14, text: "耐药性的分子机制： 肿瘤细胞对大分子药物产生耐药性的表观遗传学转换点在哪里？" },
      { id: 15, text: "多靶点协同效应： 针对多特异性药物，各靶点亲和力的最优比例平衡点如何通过数学建模预测？" },
      { id: 16, text: "生物大分子的自组装控制： 如何诱导大分子药物在病灶部位发生受控自组装以延长滞留时间？" },
      { id: 17, text: "代谢副产物的安全性： 复杂修饰的大分子（如化学修饰核酸）在体内的分解产物是否存在长期基因毒性？" },
      { id: 18, text: "给药频率的生物学限制： 免疫系统对重复给药的“记忆阈值”如何定义？" },
      { id: 19, text: "生物大分子的形态学评价： 柔性构象的异质性如何作为药物质量控制的新标准？" },
      { id: 20, text: "全合成生物大分子： 纯化学全合成是否能替代生物表达，解决大分子药物大规模制造中的杂质控制难题？" },
    ],
  },
  subfields: [
    {
      key: "struct_bio",
      name: "子领域1：结构生物学（21–40）",
      questions: [
        { id: 21, text: "原位原子解析： 如何在活细胞的复杂拥挤环境中，直接获取药物分子与靶点结合的原子级快照？" },
        { id: 22, text: "过渡态捕捉： 蛋白质执行功能的飞秒级瞬间，其构象转换的精确能量路径是什么？" },
        { id: 23, text: "本质无序蛋白（IDP）成药性： 如何通过结构分析找到 IDP 在与药物结合时从“无序”到“有序”转变的临界触发位点？" },
        { id: 24, text: "糖冠（Glycocalyx）的结构阻碍： 细胞表面密集的糖链结构如何动态影响大分子的入场与识别？" },
        { id: 25, text: "水分子在结合中的角色： 如何定量评价口袋内“结晶水”在药物结合自由能中的负熵贡献？" },
        { id: 26, text: "变构调控的长程通讯： 蛋白质一端的微小突变如何通过原子链条跨越长距离影响另一端的活性中心？" },
        { id: 27, text: "相分离的内部有序性： 生物分子凝聚体内部是否存在某种利于药物分配的隐性结构逻辑？" },
        { id: 28, text: "非编码RNA的三级构象： 如何高通量解析长链非编码RNA的复杂空间结构并预测其与蛋白的互作？" },
        { id: 29, text: "脂质环境对膜蛋白的影响： 不同脂质成分如何通过物理张力重塑 GPCR 等膜蛋白的激活构象？" },
        { id: 30, text: "机械力敏感通道的动态解析： 如何在受力状态下解析离子通道的开关瞬间结构？" },
        { id: 31, text: "超大复合物的自组装规则： 病毒衣壳等超大结构在装配过程中的“检错”机制及其结构基础是什么？" },
        { id: 32, text: "冷冻电镜的物理极限： 如何突破目前的信噪比瓶颈，实现对 <50 kDa 小蛋白的近原子分辨率解析？" },
        { id: 33, text: "蛋白质折叠中间体： 在拥挤胞内环境下，新生肽链避开错误折叠路径的动力学阻碍是什么？" },
        { id: 34, text: "柔性接头（Linker）的构象空间： 双抗中 Linker 的自由度如何影响两个抗原结合域的协同熵损？" },
        { id: 35, text: "结构生物学与 AI 的闭环： 如何利用 AI 实时指导电镜自动采集最具构象代表性的数据？" },
        { id: 36, text: "细胞骨架对大分子分布的结构限制： 胞内输运蛋白如何识别并引导大分子药物避开网格蛋白干扰？" },
        { id: 37, text: "蛋白质异构体的结构区分： 如何通过极细微的结构差异，设计出仅针对致病异构体而避开生理异构体的抗体？" },
        { id: 38, text: "共价结合的动态过程： 如何捕捉共价大分子药与靶点形成化学键过程中的原子排列变化？" },
        { id: 39, text: "溶剂化层的动力学： 大分子表面的水合层如何影响其在组织间质中的扩散速率？" },
        { id: 40, text: "核孔复合物的转运结构： 大分子通过核孔复合物进入细胞核的精确结构筛选机制是什么？" },
      ],
    },
    {
      key: "ab_synbio",
      name: "子领域2：抗体工程与合成生物学（41–60）",
      questions: [
        { id: 41, text: "De Novo 设计的通用性： 如何完全不依赖天然模版，从零开始设计具有预设催化功能的人造酶？" },
        { id: 42, text: "细胞工厂的代谢重构： 如何让生产细胞在分泌极高浓度大分子的同时，维持细胞内质网的稳态不发生应激凋亡？" },
        { id: 43, text: "条件触发的抗体（Logic Gates）： 如何设计仅在“肿瘤酸性 + 特定蛋白酶”同时满足时才激活的分子逻辑开关？" },
        { id: 44, text: "非天然氨基酸的工业化： 如何实现多种非天然氨基酸在抗体中的位点特异性、高保真大规模整合？" },
        { id: 45, text: "合成基因电路的长期稳定性： 植入体内的工程化细胞如何克服免疫排斥与基因丢失，实现数年的药物持续供给？" },
        { id: 46, text: "抗体亲和力的物理上限： 亲和力越高越好吗？是否存在一个临界值，超过后反而限制了抗体的组织渗透？" },
        { id: 47, text: "自愈性蛋白支架： 能否设计出在受到剪切力或高温破坏后，能通过分子间相互作用自动复性的蛋白骨架？" },
        { id: 48, text: "人造内共生系统： 能否设计出一种能在肠道稳定存在的工程菌，作为大分子药物的实时监测与生产终端？" },
        { id: 49, text: "蛋白质纳米笼的精准装配： 如何控制自组装纳米球的孔径，使其能根据环境信号精准释放包载的大分子？" },
        { id: 50, text: "全合成免疫系统： 能否在体外构建出具备完整超突变能力的微型人造淋巴结，用于极速抗体筛选？" },
        { id: 51, text: "糖型工程的极致控制： 如何通过改造高尔基体酶系，实现抗体糖型 100% 的均一化生产？" },
        { id: 52, text: "无细胞合成（CFPS）的规模化： CFPS 系统如何实现具备复杂翻译后修饰的蛋白质工业化生产？" },
        { id: 53, text: "定向进化的速度瓶颈： 如何利用连续流进化技术，在数小时内完成传统需要数月的蛋白质功能优化？" },
        { id: 54, text: "抗体-药物偶联（ADC）的化学进化： 载荷释放后产生的“旁观者效应”如何通过空间控制实现增效减毒？" },
        { id: 55, text: "跨物种通用抗体支架： 是否存在一种在人和宠物（如猫、狗）身上均不产生免疫原性的通用蛋白底座？" },
        { id: 56, text: "DNA 计算机在药效评价中的应用： 如何利用 DNA 逻辑电路在单细胞水平定量记录药物的响应历史？" },
        { id: 57, text: "细胞穿刺技术： 合成生物学设计的机械化蛋白是否能实现对细胞膜的物理穿刺递送？" },
        { id: 58, text: "人造受体的信号转导： 如何设计人造受体，使其能感知环境中的非生物信号（如光、磁）并转化为给药信号？" },
        { id: 59, text: "抗体抗性演化预测： 能否预测病原体针对特定中和抗体可能产生的逃逸突变路径？" },
        { id: 60, text: "生物安全的水印技术： 如何在合成大分子的序列中植入不可篡改的“生物水印”以保护知识产权并防止滥用？" },
      ],
    },
    {
      key: "delivery",
      name: "子领域3：药物递送（61–80）",
      questions: [
        { id: 61, text: "内吞体逃逸的物理机制： 如何将大分子的内吞体逃逸率从目前的 <1% 提升到 50% 以上？" },
        { id: 62, text: "血脑屏障（BBB）的主动穿梭： 除了受体介导，是否存在利用脑部微环境特有的物理场实现大分子无损递送的路径？" },
        { id: 63, text: "非肝脏靶向的精准实现： LNP 如何通过表面“蛋白晕（Protein Corona）”工程，彻底消除肝脏自然蓄积并实现脾、肺靶向？" },
        { id: 64, text: "细胞外囊泡（EV）的工业标准化： 如何在保证生物来源性的同时，实现外泌体载药量与均一性的工业级控制？" },
        { id: 65, text: "粘膜屏障的化学穿透： 大分子药如何穿透带电荷且高粘性的肠道/呼吸道粘液层而不被截留？" },
        { id: 66, text: "组织间质的高效渗透： 针对实性肿瘤，如何利用大分子的自主动力（如趋化性）穿透致密的胶原纤维网？" },
        { id: 67, text: "胞内特定细胞器的定向递送： 如何引导大分子药物避开溶酶体，精准进入线粒体或细胞核？" },
        { id: 68, text: "环境响应释放的灵敏度极限： 如何设计对微小 pH 波动（<0.1 单位）做出“阶跃式”响应的智能释放载体？" },
        { id: 69, text: "淋巴系统的定向追踪： 如何优化大分子的粒径与表面电荷，使其优先被引流淋巴结捕获以治疗转移癌？" },
        { id: 70, text: "蛋白药物的长效缓释瓶颈： 在疏水性聚合物微球中，如何防止蛋白在数月的降解过程中发生界面变性？" },
        { id: 71, text: "口服给药的机械化方案： 微型“机器人”给药装置如何实现在肠道内的自主定位与安全注射？" },
        { id: 72, text: "实时分布的无损成像： 递送载体能否通过磁共振或光声成像，在给药同时反馈其在病灶部位的实时浓度？" },
        { id: 73, text: "大剂量核酸包裹的效率： 如何在降低载体与药物比例的同时，维持超大片段 mRNA 的稳定性？" },
        { id: 74, text: "仿生病毒外壳的开发： 能否合成出具备病毒穿透效率但完全去除病毒免疫原性的“空壳载体”？" },
        { id: 75, text: "给药部位的代谢微环境影响： 肌肉注射与皮下注射对大分子药物初始吸收动力学的本质差异是什么？" },
        { id: 76, text: "皮肤透皮递送的物理促透机制： 针对 >100 kDa 的抗体，微针系统如何保证给药量的精确一致性？" },
        { id: 77, text: "生物降解材料的累积毒性： 合成高分子递送载体在体内的代谢产物对肾脏过滤系统的长期物理损伤规律是什么？" },
        { id: 78, text: "吸入递送的肺部巨噬细胞逃逸： 大分子药如何躲避肺泡内天然的免疫清除机制？" },
        { id: 79, text: "个体化递送系统的自适应： 载体能否根据不同患者的血流剪切力差异自动调节其靶向配体的暴露程度？" },
        { id: 80, text: "生产放大的一致性： 微流控合成技术在从实验室毫升级放大到吨级时，如何保证纳米颗粒物理特性的零偏差？" },
      ],
    },
    {
      key: "immunology",
      name: "子领域4：相关免疫学机制（81–100）",
      questions: [
        { id: 81, text: "免疫突触的机械信号转导： TCR 与抗原肽结合时产生的皮牛级（$pN$）物理拉力，如何跨越细胞膜转化为驱动细胞骨架重排的生化信号？" },
        { id: 82, text: "抗原密度的空间协同效应： 肿瘤细胞表面抗原从“弥散分布”转变为“局部簇集”时，触发 T 细胞全效激活的密度阈值如何发生非线性改变？" },
        { id: 83, text: "胞外囊泡的远端免疫重塑： 肿瘤来源的微囊泡如何通过携带特定的代谢酶，在尚未发生转移的远端器官中预先构建“免疫抑制生态位”？" },
        { id: 84, text: "血脑屏障的受体转运极性： 大分子药通过受体介导的胞吞穿过 BBB 时，内皮细胞的炎症极化状态如何决定药物的“捕获-通过”分配比率？" },
        { id: 85, text: "训练免疫的跨代遗传机制： 先天免疫细胞受到的表观遗传重塑，是否能通过骨髓中的造血干细胞（HSC）长期维持并遗传给所有骨髓系后代？" },
        { id: 86, text: "细胞因子信号的偏向性拆解： 如何通过改造 $IL-2$ 的分子构型，使其在保持对效应 T 细胞激活的同时，物理性地阻断其与 Treg 高亲和力受体的结合？" },
        { id: 87, text: "间质流体压力的渗透极限： 肿瘤核心区的高固相压力如何通过改变大分子药物的扩散系数（$D$），在空间上形成免疫治疗的“药力真空区”？" },
        { id: 88, text: "抗原交叉呈递的速率匹配： 外源抗原从内体逃逸到胞质的速度常数，如何精准匹配 $\\text{MHC-I}$ 类分子在内质网中的肽段装载窗口期？" },
        { id: 89, text: "免疫响应的时间节律门控： 细胞内部生物钟基因对线粒体氧化磷酸化的波动调节，如何决定了免疫检查点抑制剂在不同给药时间点的药效差异？" },
        { id: 90, text: "蛋白质冠的免疫原性屏蔽： 在体液循环中瞬时吸附在药物表面的血浆蛋白层，究竟是增强了药物的“隐身性”，还是成为了激活补体系统的“引信”？" },
        { id: 91, text: "组织驻留记忆细胞的代谢偏好： 长期驻留在缺氧黏膜组织的 TRM 细胞，是如何切换底物利用策略以维持长达数年的高灵敏度免疫监控的？" },
        { id: 92, text: "检查点表达的随机涨落效应： 肿瘤克隆间 $PD-L1$ 表达的随机噪声（Stochastic Noise），如何在群体水平上通过信号互补导致整体对单抗药物的耐受？" },
        { id: 93, text: "核酸传感器的信号叠加逻辑： 递送系统诱发的内源性 $mtDNA$ 泄露，与药物载荷触发的 cGAS-STING 通路之间是否存在非线性的加和或拮抗？" },
        { id: 94, text: "神经突触的免疫剪裁动力学： 在慢性神经炎症中，补体系统 $C1q$ 在突触上的异常沉积，是如何诱导小胶质细胞进行非特异性吞噬并导致认知损伤的？" },
        { id: 95, text: "原位 B 细胞的类别转换诱导： 肠道菌群产生的特定次级代谢产物，如何作为生化开关直接在肠道黏膜内诱导 $IgA$ 的类别转换而非全身性免疫响应？" },
        { id: 96, text: "炎性衰老对药物清除的干扰： 老年个体体内持续的高水平促炎因子，是否通过竞争性占据单核-巨噬系统的清除受体，非线性地延长了大分子药的半衰期？" },
        { id: 97, text: "多靶点药物的亲和力配比逻辑： 在双特异性抗体设计中，高亲和力端与低亲和力端的比例如何设定，才能实现对肿瘤细胞的最优“亲和力驱动”选择性？" },
        { id: 98, text: "溶酶体碱化的抗原表位重塑： 药物载体引起的胞内溶酶体 $pH$ 变化，如何通过改变蛋白酶的切割特异性，产生出逃避免疫监控的“异常剪接肽段”？" },
        { id: 99, text: "氧气梯度对效应功能的锁死： 深度缺氧环境如何通过调节 NK 细胞的离子泵活性，导致 $\\text{ADCC}$ 效应在颗粒释放阶段发生机械性中断？" },
        { id: 100, text: "合成免疫记忆的逻辑锁定： 能否设计一种响应特定代谢信号的人工转录开关，在 T 细胞初次激活后将其染色质状态锁定在“长效中心记忆”态？" },
      ],
    },
  ],
};

// ---------- 分组（固定：每5题一组） ----------
function chunk5(list) {
  const out = [];
  for (let i = 0; i < list.length; i += 5) out.push(list.slice(i, i + 5));
  return out;
}

function buildDomain(domainKey) {
  if (domainKey === "general") {
    return { key: "general", name: DATA.general.name, groups: chunk5(DATA.general.questions) };
  }
  const sf = DATA.subfields.find((s) => s.key === domainKey);
  return { key: sf.key, name: sf.name, groups: chunk5(sf.questions) };
}

// ---------- 存储 ----------
const STORAGE_KEY = "bio_innovator_survey_v1";
const SYNC_QUEUE_KEY = "bio_innovator_sync_queue_v1";
const SYNC_RETRY_MAX = 3; // 最大重试次数
const SYNC_RETRY_DELAY = 2000; // 重试延迟（毫秒）

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 同步状态指示器
function updateSyncStatus(status) {
  const el = document.getElementById("syncStatus");
  if (!el) return;
  el.className = `sync-status ${status}`;
  el.style.display = "block";
  if (status === "syncing") {
    el.title = "正在同步到 Google Sheet...";
  } else if (status === "success") {
    el.title = "已成功同步到 Google Sheet";
    setTimeout(() => {
      el.style.display = "none";
    }, 3000);
  } else if (status === "failed") {
    el.title = "同步失败，将在后台自动重试";
  }
}

// 同步队列管理（用于离线重试）
function loadSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveSyncQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  // 更新同步状态指示器
  if (queue.length > 0) {
    updateSyncStatus("syncing");
  } else {
    updateSyncStatus("success");
  }
}
function addToSyncQueue(payload) {
  const queue = loadSyncQueue();
  queue.push({
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  });
  saveSyncQueue(queue);
}
function removeFromSyncQueue(index) {
  const queue = loadSyncQueue();
  queue.splice(index, 1);
  saveSyncQueue(queue);
}

// ---------- 状态结构 ----------
function makeInitialState() {
  return {
    meta: {
      name: "",
      identity: "",
      subfield: "",
      startedAt: new Date().toISOString(),
      finishedAt: null,
    },
    // ranks[domainKey][groupIndex][dimensionKey][questionId] = rankNumber
    ranks: {},
    // interTopRanks[domainKey][dimensionKey] = [{qid, rank}]  (4 items)
    interTopRanks: {},
    open: { q1: "", q2: "", q3: "" },
    ui: { step: 0 },
  };
}

let STATE = loadState() || makeInitialState();

function getLocalServerUrl() {
  const url = (window.SURVEY_CONFIG && window.SURVEY_CONFIG.LOCAL_SERVER_URL) ? String(window.SURVEY_CONFIG.LOCAL_SERVER_URL) : "";
  return url.trim();
}

function getAppsScriptUrl() {
  const url = (window.SURVEY_CONFIG && window.SURVEY_CONFIG.APPS_SCRIPT_WEBAPP_URL) ? String(window.SURVEY_CONFIG.APPS_SCRIPT_WEBAPP_URL) : "";
  return url.trim();
}

// 获取可用的同步端点（优先局域网，失败时降级到 Google Sheet）
function getSyncEndpoint() {
  const local = getLocalServerUrl();
  const google = getAppsScriptUrl();
  
  if (local) {
    // 如果有局域网服务器，优先使用（但需要检查是否可用）
    return { url: local, type: 'local', fallback: google || null };
  }
  
  if (google) {
    return { url: google, type: 'google', fallback: null };
  }
  
  return null;
}

// ---------- 页面定义 ----------
function getSurveySteps() {
  const steps = [];
  steps.push({ type: "intro" });
  steps.push({ type: "meta" });

  // 通用20题：4组，每组3维度排序
  const general = buildDomain("general");
  general.groups.forEach((group, gi) => {
    steps.push({ type: "group_ranking", domainKey: "general", domainName: general.name, groupIndex: gi, questions: group });
  });
  steps.push({ type: "inter_top", domainKey: "general", domainName: general.name });

  // 子领域：按meta.subfield动态插入
  steps.push({ type: "subfield_placeholder" });

  steps.push({ type: "open_questions" });
  steps.push({ type: "review_submit" });
  return steps;
}

function materializeSubfieldSteps(steps, subfieldKey) {
  const idx = steps.findIndex((s) => s.type === "subfield_placeholder");
  if (idx === -1) return steps;
  const before = steps.slice(0, idx);
  const after = steps.slice(idx + 1);

  if (!subfieldKey) {
    return [...before, { type: "subfield_unselected" }, ...after];
  }

  const sf = buildDomain(subfieldKey);
  const sfSteps = [];
  sf.groups.forEach((group, gi) => {
    sfSteps.push({ type: "group_ranking", domainKey: sf.key, domainName: sf.name, groupIndex: gi, questions: group });
  });
  sfSteps.push({ type: "inter_top", domainKey: sf.key, domainName: sf.name });
  return [...before, ...sfSteps, ...after];
}

function getAllSteps() {
  const base = getSurveySteps();
  return materializeSubfieldSteps(base, STATE.meta.subfield);
}

// ---------- 工具函数 ----------
function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === null || v === undefined) continue;
    else if (k === "value") n.value = String(v);
    else if (k === "disabled") n.disabled = Boolean(v);
    else if (k === "checked") n.checked = Boolean(v);
    else if (k === "selected") n.selected = Boolean(v);
    else n.setAttribute(k, String(v));
  }
  for (const c of Array.isArray(children) ? children : [children]) {
    if (c === null || c === undefined) continue;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

function formatQuestion(q) {
  return `${q.id}. ${q.text}`;
}

function ensureDomainState(domainKey) {
  if (!STATE.ranks[domainKey]) STATE.ranks[domainKey] = {};
  if (!STATE.interTopRanks[domainKey]) STATE.interTopRanks[domainKey] = {};
}

function getGroupRankMap(domainKey, groupIndex, dimKey) {
  ensureDomainState(domainKey);
  if (!STATE.ranks[domainKey][groupIndex]) STATE.ranks[domainKey][groupIndex] = {};
  if (!STATE.ranks[domainKey][groupIndex][dimKey]) STATE.ranks[domainKey][groupIndex][dimKey] = {};
  return STATE.ranks[domainKey][groupIndex][dimKey];
}

function validateRanking(rankMap, n) {
  const vals = Object.values(rankMap).filter((x) => x !== "" && x !== null && x !== undefined);
  if (vals.length !== n) return { ok: false, msg: `请为本组所有 ${n} 个问题都分配名次。` };
  const set = new Set(vals);
  if (set.size !== n) return { ok: false, msg: "名次不可重复，请检查是否有两个问题被分配了相同名次。" };
  return { ok: true, msg: "" };
}

function pickTop1QuestionId(domainKey, groupIndex, dimKey) {
  const m = getGroupRankMap(domainKey, groupIndex, dimKey);
  for (const [qid, r] of Object.entries(m)) {
    if (Number(r) === 1) return Number(qid);
  }
  return null;
}

function getQuestionById(qid) {
  const all = [...DATA.general.questions];
  for (const sf of DATA.subfields) all.push(...sf.questions);
  return all.find((q) => q.id === qid) || { id: qid, text: "(未找到题干)" };
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  
  // 检测是否为移动设备（特别是 iOS）
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isIOS) {
    // iOS Safari 不支持直接下载，在新窗口打开内容，用户可以手动保存
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <meta charset="utf-8">
            <title>${filename}</title>
            <style>
              body { font-family: monospace; padding: 20px; white-space: pre-wrap; word-break: break-all; }
              .hint { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="hint">📱 iOS 设备提示：长按页面内容，选择"拷贝"或"分享"来保存文件</div>
            ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </body>
        </html>
      `);
      newWindow.document.close();
      alert("文件已在新窗口打开。请长按页面内容，选择“拷贝”或“分享”来保存文件。");
    } else {
      // 如果弹窗被阻止，尝试复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert(`文件内容已复制到剪贴板。文件名：${filename}\n\n你可以在备忘录或其他应用中粘贴保存。`);
        }).catch(() => {
          // 降级方案：显示内容让用户手动复制
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
            alert(`文件内容已复制到剪贴板。文件名：${filename}\n\n你可以在备忘录或其他应用中粘贴保存。`);
          } catch (e) {
            alert(`无法自动下载文件。文件名：${filename}\n\n请手动复制以下内容：\n\n${text.substring(0, 200)}...`);
          }
          document.body.removeChild(textarea);
        });
      }
    }
  } else {
    // Android 和其他设备：尝试直接下载
    try {
      a.click();
      if (isMobile) {
        // 移动设备可能需要一点延迟
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // 如果下载失败，尝试在新窗口打开
      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        alert("文件已在新窗口打开。如果未自动下载，请右键点击页面选择“另存为”。");
      } else {
        alert("无法下载文件。请检查浏览器设置或尝试使用桌面浏览器。");
      }
    }
  }
  
  a.remove();
}

// ---------- 导出 ----------
function buildExportJson() {
  return {
    ...STATE,
    exportedAt: new Date().toISOString(),
    version: "v1",
  };
}

function buildExportCsv() {
  // 一行：meta + open + 每个域每组每维度每题rank + interTopRanks
  const rows = [];
  const headers = [];
  const obj = {};

  const add = (k, v) => {
    headers.push(k);
    obj[k] = v;
  };

  add("name", STATE.meta.name);
  add("identity", STATE.meta.identity);
  add("subfield", STATE.meta.subfield);
  add("startedAt", STATE.meta.startedAt);
  add("finishedAt", STATE.meta.finishedAt || "");
  add("open_q1", STATE.open.q1);
  add("open_q2", STATE.open.q2);
  add("open_q3", STATE.open.q3);

  const domains = ["general", ...(STATE.meta.subfield ? [STATE.meta.subfield] : [])];
  for (const d of domains) {
    const dom = buildDomain(d);
    for (let gi = 0; gi < dom.groups.length; gi++) {
      for (const dim of DIMENSIONS) {
        const rm = getGroupRankMap(d, gi, dim.key);
        for (const q of dom.groups[gi]) {
          const key = `${d}_g${gi + 1}_${dim.key}_q${q.id}`;
          add(key, rm[q.id] ?? "");
        }
      }
    }
    // inter-top
    for (const dim of DIMENSIONS) {
      const arr = (STATE.interTopRanks[d] && STATE.interTopRanks[d][dim.key]) || [];
      for (const item of arr) {
        add(`${d}_top_${dim.key}_q${item.qid}`, item.rank);
      }
    }
  }

  rows.push(headers.join(","));
  rows.push(headers.map((h) => csvEscape(String(obj[h] ?? ""))).join(","));
  return rows.join("\n");
}

function csvEscape(s) {
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

// ---------- 渲染 ----------
const root = document.getElementById("root");

function render() {
  // 先保存状态，确保数据不丢失
  saveState(STATE);
  root.innerHTML = "";

  const steps = getAllSteps();
  if (STATE.ui.step < 0) STATE.ui.step = 0;
  if (STATE.ui.step >= steps.length) STATE.ui.step = steps.length - 1;

  const step = steps[STATE.ui.step];
  root.appendChild(renderStep(step, STATE.ui.step, steps.length));
  
  // 渲染后再次保存，确保DOM更新后的状态也被保存
  saveState(STATE);
}

function persistOnly() {
  // 避免在用户输入/下拉交互过程中整页重渲染，导致光标跳动/下拉被打断
  saveState(STATE);
}

function renderStep(step, stepIndex, stepCount) {
  if (step.type === "intro") return renderIntro(stepIndex, stepCount);
  if (step.type === "meta") return renderMeta(stepIndex, stepCount);
  if (step.type === "group_ranking") return renderGroupRanking(step, stepIndex, stepCount);
  if (step.type === "inter_top") return renderInterTop(step, stepIndex, stepCount);
  if (step.type === "subfield_unselected") return renderSubfieldUnselected(stepIndex, stepCount);
  if (step.type === "open_questions") return renderOpen(stepIndex, stepCount);
  if (step.type === "review_submit") return renderReview(stepIndex, stepCount);
  return el("div", { class: "card" }, [el("h2", {}, ["未知页面"]), el("p", { class: "desc" }, ["请刷新或重置问卷。"])]);
}

function navBar(stepIndex, stepCount, { canNext = true, onNext, onPrev, nextLabel = "下一步", showBackToLast = false } = {}) {
  // 如果stepCount不确定（比如基本信息页还没选子领域），显示预估总数
  const displayCount = stepCount > 0 ? stepCount : (STATE.meta.subfield ? 14 : 14);
  const left = el("div", { class: "progress" }, [`进度：${stepIndex + 1}/${displayCount}`]);
  
  const buttons = [
    el("button", { class: "btn secondary", type: "button", onClick: onPrev, disabled: stepIndex === 0 ? "true" : null }, ["上一步"]),
    el("button", { class: "btn primary", type: "button", onClick: onNext, disabled: canNext ? null : "true" }, [nextLabel]),
  ];
  
  // 如果不是最后一步，且showBackToLast为true，添加"最后一页"按钮（放在最右边）
  if (showBackToLast && stepIndex < stepCount - 1) {
    const allSteps = getAllSteps();
    const lastStepIndex = allSteps.length - 1;
    // 检查是否已完成所有必填项（才能跳转到最后一页）
    const need = checkCompletion();
    const canGoToLast = need.length === 0;
    
    buttons.push(el("button", {
      class: "btn secondary",
      type: "button",
      onClick: () => {
        STATE.ui.step = lastStepIndex;
        saveState(STATE);
        render();
      },
      disabled: canGoToLast ? null : "true",
    }, ["最后一页"]));
  }
  
  const right = el("div", { class: "nav" }, buttons);
  return el("div", { class: "nav" }, [left, right]);
}

function renderIntro(stepIndex, stepCount) {
  const card = el("div", { class: "card" }, [
    el("h2", {}, ["开场说明"]),
    el("p", { class: "desc" }, [
      "本问卷为记名问卷，用于收集对生物大分子药物相关研究问题的评价。你将对通用20题与所选子领域20题进行排序，并在最后提出1–3个你认为有价值的科研问题。请基于真实判断作答。",
    ]),
    el("div", { class: "ok" }, [
      el("div", {}, ["排序规则：每组5题，对创新性/可行性/科学价值分别排序（1=最高）。随后自动抽取各组Top1，再对4个Top1进行组间排序。"]),
    ]),
  ]);

  const onNext = () => {
    STATE.ui.step++;
    render();
  };
  return el("div", {}, [card, navBar(stepIndex, stepCount, { onPrev: () => {}, onNext, showBackToLast: true })]);
}

function renderMeta(stepIndex, stepCount) {
  const card = el("div", { class: "card" }, [
    el("h2", {}, ["基本信息"]),
    el("p", { class: "desc" }, ["请填写姓名并选择身份类型与子领域。子领域用于加载对应的20题模块。"]),
    el("div", { class: "grid2" }, [
      el("div", { class: "field" }, [
        el("div", { class: "label" }, ["姓名（必填）"]),
        (() => {
          const inp = el("input", {
            class: "input",
            placeholder: "例如：张三",
            onInput: (e) => {
              STATE.meta.name = e.target.value.trimStart();
              persistOnly();
            },
          });
          // 确保value正确设置
          inp.value = STATE.meta.name || "";
          return inp;
        })(),
      ]),
      el("div", { class: "field" }, [
        el("div", { class: "label" }, ["身份类型（必选）"]),
        (() => {
          const sel = el(
            "select",
            {
              class: "select",
              onChange: (e) => {
                STATE.meta.identity = e.target.value;
                persistOnly();
                // 立即更新select的显示值
                sel.value = STATE.meta.identity;
              },
            },
            [
              option("", "请选择…", true),
              option("本科生", "本科生"),
              option("低年级研究生", "低年级研究生"),
              option("高年级研究生", "高年级研究生"),
              option("博士后", "博士后"),
              option("教授/PI", "教授/PI"),
            ]
          );
          // 确保value正确设置
          sel.value = STATE.meta.identity || "";
          return sel;
        })(),
      ]),
    ]),
    el("div", { class: "field", style: "margin-top:12px" }, [
      el("div", { class: "label" }, ["选择子领域（必选）"]),
      (() => {
        const sel = el(
          "select",
          {
            class: "select",
            onChange: (e) => {
              const next = e.target.value;
              // 切换子领域时，保留通用部分，清空子领域相关rank/组间top与开放题（避免混淆）
              STATE.meta.subfield = next;
              persistOnly();
              pruneStateForSubfieldSwitch(next);
              // 确保select显示值更新
              sel.value = next;
              render();
            },
          },
          [
            option("", "请选择…", true),
            ...DATA.subfields.map((s) => option(s.key, s.name)),
          ]
        );
        // 确保value正确设置
        sel.value = STATE.meta.subfield || "";
        return sel;
      })(),
      el("div", { class: "hint" }, ["提示：若你之后切换子领域，本问卷会清空“子领域部分”的排序结果以避免混淆。"]),
    ]),
  ]);

  const canNext = Boolean(STATE.meta.name && STATE.meta.name.trim()) && Boolean(STATE.meta.identity && STATE.meta.identity.trim()) && Boolean(STATE.meta.subfield && STATE.meta.subfield.trim());
  const onPrev = () => {
    STATE.ui.step--;
    render();
  };
  const onNext = () => {
    // 这里不靠实时render刷新按钮状态；点下一步再校验
    if (!canNext) {
      alert("请填写姓名并选择身份类型与子领域后再继续。");
      return;
    }
    STATE.ui.step++;
    render();
  };

  return el("div", {}, [card, navBar(stepIndex, stepCount, { canNext: true, onPrev, onNext, showBackToLast: true })]);
}

function pruneStateForSubfieldSwitch(nextSubfield) {
  // 删除此前子领域相关数据（保持general）
  const keep = { general: STATE.ranks.general || {} };
  STATE.ranks = keep;
  STATE.interTopRanks = { general: STATE.interTopRanks.general || {} };
  // 清空开放题（可选：保留也行；这里清空更安全）
  STATE.open = { q1: "", q2: "", q3: "" };
  // 清空finishedAt
  STATE.meta.finishedAt = null;
  // 重置步骤索引到基本信息页（避免切换子领域后步骤索引错乱）
  STATE.ui.step = 1; // 基本信息页是 step 1（step 0 是 intro）
  // 若nextSubfield为空则不做更多
  if (!nextSubfield) return;
}

function option(value, label, disabled = false) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  if (disabled) o.disabled = true;
  return o;
}

function renderGroupRanking(step, stepIndex, stepCount) {
  const { domainKey, domainName, groupIndex, questions } = step;
  ensureDomainState(domainKey);
  const groupLabel = `第${groupIndex + 1}组（共4组）`;

  const card = el("div", { class: "card" }, [
    el("h2", {}, [`${domainName} - ${groupLabel}`]),
    el("p", { class: "desc" }, [
      "请在同一张表内，对本组5个问题在三个维度分别排序：1=最高，5=最低。每个维度内名次不得重复。",
    ]),
  ]);

  // 初始化空值
  for (const dim of DIMENSIONS) {
    const rm = getGroupRankMap(domainKey, groupIndex, dim.key);
    for (const q of questions) if (rm[q.id] === undefined) rm[q.id] = "";
  }

  card.appendChild(renderTripleColumnRankingTable(domainKey, groupIndex, questions));

  const validation = validateGroupStep(domainKey, groupIndex, questions.length);
  const onPrev = () => {
    STATE.ui.step--;
    render();
  };
  const onNext = () => {
    const v = validateGroupStep(domainKey, groupIndex, questions.length);
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    STATE.ui.step++;
    render();
  };

  const msgBox = validation.ok
    ? el("div", { class: "ok" }, ["本页已完成，可以进入下一页。"])
    : el("div", { class: "error" }, [validation.msg]);

  return el("div", {}, [card, msgBox, navBar(stepIndex, stepCount, { canNext: true, onPrev, onNext, showBackToLast: true })]);
}

function rankSelect({ value, n, onChange, domainKey, groupIndex, dimKey, questionId }) {
  const sel = el(
    "select",
    {
      onChange: (e) => {
        const newVal = e.target.value === "" ? "" : Number(e.target.value);
        if (onChange) onChange(e);
        // 如果修改了组内排序，清除对应的组间Top1排序（让用户重新排序）
        if (domainKey && groupIndex !== undefined && dimKey && questionId !== undefined) {
          if (STATE.interTopRanks[domainKey] && STATE.interTopRanks[domainKey][dimKey]) {
            // 清除该维度的组间排序，因为Top1可能已经改变
            STATE.interTopRanks[domainKey][dimKey] = [];
            persistOnly();
          }
        }
      },
    },
    [option("", "—", false), ...Array.from({ length: n }, (_, i) => option(String(i + 1), String(i + 1)))]
  );
  // 确保value正确设置
  sel.value = value === "" ? "" : String(value);
  return sel;
}

function renderTripleColumnRankingTable(domainKey, groupIndex, questions) {
  const n = questions.length;
  const header = el("div", { class: "table-row table-head" }, [
    el("div", { class: "cell cell-q" }, ["问题"]),
    el("div", { class: "cell cell-d" }, ["创新性"]),
    el("div", { class: "cell cell-d" }, ["可行性"]),
    el("div", { class: "cell cell-d" }, ["科学价值"]),
  ]);

  const rows = questions.map((q) => {
    const rm1 = getGroupRankMap(domainKey, groupIndex, "innovation");
    const rm2 = getGroupRankMap(domainKey, groupIndex, "feasibility");
    const rm3 = getGroupRankMap(domainKey, groupIndex, "value");

    return el("div", { class: "table-row" }, [
      el("div", { class: "cell cell-q" }, [
        el("span", { class: "qid" }, [`Q${q.id}`]),
        el("span", { class: "qbody" }, [q.text]),
      ]),
      el("div", { class: "cell cell-d" }, [
        rankSelect({
          value: rm1[q.id] ?? "",
          n,
          domainKey,
          groupIndex,
          dimKey: "innovation",
          questionId: q.id,
          onChange: (e) => {
            rm1[q.id] = e.target.value === "" ? "" : Number(e.target.value);
            persistOnly();
          },
        }),
      ]),
      el("div", { class: "cell cell-d" }, [
        rankSelect({
          value: rm2[q.id] ?? "",
          n,
          domainKey,
          groupIndex,
          dimKey: "feasibility",
          questionId: q.id,
          onChange: (e) => {
            rm2[q.id] = e.target.value === "" ? "" : Number(e.target.value);
            persistOnly();
          },
        }),
      ]),
      el("div", { class: "cell cell-d" }, [
        rankSelect({
          value: rm3[q.id] ?? "",
          n,
          domainKey,
          groupIndex,
          dimKey: "value",
          questionId: q.id,
          onChange: (e) => {
            rm3[q.id] = e.target.value === "" ? "" : Number(e.target.value);
            persistOnly();
          },
        }),
      ]),
    ]);
  });

  return el("div", { class: "rank-table" }, [header, ...rows]);
}

function validateGroupStep(domainKey, groupIndex, n) {
  for (const dim of DIMENSIONS) {
    const rm = getGroupRankMap(domainKey, groupIndex, dim.key);
    const v = validateRanking(rm, n);
    if (!v.ok) return { ok: false, msg: `【${dim.label}】${v.msg}` };
  }
  return { ok: true, msg: "" };
}

function renderInterTop(step, stepIndex, stepCount) {
  const { domainKey, domainName } = step;
  ensureDomainState(domainKey);
  const dom = buildDomain(domainKey);

  // 先检查：4组的组内排序是否完成，否则不允许进入（理论上前面页面已挡住，但这里再防呆）
  const precheck = [];
  for (let gi = 0; gi < dom.groups.length; gi++) {
    const v = validateGroupStep(domainKey, gi, dom.groups[gi].length);
    if (!v.ok) precheck.push(`第${gi + 1}组未完成：${v.msg}`);
  }

  const card = el("div", { class: "card" }, [
    el("h2", {}, [`${domainName} - 组间Top1排序`]),
    el("p", { class: "desc" }, [
      "系统将根据你在上一阶段的组内排序结果，为每个维度自动抽取每组Top1（名次=1）的题目，共4题；请再对这4题进行排序（1=最高）。",
    ]),
  ]);

  if (precheck.length) {
    card.appendChild(el("div", { class: "error" }, [precheck.join("；")]));
    return el("div", {}, [card, navBar(stepIndex, stepCount, { canNext: false, onPrev: () => { STATE.ui.step--; render(); }, onNext: () => {}, showBackToLast: true })]);
  }

  // 三个维度并排显示（每列对应一个维度；候选题按该维度自动Top1生成）
  const inter = el("div", { class: "grid3" }, DIMENSIONS.map((dim) => renderInterTopForDim(domainKey, dom, dim)));
  card.appendChild(inter);

  const validation = validateInterTop(domainKey);
  const msgBox = validation.ok ? el("div", { class: "ok" }, ["本页已完成，可以进入下一页。"]) : el("div", { class: "error" }, [validation.msg]);

  const onPrev = () => {
    STATE.ui.step--;
    render();
  };
  const onNext = () => {
    const v = validateInterTop(domainKey);
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    STATE.ui.step++;
    render();
  };

  return el("div", {}, [card, msgBox, navBar(stepIndex, stepCount, { canNext: true, onPrev, onNext, showBackToLast: true })]);
}

function renderInterTopForDim(domainKey, dom, dim) {
  const candidates = [];
  for (let gi = 0; gi < dom.groups.length; gi++) {
    const topQid = pickTop1QuestionId(domainKey, gi, dim.key);
    candidates.push({ groupIndex: gi, qid: topQid });
  }

  // 初始化 interTopRanks
  // 检查Top1候选题是否发生变化（如果用户修改了组内排序，Top1可能改变）
  const oldRanks = STATE.interTopRanks[domainKey][dim.key] || [];
  const oldQids = new Set(oldRanks.map((x) => x.qid));
  const newQids = new Set(candidates.map((c) => c.qid));
  const top1Changed = oldQids.size !== newQids.size || !candidates.every((c) => oldQids.has(c.qid));
  
  if (!STATE.interTopRanks[domainKey][dim.key] || top1Changed) {
    // 如果Top1发生变化，清空之前的排序，让用户重新排序
    STATE.interTopRanks[domainKey][dim.key] = candidates.map((c) => ({ qid: c.qid, rank: "" }));
  } else {
    // 若候选没变化，保留之前的rank
    const old = STATE.interTopRanks[domainKey][dim.key];
    const next = candidates.map((c) => {
      const found = old.find((x) => x.qid === c.qid);
      return { qid: c.qid, rank: found ? found.rank : "" };
    });
    STATE.interTopRanks[domainKey][dim.key] = next;
  }

  const arr = STATE.interTopRanks[domainKey][dim.key];
  const n = 4;

  const box = el("div", { class: "card", style: "margin-top:12px;background:rgba(255,255,255,.75);border-radius:14px" }, [
    el("div", { class: "pill" }, [el("strong", {}, [dim.label]), el("span", {}, ["（对4个Top1排序，1=最高）"])]),
  ]);

  const list = el(
    "div",
    { class: "ranking" },
    arr.map((item) => {
      const q = getQuestionById(item.qid);
      const select = el(
        "select",
        {
          onChange: (e) => {
            item.rank = e.target.value === "" ? "" : Number(e.target.value);
            persistOnly();
          },
        },
        [option("", "—", false), ...Array.from({ length: n }, (_, i) => option(String(i + 1), String(i + 1)))]
      );
      // 确保value正确设置
      select.value = String(item.rank ?? "");
      return el("div", { class: "rank-item" }, [
        el("div", { class: "rank-text" }, [el("span", { class: "qid" }, [`Q${q.id}`]), el("span", { class: "qbody" }, [q.text])]),
        el("div", { class: "rank-controls" }, [select]),
      ]);
    })
  );

  box.appendChild(list);
  return box;
}

function validateInterTop(domainKey) {
  for (const dim of DIMENSIONS) {
    const arr = (STATE.interTopRanks[domainKey] && STATE.interTopRanks[domainKey][dim.key]) || [];
    if (arr.length !== 4) return { ok: false, msg: `【${dim.label}】候选题数量异常（应为4）。` };
    const map = {};
    for (const item of arr) map[item.qid] = item.rank;
    const v = validateRanking(map, 4);
    if (!v.ok) return { ok: false, msg: `【${dim.label}】${v.msg}` };
  }
  return { ok: true, msg: "" };
}

function renderSubfieldUnselected(stepIndex, stepCount) {
  const card = el("div", { class: "card" }, [
    el("h2", {}, ["未选择子领域"]),
    el("p", { class: "desc" }, ["你尚未在基本信息页选择子领域，因此子领域模块无法加载。请返回上一页选择子领域。"]),
  ]);
  return el("div", {}, [
    card,
    navBar(stepIndex, stepCount, {
      canNext: false,
      onPrev: () => {
        STATE.ui.step--;
        render();
      },
      onNext: () => {},
    }),
  ]);
}

function renderOpen(stepIndex, stepCount) {
  const card = el("div", { class: "card" }, [
    el("h2", {}, ["子领域开放题（1–3个科研问题）"]),
    el("p", { class: "desc" }, [
      "请结合你所选子领域的20题与个人理解，提出1–3个你认为有价值的科研问题（可以是延伸/组合/改写/全新问题）。",
    ]),
    el("div", { class: "field" }, [
      el("div", { class: "label" }, ["问题1（必填）"]),
      (() => {
        const ta = el("textarea", {
          class: "textarea",
          placeholder: "请描述你的科研问题1…",
          onInput: (e) => {
            STATE.open.q1 = e.target.value;
            persistOnly();
          },
        });
        ta.value = STATE.open.q1 || "";
        return ta;
      })(),
    ]),
    el("div", { class: "field", style: "margin-top:12px" }, [
      el("div", { class: "label" }, ["问题2（可选）"]),
      (() => {
        const ta = el("textarea", {
          class: "textarea",
          placeholder: "可选…",
          onInput: (e) => {
            STATE.open.q2 = e.target.value;
            persistOnly();
          },
        });
        ta.value = STATE.open.q2 || "";
        return ta;
      })(),
    ]),
    el("div", { class: "field", style: "margin-top:12px" }, [
      el("div", { class: "label" }, ["问题3（可选）"]),
      (() => {
        const ta = el("textarea", {
          class: "textarea",
          placeholder: "可选…",
          onInput: (e) => {
            STATE.open.q3 = e.target.value;
            persistOnly();
          },
        });
        ta.value = STATE.open.q3 || "";
        return ta;
      })(),
    ]),
  ]);

  const canNext = Boolean((STATE.open.q1 || "").trim());
  const msgBox = canNext
    ? el("div", { class: "ok" }, ["本页已完成，可以进入下一页。"])
    : el("div", { class: "error" }, ["请至少填写“问题1”。（此提示会在你点击下一步时阻止继续）"]);

  return el("div", {}, [
    card,
    msgBox,
    navBar(stepIndex, stepCount, {
      canNext: true,
      onPrev: () => {
        STATE.ui.step--;
        render();
      },
      onNext: () => {
        const nowOk = Boolean((STATE.open.q1 || "").trim());
        if (!nowOk) {
          alert("请至少填写“问题1”。");
          return;
        }
        STATE.ui.step++;
        render();
      },
      showBackToLast: true,
    }),
  ]);
}

function renderReview(stepIndex, stepCount) {
  const steps = getAllSteps();
  const need = checkCompletion();

  const card = el("div", { class: "card" }, [
    el("h2", {}, ["检查与提交"]),
    el("p", { class: "desc" }, [
      "这里会检查是否完成所有必填排序与开放题。提交后会写入完成时间，并建议你导出JSON/CSV保存。",
    ]),
    el("div", { class: "pill" }, [
      el("span", {}, ["姓名："]),
      el("strong", {}, [STATE.meta.name || "(未填)"]),
      el("span", { style: "margin-left:10px" }, ["身份："]),
      el("strong", {}, [STATE.meta.identity || "(未选)"]),
    ]),
    el("div", { class: "pill", style: "margin-top:10px" }, [
      el("span", {}, ["子领域："]),
      el("strong", {}, [STATE.meta.subfield ? (DATA.subfields.find((s) => s.key === STATE.meta.subfield)?.name || STATE.meta.subfield) : "(未选)"]),
    ]),
  ]);

  if (need.length) {
    card.appendChild(el("div", { class: "error" }, [`未完成项：${need.join("；")}`]));
  } else {
    card.appendChild(el("div", { class: "ok" }, ["所有必填项已完成。你可以点击“提交完成”，然后导出结果文件。"]));
  }

  const canSubmit = need.length === 0;
  const onSubmit = () => {
    if (!canSubmit) return;

    // 1) 本地先标记完成并保存（确保数据不丢失）
    STATE.meta.finishedAt = new Date().toISOString();
    saveState(STATE);
    
    // 2) 立即显示成功提示，告知数据已保存
    const payload = buildExportJson();
    const jsonStr = JSON.stringify(payload, null, 2);
    
    // 3) 尝试同步到服务器（优先局域网，失败时降级到 Google Sheet）
    const endpointConfig = getSyncEndpoint();
    if (endpointConfig) {
      // 先显示成功提示（数据已保存在本地）
      render();
      const serverName = endpointConfig.type === 'local' ? '局域网服务器' : 'Google Sheet';
      alert(`✅ 提交成功！\n\n你的问卷数据已保存在浏览器本地存储中，不会丢失。\n\n正在尝试同步到 ${serverName}...`);
      
      // 更新同步状态
      updateSyncStatus("syncing");
      
      // 尝试同步（带重试机制和自动降级）
      attemptSyncWithFallback(endpointConfig, payload, 0, (success, message, usedEndpoint) => {
        if (success) {
          updateSyncStatus("success");
          const serverName = usedEndpoint === 'local' ? '局域网服务器' : 'Google Sheet';
          alert(`✅ 提交成功！\n\n✓ 数据已保存在本地\n✓ 已成功同步到 ${serverName}\n\n建议：你也可以点击右上角“导出 JSON”或“导出 CSV”保存一份本地备份。`);
        } else {
          // 同步失败，加入队列稍后重试
          addToSyncQueue(payload);
          updateSyncStatus("failed");
          alert(`✅ 提交成功！\n\n✓ 数据已保存在浏览器本地存储中\n⚠ 同步失败：${message}\n\n系统会在后台自动重试（右上角有同步状态指示器）。你也可以点击右上角“导出 JSON”或“导出 CSV”保存一份本地备份。`);
          // 启动后台重试
          startBackgroundSync();
        }
      });
      return;
    }

    // 如果没有配置 Apps Script URL
    render();
    alert("✅ 提交成功！\n\n你的问卷数据已保存在浏览器本地存储中。\n\n建议：点击右上角“导出 JSON”或“导出 CSV”保存一份本地备份。\n\n如需自动汇总到 Google Sheet，请联系管理员配置后端服务。");
  };

  const controls = el("div", { class: "nav" }, [
    el("button", { class: "btn secondary", type: "button", onClick: () => { STATE.ui.step--; render(); } }, ["上一步"]),
    el("button", { class: "btn primary", type: "button", onClick: onSubmit, disabled: canSubmit ? null : "true" }, ["提交完成"]),
  ]);

  const lastStepIndex = steps.length - 1;
  const jump = el("div", { class: "card", style: "margin-top:14px;background:rgba(0,0,0,.12)" }, [
    el("h2", {}, ["快速跳转（可选）"]),
    el("p", { class: "desc" }, ["如果你想返回修改某一页，可以在下方选择页面跳转。跳转后可以随时返回此页面继续提交。"]),
    el(
      "select",
      {
        class: "select",
        value: "",
        onChange: (e) => {
          const v = Number(e.target.value);
          if (!Number.isFinite(v)) return;
          // 记住当前是review页面，方便返回
          STATE.ui._lastReviewStep = stepIndex;
          STATE.ui.step = v;
          saveState(STATE);
          render();
        },
      },
      [
        option("", "选择页面…", true),
        ...steps.map((s, i) => option(String(i), `${i + 1}/${steps.length} - ${stepTitle(s)}`)),
      ]
    ),
    el("div", { style: "margin-top:10px" }, [
      el("button", {
        class: "btn secondary",
        type: "button",
        onClick: () => {
          STATE.ui.step = lastStepIndex;
          saveState(STATE);
          render();
        },
      }, ["快速回到提交页面"]),
    ]),
  ]);

  return el("div", {}, [card, controls, jump]);
}

function stepTitle(s) {
  if (s.type === "intro") return "开场";
  if (s.type === "meta") return "基本信息";
  if (s.type === "group_ranking") return `${s.domainName} 第${s.groupIndex + 1}组 组内排序`;
  if (s.type === "inter_top") return `${s.domainName} 组间Top1排序`;
  if (s.type === "subfield_unselected") return "未选择子领域";
  if (s.type === "open_questions") return "开放题";
  if (s.type === "review_submit") return "检查与提交";
  return "未知";
}

function checkCompletion() {
  const issues = [];
  if (!STATE.meta.name.trim()) issues.push("姓名未填写");
  if (!STATE.meta.identity) issues.push("身份未选择");
  if (!STATE.meta.subfield) issues.push("子领域未选择");

  // 通用 + 子领域：每组3维度都要完成 + interTop 3维度完成
  const domains = ["general", ...(STATE.meta.subfield ? [STATE.meta.subfield] : [])];
  for (const d of domains) {
    const dom = buildDomain(d);
    for (let gi = 0; gi < dom.groups.length; gi++) {
      const v = validateGroupStep(d, gi, dom.groups[gi].length);
      if (!v.ok) issues.push(`${dom.name} 第${gi + 1}组未完成`);
    }
    const v2 = validateInterTop(d);
    if (!v2.ok) issues.push(`${dom.name} 组间Top1未完成`);
  }

  if (!STATE.open.q1.trim()) issues.push("开放题“问题1”未填写");
  return issues;
}

// ---------- 顶部按钮 ----------
document.getElementById("btnReset").addEventListener("click", () => {
  const ok = confirm("确定要重置吗？这会清空所有已填写内容。");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  STATE = makeInitialState();
  render();
});
document.getElementById("btnExportJson").addEventListener("click", () => {
  const data = buildExportJson();
  download(`biology_innovator_${safeName(STATE.meta.name)}.json`, JSON.stringify(data, null, 2));
});
document.getElementById("btnExportCsv").addEventListener("click", () => {
  const csv = buildExportCsv();
  download(`biology_innovator_${safeName(STATE.meta.name)}.csv`, csv);
});

function safeName(name) {
  const s = (name || "anonymous").trim() || "anonymous";
  return s.replaceAll(/[\\/:*?"<>|\\s]+/g, "_").slice(0, 40);
}

// ---------- 同步功能 ----------去除了预检
function attemptSync(endpoint, payload, retryCount, callback, endpointType = 'local') {
  const apiPath = endpointType === 'local' ? '/api/submit' : '';
  const fullUrl = endpoint + apiPath;

  const isGoogle = endpointType === 'google';

  const fetchOptions = isGoogle
    ? {
        method: "POST",
        mode: "no-cors",
        // 关键：不加 application/json，避免触发预检；让它成为“简单请求”
        // body 是字符串时，浏览器通常会用 text/plain;charset=UTF-8
        body: JSON.stringify(payload),
        keepalive: true,
      }
    : {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

  fetch(fullUrl, fetchOptions)
    .then((res) => {
      if (isGoogle) {
        // no-cors 下无法读取回执；能走到这里说明请求发出并收到了响应（但无法判断服务端是否 500）
        callback(true, "已发送到 Google（no-cors，无法读取回执）", endpointType);
        return null;
      }
      if (res.ok) return res.json();
      throw new Error(`HTTP ${res.status}`);
    })
    .then((data) => {
      if (isGoogle) return; // 防止二次处理
      if (data && data.ok) {
        callback(true, "同步成功", endpointType);
      } else {
        throw new Error("服务器返回错误");
      }
    })
    .catch((err) => {
      console.error(`同步失败 (${endpointType}, 重试 ${retryCount}/${SYNC_RETRY_MAX}):`, err);
      if (retryCount < SYNC_RETRY_MAX) {
        setTimeout(() => {
          attemptSync(endpoint, payload, retryCount + 1, callback, endpointType);
        }, SYNC_RETRY_DELAY * (retryCount + 1));
      } else {
        callback(false, err.message || "网络错误", endpointType);
      }
    });
}


// 带自动降级的同步函数
function attemptSyncWithFallback(endpointConfig, payload, retryCount, callback) {
  const { url, type, fallback } = endpointConfig;
  
  attemptSync(url, payload, 0, (success, message, usedType) => {
    if (success) {
      callback(true, message, usedType);
    } else {
      // 如果主端点失败，且有备用端点，尝试备用
      if (fallback && retryCount === 0) {
        console.log(`主端点失败，尝试备用端点...`);
        const fallbackConfig = {
          url: fallback,
          type: 'google',
          fallback: null
        };
        attemptSyncWithFallback(fallbackConfig, payload, 1, callback);
      } else {
        callback(false, message, type);
      }
    }
  }, type);
}

function startBackgroundSync() {
  const endpointConfig = getSyncEndpoint();
  if (!endpointConfig) return;
  
  const queue = loadSyncQueue();
  if (queue.length === 0) {
    updateSyncStatus("success");
    return;
  }
  
  // 更新同步状态
  updateSyncStatus("syncing");
  
  // 处理队列中的第一个项目
  const item = queue[0];
  attemptSyncWithFallback(endpointConfig, item.payload, 0, (success, message, usedEndpoint) => {
    if (success) {
      // 同步成功，从队列中移除
      removeFromSyncQueue(0);
      // 继续处理下一个
      if (loadSyncQueue().length > 0) {
        setTimeout(startBackgroundSync, 1000);
      } else {
        updateSyncStatus("success");
      }
    } else {
      // 同步失败，增加重试计数
      item.retryCount++;
      if (item.retryCount >= SYNC_RETRY_MAX * 2) {
        // 超过最大重试次数，从队列中移除（避免无限重试）
        removeFromSyncQueue(0);
        updateSyncStatus("failed");
        console.warn("同步失败次数过多，已从队列中移除");
      } else {
        saveSyncQueue(queue);
      }
      // 稍后重试（指数退避）
      setTimeout(startBackgroundSync, SYNC_RETRY_DELAY * Math.pow(2, item.retryCount));
    }
  });
}

// 页面加载时检查是否有待同步的队列
function checkPendingSync() {
  const queue = loadSyncQueue();
  if (queue.length > 0) {
    console.log(`检测到 ${queue.length} 个待同步项目，开始后台同步...`);
    updateSyncStatus("syncing");
    startBackgfetchroundSync();
  }
}

// 监听网络状态，网络恢复时自动重试
if (typeof navigator !== "undefined" && "onLine" in navigator) {
  window.addEventListener("online", () => {
    console.log("网络已恢复，检查待同步队列...");
    checkPendingSync();
  });
}

// ---------- 启动 ----------
render();
// 启动时检查待同步队列
checkPendingSync();


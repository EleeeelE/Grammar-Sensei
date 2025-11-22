
import { Lesson } from './types';

export const LESSON_CATEGORIES = [
  '基础篇',
  'N5语法',
  'N4语法',
  'N3语法',
  'N2语法',
  'N1语法'
];

// Optimized for readability: Dark text (blue-950) on light backgrounds, White text on dark backgrounds.
// Colors are now softer (500/400) or deeper (950).
export const CATEGORY_META: Record<string, { description: string; color: string; iconBg: string; level: string; borderColor: string }> = {
  '基础篇': { 
    description: '五十音图与日语的底层逻辑', 
    color: 'text-blue-950', 
    iconBg: 'bg-white',
    level: 'Basic',
    borderColor: 'border-blue-950'
  },
  'N5语法': { 
    description: '120个核心语法点，通关生存日语', 
    color: 'text-white', 
    iconBg: 'bg-blue-500',
    level: 'N5',
    borderColor: 'border-blue-950'
  },
  'N4语法': { 
    description: '动词变形与基础复句', 
    color: 'text-blue-950', 
    iconBg: 'bg-blue-200',
    level: 'N4',
    borderColor: 'border-blue-950'
  },
  'N3语法': { 
    description: '日常交流与进阶表达', 
    color: 'text-white', 
    iconBg: 'bg-blue-600',
    level: 'N3',
    borderColor: 'border-blue-950'
  },
  'N2语法': { 
    description: '商务日语与抽象逻辑', 
    color: 'text-blue-950', 
    iconBg: 'bg-blue-100',
    level: 'N2',
    borderColor: 'border-blue-950'
  },
  'N1语法': { 
    description: '生硬书面语与高阶修辞', 
    color: 'text-white', 
    iconBg: 'bg-blue-400', // Changed from bg-blue-800 to lighter blue
    level: 'N1',
    borderColor: 'border-blue-950'
  },
};

let lessons: Lesson[] = [
  // --- 基础篇 ---
  {
    id: 'b-1',
    category: '基础篇',
    title: '声音的本质',
    subtitle: '五个元音定乾坤',
    duration: '6 分钟',
    initialPrompt: '请从底层逻辑教我日语发音。不要只是罗列五十音图。请告诉我为什么只要掌握 a i u e o 这五个元音，就能搞定90%的发音？'
  },
  {
    id: 'b-2',
    category: '基础篇',
    title: '思维的倒转',
    subtitle: '为什么谓语在最后？',
    duration: '8 分钟',
    initialPrompt: '请教我日语句子的核心逻辑。为什么说日语是“必须听到最后才能懂”的语言？'
  },
  {
    id: 'b-3',
    category: '基础篇',
    title: '黏着语的魔力',
    subtitle: '助词就是“身份标签”',
    duration: '8 分钟',
    initialPrompt: '请用最形象的方式解释什么是“助词”（Particle）。为什么说日语是“黏着语”？'
  },

  // --- N5 120 课 ---
  { id: 'n5-1', category: 'N5语法', title: '我是谁？', subtitle: '名词1+は+名词2+です/ではありません', duration: '5m', initialPrompt: '教我用日语自我介绍和否定，讲解 AはBです 句型。' },
  { id: 'n5-2', category: 'N5语法', title: '昨日的我', subtitle: '名词1+は+名词2+でした/ではありませんでした', duration: '5m', initialPrompt: '教我日语名词句的过去式。' },
  { id: 'n5-3', category: 'N5语法', title: '朋友之间别客气', subtitle: '名词1+は+名词2+だ/ではない', duration: '4m', initialPrompt: '教我日语名词句的简体（普通形），用于朋友对话。' },
  { id: 'n5-4', category: 'N5语法', title: '那些年', subtitle: '名词1+は+名词2+だった/ではなかった', duration: '4m', initialPrompt: '教我日语名词句简体的过去式。' },
  { id: 'n5-5', category: 'N5语法', title: '是这样吗？', subtitle: '名词1+は+名词2+ですか/でしたか', duration: '4m', initialPrompt: '教我如何用日语提问（疑问句）。' },
  { id: 'n5-6', category: 'N5语法', title: '我是老师也是学生', subtitle: '名词1+は+名词2+で、名词3です', duration: '5m', initialPrompt: '教我用“で”连接两个名词句子（中顿）。' },
  { id: 'n5-7', category: 'N5语法', title: '这个那个到底是哪个', subtitle: 'これ、それ、あれ、どれ', duration: '5m', initialPrompt: '教我日语的指示代词（事物）：これ、それ、あれ、どれ。' },
  { id: 'n5-8', category: 'N5语法', title: '特指这个东西', subtitle: 'この、その、あの、どの', duration: '5m', initialPrompt: '教我日语的连体词：この、その、あの、どの。' },
  { id: 'n5-9', category: 'N5语法', title: '我在哪？', subtitle: 'ここ、そこ、あそこ、どこ', duration: '5m', initialPrompt: '教我日语的地点指示词：ここ、そこ、あそこ、どこ。' },
  { id: 'n5-10', category: 'N5语法', title: '就这样办', subtitle: 'こう、そう、ああ、どう', duration: '5m', initialPrompt: '教我日语的副词性指示词：こう、そう、ああ、どう。' },
  
  { id: 'n5-11', category: 'N5语法', title: '这边请', subtitle: 'こちら、そちら、あちら、どちら', duration: '5m', initialPrompt: '教我日语的方向/礼貌指示词：こちら、そちら、あちら、どちら。' },
  { id: 'n5-12', category: 'N5语法', title: '那种人', subtitle: 'こんな、そんな、あんな、どんな', duration: '5m', initialPrompt: '教我日语的样态指示词：こんな、そんな、あんな、どんな。' },
  { id: 'n5-13', category: 'N5语法', title: '数数游戏', subtitle: '基数词', duration: '6m', initialPrompt: '教我日语基本的数字读法（基数词）。' },
  { id: 'n5-14', category: 'N5语法', title: '第一第二', subtitle: '序数词', duration: '4m', initialPrompt: '教我日语的序数词表达。' },
  { id: 'n5-15', category: 'N5语法', title: '量词大作战', subtitle: '常用助数词', duration: '8m', initialPrompt: '教我日语常用的量词（本、匹、个、台等）。' },
  { id: 'n5-16', category: 'N5语法', title: '到底有几个？', subtitle: '常用数量的读法', duration: '5m', initialPrompt: '教我日语数量词的特殊读音（比如一人、二人）。' },
  { id: 'n5-17', category: 'N5语法', title: '动词的三国演义', subtitle: '三类动词的区分', duration: '8m', initialPrompt: '教我如何区分日语的一类、二类和三类动词。' },
  { id: 'n5-18', category: 'N5语法', title: '自作自受？', subtitle: '自动词和他动词', duration: '8m', initialPrompt: '教我日语自动词和他动词的区别逻辑。' },
  { id: 'n5-19', category: 'N5语法', title: '变身！礼貌模式', subtitle: '动词「ます形」及敬体形', duration: '8m', initialPrompt: '教我日语动词的 Masu 形变形规则。' },
  { id: 'n5-20', category: 'N5语法', title: '万能胶水', subtitle: '动词「て形」', duration: '10m', initialPrompt: '教我日语动词最重要的 Te 形变形口诀。' },
  { id: 'n5-21', category: 'N5语法', title: '往事随风', subtitle: '动词「た形」', duration: '6m', initialPrompt: '教我日语动词的 Ta 形（简体过去式）。' },
  { id: 'n5-22', category: 'N5语法', title: '不许做！', subtitle: '动词「ない形」', duration: '6m', initialPrompt: '教我日语动词的 Nai 形（否定式）。' },
  { id: 'n5-23', category: 'N5语法', title: '切换频道', subtitle: '动词敬体形和普通形', duration: '5m', initialPrompt: '总结动词的敬体和简体切换。' },
  { id: 'n5-24', category: 'N5语法', title: '搞事情', subtitle: 'する', duration: '4m', initialPrompt: '讲解动词 する 的多种用法。' },
  { id: 'n5-25', category: 'N5语法', title: '搞一下', subtitle: 'やる', duration: '4m', initialPrompt: '讲解动词 やる 的用法及与 する 的区别。' },
  { id: 'n5-26', category: 'N5语法', title: 'Yes I Can', subtitle: 'できる', duration: '5m', initialPrompt: '讲解 できる (能够/完成) 的用法。' },
  { id: 'n5-27', category: 'N5语法', title: '这里有死物', subtitle: 'ある', duration: '5m', initialPrompt: '讲解存在动词 ある (无生命)。' },
  { id: 'n5-28', category: 'N5语法', title: '这里有活物', subtitle: 'いる', duration: '5m', initialPrompt: '讲解存在动词 いる (有生命)。' },
  { id: 'n5-29', category: 'N5语法', title: '那！就是那个形容词', subtitle: 'な形容词普通形', duration: '5m', initialPrompt: '教我日语的形容动词（Na形容词）的普通形。' },
  { id: 'n5-30', category: 'N5语法', title: '那！要礼貌', subtitle: 'な形容词敬体形', duration: '5m', initialPrompt: '教我日语的形容动词（Na形容词）的敬体形。' },
  { id: 'n5-31', category: 'N5语法', title: '漂亮的姑娘', subtitle: 'な形容词+名词', duration: '4m', initialPrompt: '教我 Na形容词如何修饰名词（加哪？）。' },
  { id: 'n5-32', category: 'N5语法', title: '既漂亮又聪明', subtitle: 'な形容词「て形」', duration: '5m', initialPrompt: '教我 Na形容词的中顿形（で）。' },
  { id: 'n5-33', category: 'N5语法', title: '变得漂亮', subtitle: 'な形容词+动词', duration: '5m', initialPrompt: '教我 Na形容词如何修饰动词（变成副词）。' },
  { id: 'n5-34', category: 'N5语法', title: '伊！是这个形容词', subtitle: 'い形容词普通形', duration: '5m', initialPrompt: '教我日语的 I形容词 普通形。' },
  { id: 'n5-35', category: 'N5语法', title: '伊！要礼貌', subtitle: 'い形容词敬体形', duration: '5m', initialPrompt: '教我日语的 I形容词 敬体形（加です）。' },
  { id: 'n5-36', category: 'N5语法', title: '可爱的猫', subtitle: 'い形容词+名词', duration: '4m', initialPrompt: '教我 I形容词 如何修饰名词。' },
  { id: 'n5-37', category: 'N5语法', title: '又高又帅', subtitle: 'い形容词「て形」', duration: '5m', initialPrompt: '教我 I形容词 的中顿形（くて）。' },
  { id: 'n5-38', category: 'N5语法', title: '走得快', subtitle: 'い形容词+动词', duration: '5m', initialPrompt: '教我 I形容词 如何修饰动词（变く）。' },
  { id: 'n5-39', category: 'N5语法', title: '几岁啦？', subtitle: 'いくつ', duration: '3m', initialPrompt: '讲解疑问词 いくつ (多少个/几岁)。' },
  { id: 'n5-40', category: 'N5语法', title: '何时君再来', subtitle: 'いつ', duration: '3m', initialPrompt: '讲解疑问词 いつ (什么时候)。' },
  { id: 'n5-41', category: 'N5语法', title: '那是谁？', subtitle: '誰/どの人/どなた/どの方', duration: '5m', initialPrompt: '讲解询问“谁”的四种不同礼貌程度的说法。' },
  { id: 'n5-42', category: 'N5语法', title: '怎么样？', subtitle: 'どう/いかが', duration: '4m', initialPrompt: '讲解询问意见或情况的 どう 和 いかが。' },
  { id: 'n5-43', category: 'N5语法', title: '大概多久？', subtitle: 'どのぐらい/どれぐらい', duration: '4m', initialPrompt: '讲解询问程度或时长的 どのぐらい。' },
  { id: 'n5-44', category: 'N5语法', title: '纳尼？！', subtitle: '何 (なに/なん)', duration: '5m', initialPrompt: '讲解 何 的读音区别（Nani vs Nan）。' },
  { id: 'n5-45', category: 'N5语法', title: '十万个为什么', subtitle: 'なぜ/どうして/なんで', duration: '5m', initialPrompt: '讲解三个“为什么”的区别。' },
  { id: 'n5-46', category: 'N5语法', title: '主语就是我', subtitle: 'が', duration: '6m', initialPrompt: '深入讲解助词 が 的用法（主语标记、对象语）。' },
  { id: 'n5-47', category: 'N5语法', title: '来自哪里', subtitle: 'から', duration: '5m', initialPrompt: '讲解助词 から (起点/原因)。' },
  { id: 'n5-48', category: 'N5语法', title: '用工具/在地点', subtitle: 'で', duration: '6m', initialPrompt: '深入讲解助词 で 的多种用法（工具、手段、动作场所）。' },
  { id: 'n5-49', category: 'N5语法', title: '我和你', subtitle: 'と', duration: '5m', initialPrompt: '讲解助词 と (并列、伴随、引用)。' },
  { id: 'n5-50', category: 'N5语法', title: '去哪里/几点', subtitle: 'に', duration: '6m', initialPrompt: '深入讲解助词 に (时间点、目的地、存在场所)。' },
  { id: 'n5-51', category: 'N5语法', title: '我的', subtitle: 'の', duration: '5m', initialPrompt: '讲解助词 の (所属、同位、修饰)。' },
  { id: 'n5-52', category: 'N5语法', title: '向着夕阳奔跑', subtitle: 'へ', duration: '4m', initialPrompt: '讲解助词 へ (移动方向) 及其读音。' },
  { id: 'n5-53', category: 'N5语法', title: '直到永远', subtitle: 'まで', duration: '4m', initialPrompt: '讲解助词 まで (终点)。' },
  { id: 'n5-54', category: 'N5语法', title: '把饭吃了', subtitle: 'を', duration: '5m', initialPrompt: '讲解助词 を (宾语标记、移动空间)。' },
  { id: 'n5-55', category: 'N5语法', title: '完全列举', subtitle: '～と～', duration: '3m', initialPrompt: '复习 と 的并列用法。' },
  { id: 'n5-56', category: 'N5语法', title: '不完全列举', subtitle: '～や～', duration: '4m', initialPrompt: '讲解 や (列举一部分)。' },
  { id: 'n5-57', category: 'N5语法', title: '或者', subtitle: '～か～', duration: '4m', initialPrompt: '讲解 か (选择/或者)。' },
  { id: 'n5-58', category: 'N5语法', title: '我也一样', subtitle: '～も', duration: '4m', initialPrompt: '讲解 も (也、强调)。' },
  { id: 'n5-59', category: 'N5语法', title: '话题的主角', subtitle: 'は', duration: '5m', initialPrompt: '复习助词 は (话题标记)。' },
  { id: 'n5-60', category: 'N5语法', title: '唯一的爱', subtitle: '～しか～ない', duration: '5m', initialPrompt: '讲解 しか...ない (只/仅，后接否定)。' },
  { id: 'n5-61', category: 'N5语法', title: '仅仅', subtitle: '～だけ', duration: '5m', initialPrompt: '讲解 だけ (只/仅，后接肯定)。' },
  { id: 'n5-62', category: 'N5语法', title: '大概齐', subtitle: '～くらい/ぐらい', duration: '4m', initialPrompt: '讲解 くらい/ぐらい (程度/概数)。' },
  { id: 'n5-63', category: 'N5语法', title: '等等', subtitle: '～など', duration: '4m', initialPrompt: '讲解 など (举例的省略)。' },
  { id: 'n5-64', category: 'N5语法', title: '虽然...但是...', subtitle: 'が (接续助词)', duration: '5m', initialPrompt: '讲解 が 作为接续助词表示转折（但是）。' },
  { id: 'n5-65', category: 'N5语法', title: '即使...也...', subtitle: 'ても/でも', duration: '5m', initialPrompt: '讲解 ても/でも (逆接条件)。' },
  { id: 'n5-66', category: 'N5语法', title: '不过...', subtitle: 'けれども/けど/けれど', duration: '5m', initialPrompt: '讲解口语中常用的转折 けれども。' },
  { id: 'n5-67', category: 'N5语法', title: '然而', subtitle: 'しかし', duration: '4m', initialPrompt: '讲解接续词 しかし (但是)。' },
  { id: 'n5-68', category: 'N5语法', title: '因为所以(1)', subtitle: '～から', duration: '5m', initialPrompt: '讲解接续助词 から 表示主观原因。' },
  { id: 'n5-69', category: 'N5语法', title: '因为所以(2)', subtitle: '～ので', duration: '5m', initialPrompt: '讲解接续助词 ので 表示客观原因。' },
  { id: 'n5-70', category: 'N5语法', title: '因为(轻微)', subtitle: 'て/で', duration: '5m', initialPrompt: '讲解 て/で 表示轻微的原因。' },
  { id: 'n5-71', category: 'N5语法', title: '一边...一边...', subtitle: '～ながら', duration: '5m', initialPrompt: '讲解 ながら 表示同时进行的动作。' },
  { id: 'n5-72', category: 'N5语法', title: '而且', subtitle: 'それに', duration: '4m', initialPrompt: '讲解接续词 それに (累加)。' },
  { id: 'n5-73', category: 'N5语法', title: '还是...', subtitle: 'それとも', duration: '4m', initialPrompt: '讲解接续词 それとも (选择疑问)。' },
  { id: 'n5-74', category: 'N5语法', title: '然后', subtitle: 'それから', duration: '4m', initialPrompt: '讲解接续词 それから (追加/顺序)。' },
  { id: 'n5-75', category: 'N5语法', title: '话说回来', subtitle: 'ところで', duration: '4m', initialPrompt: '讲解接续词 ところで (转换话题)。' },
  { id: 'n5-76', category: 'N5语法', title: '因此', subtitle: 'それで', duration: '4m', initialPrompt: '讲解接续词 それで (顺理成章的结论)。' },
  { id: 'n5-77', category: 'N5语法', title: '吗？', subtitle: 'か', duration: '3m', initialPrompt: '讲解终助词 か (疑问/反问)。' },
  { id: 'n5-78', category: 'N5语法', title: '是吧？', subtitle: 'ね', duration: '3m', initialPrompt: '讲解终助词 ね (确认/共鸣)。' },
  { id: 'n5-79', category: 'N5语法', title: '哟！', subtitle: 'よ', duration: '3m', initialPrompt: '讲解终助词 よ (告知/提醒)。' },
  { id: 'n5-80', category: 'N5语法', title: '女性语气', subtitle: 'わ', duration: '3m', initialPrompt: '讲解终助词 わ (女性柔和语气)。' },
  { id: 'n5-81', category: 'N5语法', title: '自言自语', subtitle: 'かな/かしら', duration: '4m', initialPrompt: '讲解终助词 かな (疑惑/自问)。' },
  { id: 'n5-82', category: 'N5语法', title: '过了/之前', subtitle: '时间+すぎ/まえ', duration: '4m', initialPrompt: '讲解时间的表达：过几分/差几分。' },
  { id: 'n5-83', category: 'N5语法', title: '我们/各位', subtitle: '～たち/がた', duration: '4m', initialPrompt: '讲解复数后缀 たち 和 がた (敬语)。' },
  { id: 'n5-84', category: 'N5语法', title: '全/中', subtitle: '～中 (ちゅう/じゅう)', duration: '5m', initialPrompt: '讲解后缀 中 的读音和用法 (正在做/全范围)。' },
  { id: 'n5-85', category: 'N5语法', title: '哪里人', subtitle: '～人 (にん/じん/り)', duration: '5m', initialPrompt: '讲解 人的不同读音用法。' },
  { id: 'n5-86', category: 'N5语法', title: '每样一个', subtitle: '～ずつ', duration: '4m', initialPrompt: '讲解后缀 ずつ (分配/平均)。' },
  { id: 'n5-87', category: 'N5语法', title: '超级', subtitle: 'とても', duration: '4m', initialPrompt: '讲解程度副词 とても。' },
  { id: 'n5-88', category: 'N5语法', title: '不太...', subtitle: 'あまり', duration: '4m', initialPrompt: '讲解副词 あまり (后接否定)。' },
  { id: 'n5-89', category: 'N5语法', title: '一点点', subtitle: '少し (すこし)', duration: '4m', initialPrompt: '讲解副词 少し。' },
  { id: 'n5-90', category: 'N5语法', title: '完全不', subtitle: 'ぜんぜん', duration: '4m', initialPrompt: '讲解副词 ぜんぜん (后接否定，现代口语也可接肯定)。' },
  { id: 'n5-91', category: 'N5语法', title: '几乎', subtitle: 'ほとんど', duration: '4m', initialPrompt: '讲解副词 ほとんど。' },
  { id: 'n5-92', category: 'N5语法', title: '总是', subtitle: 'いつも', duration: '4m', initialPrompt: '讲解频度副词 いつも。' },
  { id: 'n5-93', category: 'N5语法', title: '请', subtitle: 'どうぞ', duration: '3m', initialPrompt: '讲解 どうぞ 的用法。' },
  { id: 'n5-94', category: 'N5语法', title: '终于', subtitle: 'やっと', duration: '4m', initialPrompt: '讲解副词 やっと。' },
  { id: 'n5-95', category: 'N5语法', title: '务必', subtitle: 'ぜひ', duration: '4m', initialPrompt: '讲解副词 ぜひ。' },
  { id: 'n5-96', category: 'N5语法', title: '差不多该...', subtitle: 'そろそろ', duration: '4m', initialPrompt: '讲解副词 そろそろ (告辞常用)。' },
  { id: 'n5-97', category: 'N5语法', title: '请给我', subtitle: '～をください', duration: '4m', initialPrompt: '讲解购物或索要物品时的 をください。' },
  { id: 'n5-98', category: 'N5语法', title: '请做/请别做', subtitle: '～てください/ないでください', duration: '6m', initialPrompt: '讲解请求动作和禁止动作的表达。' },
  { id: 'n5-99', category: 'N5语法', title: '能帮我吗', subtitle: '～てくださいませんか/ないでくださいませんか', duration: '6m', initialPrompt: '讲解更礼貌的请求表达。' },
  { id: 'n5-100', category: 'N5语法', title: '约吗？', subtitle: '～ませんか', duration: '5m', initialPrompt: '讲解 ませんか (邀请/提议)。' },
  { id: 'n5-101', category: 'N5语法', title: '要我帮你吗', subtitle: '～ましょうか', duration: '5m', initialPrompt: '讲解 ましょうか (提议/主动提供帮助)。' },
  { id: 'n5-102', category: 'N5语法', title: '吧！', subtitle: '～ましょう', duration: '5m', initialPrompt: '讲解 ましょう (意志/劝诱)。' },
  { id: 'n5-103', category: 'N5语法', title: '我想我想我想', subtitle: '～たい', duration: '5m', initialPrompt: '讲解 たい (第一人称的愿望)。' },
  { id: 'n5-104', category: 'N5语法', title: '我不想要', subtitle: '～がほしい', duration: '5m', initialPrompt: '讲解 がほしい (想要某物)。' },
  { id: 'n5-105', category: 'N5语法', title: '也许是吧', subtitle: '～だろう/でしょう', duration: '5m', initialPrompt: '讲解推测表达 だろう/でしょう。' },
  { id: 'n5-106', category: 'N5语法', title: '我要选这个', subtitle: '～にする/くする', duration: '6m', initialPrompt: '讲解 人为改变状态/决定 (にする)。' },
  { id: 'n5-107', category: 'N5语法', title: '天黑了', subtitle: '～になる/くなる', duration: '6m', initialPrompt: '讲解 自然变化 (になる)。' },
  { id: 'n5-108', category: 'N5语法', title: '正在做', subtitle: '～ている', duration: '6m', initialPrompt: '讲解 ている 的两个核心含义：正在进行、状态持续。' },
  { id: 'n5-109', category: 'N5语法', title: '贴着画', subtitle: '～てある', duration: '6m', initialPrompt: '讲解 てある (人为结果的存续)。' },
  { id: 'n5-110', category: 'N5语法', title: '已经', subtitle: 'もう～', duration: '4m', initialPrompt: '讲解 もう (已经)。' },
  { id: 'n5-111', category: 'N5语法', title: '还没', subtitle: 'まだ～', duration: '4m', initialPrompt: '讲解 まだ (尚未/仍然)。' },
  { id: 'n5-112', category: 'N5语法', title: '那个更好', subtitle: '～ほうが～', duration: '5m', initialPrompt: '讲解 ほうが (比较/建议)。' },
  { id: 'n5-113', category: 'N5语法', title: '...之前', subtitle: '～前に', duration: '4m', initialPrompt: '讲解动作发生之前 まえに。' },
  { id: 'n5-114', category: 'N5语法', title: '...的时候', subtitle: '～とき', duration: '5m', initialPrompt: '讲解 时间状语从句 とき。' },
  { id: 'n5-115', category: 'N5语法', title: '万一...', subtitle: '場合 (ばあい)', duration: '5m', initialPrompt: '讲解 假设情况 ばあい。' },
  { id: 'n5-116', category: 'N5语法', title: '做完A再做B', subtitle: '～てから', duration: '5m', initialPrompt: '讲解 动作顺序 てから。' },
  { id: 'n5-117', category: 'N5语法', title: '...之后', subtitle: '～あとで', duration: '5m', initialPrompt: '讲解 动作之后 あとで。' },
  { id: 'n5-118', category: 'N5语法', title: '除此之外', subtitle: '～ほかに(は)', duration: '4m', initialPrompt: '讲解 ほかに。' },
  { id: 'n5-119', category: 'N5语法', title: '哪个更...', subtitle: '～と～とどちらが～か', duration: '6m', initialPrompt: '讲解 两者比较的句型。' },
  { id: 'n5-120', category: 'N5语法', title: '世界第一', subtitle: '～で～がいちばん～', duration: '6m', initialPrompt: '讲解 最高级比较句型。' },
];

export const PREDEFINED_LESSONS = lessons;

export const DEFAULT_SUGGESTIONS = [
  { label: '举个例子 🌰', value: '请给我举一个简单的例子。' },
  { label: '原来如此 😮', value: '原来是这样，我明白了。' },
  { label: '太难了 😭', value: '这有点难理解，能换个说法吗？' },
  { label: '继续继续 👋', value: '继续讲下去吧！' }
];

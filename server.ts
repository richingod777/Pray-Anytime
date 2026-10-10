import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Curated backup scripture database with full multilingual translations (中文、英文、德文、西班牙文、日文、韓文)
const BACKUP_VERSES = {
  '每日靈糧': [
    {
      verseZh: '應當一無挂慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。',
      referenceZh: '腓立比書 4:6-7',
      verseEn: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      referenceEn: 'Philippians 4:6-7',
      verseDe: 'Sorgt euch um nichts, sondern in allen Dingen lasst eure Bitten in Gebet und Flehen mit Danksagung vor Gott kundwerden! Und der Friede Gottes, der höher ist als alle Vernunft, bewahre eure Herzen und Sinne in Christus Jesus.',
      referenceDe: 'Philipper 4:6-7',
      verseEs: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
      referenceEs: 'Filipenses 4:6-7',
      verseJa: '何事も思い煩ってはならない。ただ、事ごとに祈りと願いをささげ、感謝をもってあなたがたの求めを神に申し上げなさい。',
      referenceJa: 'ピリピ人への手紙 4:6',
      verseKo: '아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라.',
      referenceKo: '빌립보서 4:6',
      prayer: '親愛的天父，當我的心思慌亂、不知道該怎麼辦時，我選擇停下所有盲目的憂慮，單單來到祢施恩座前。我將心中的重擔與困惑完全交在祢手中，求祢用那出人意外的平安親自護衛我的心懷意念。祢是掌權的主，祢的信實永不改變，求祢為我指引前面的每一步路。奉主耶穌基督得勝的名禱告，阿們！',
      reflection: '每日靈糧：今天不管面對何等波浪，只要跪下禱告，神必親自作我們的避風港。'
    },
    {
      verseZh: '我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全。',
      referenceZh: '哥林多後書 12:9',
      verseEn: 'My grace is sufficient for you, for my power is made perfect in weakness.',
      referenceEn: '2 Corinthians 12:9',
      verseDe: 'Lass dir an meiner Gnade genügen; denn meine Kraft vollendet sich in der Schwachheit.',
      referenceDe: '2. Korinther 12:9',
      verseEs: 'Bástate mi gracia; porque mi poder se perfecciona en la debilidad.',
      referenceEs: '2 Corintios 12:9',
      verseJa: 'わたしの恵みはあなたに十分である。わたしの力は弱さのうちに完全に現れるからである。',
      referenceJa: 'コリント人への手紙第二 12:9',
      verseKo: '내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이라.',
      referenceKo: '고린도후서 12:9',
      prayer: '主耶穌，在我的能力到了盡頭、感到軟弱無助的時刻，我知道正是祢榮耀大能彰顯的開始。我不求虛假的安全感，我單單抓住祢的話語——祢的恩典必定夠我用的！求祢的靈親自覆庇我，挪去我內心的焦慮與懼怕，賜給我剛強仁愛謹守的心，使我在軟弱中經歷祢無比的托住與更新。奉主耶穌基督的聖名禱告，阿們！',
      reflection: '每日靈糧：不是我們自己能做什麼，而是主的恩典在軟弱中更加顯明。'
    },
    {
      verseZh: '你出你入，耶和華要保護你，從今時直到永遠。',
      referenceZh: '詩篇 121:8',
      verseEn: 'The Lord will watch over your coming and going both now and forevermore.',
      referenceEn: 'Psalm 121:8',
      verseDe: 'Der Herr behüte deinen Ausgang und Eingang von nun an bis in Ewigkeit.',
      referenceDe: 'Psalm 121:8',
      verseEs: 'Jehová guardará tu salida y tu entrada desde ahora y para siempre.',
      referenceEs: 'Salmos 121:8',
      verseJa: '主はあなたを行くにも帰るにも守られる、今よりとこしえに至るまで。',
      referenceJa: '詩篇 121:8',
      verseKo: '여호와께서 너의 출입을 지금부터 영원까지 지키시리로다.',
      referenceKo: '시편 121:8',
      prayer: '萬軍之耶和華，創造天地的父神，當我站在人生的十字路口不知何去何從時，我舉目仰望祢。祢是保護我的主，白日太陽必不傷我，夜間月亮必不害我。我將今天所有的出入、決策與腳步全交託給祢，深信祢的眼目從未離開我，祢的恩惠與慈愛必一生緊緊隨著我。求祢引領我行在光明中。奉主耶穌基督的名禱告，阿們！',
      reflection: '每日靈糧：無論我們走到哪裡，天父的雙眼都從未離開愛祂的兒女。'
    }
  ],
  '荒漠甘泉': [
    {
      verseZh: '耶和華是我的牧者，我必不致缺乏。祂使我躺臥在青草地上，領我在可安歇的水邊。',
      referenceZh: '詩篇 23:1-2',
      verseEn: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.',
      referenceEn: 'Psalm 23:1-2',
      verseDe: 'Der Herr ist mein Hirte, mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser.',
      referenceDe: 'Psalm 23:1-2',
      verseEs: 'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.',
      referenceEs: 'Salmos 23:1-2',
      verseJa: '主はわが牧者であって、わたしには乏しいことがない。主はわたしを緑の野に伏させ、いこいの水ぎわに伴われる。',
      referenceJa: '詩篇 23:1-2',
      verseKo: '여호와는 나의 목자시니 내게 부족함이 없으리로다 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다.',
      referenceKo: '시편 23:1-2',
      prayer: '耶穌，祢是我生命永遠的大牧者。當世界喧囂雜亂、前路看似曠野絕壁時，我選擇安靜在祢腳前。祢必使我躺臥在青草地上，領我到可安歇的水邊。求祢親自平息我心中的驚濤駭浪，使我的靈魂重新甦醒，得著屬天的飽足與安息。我堅信在祢裡面我一無所缺，因祢與我同在就是最大的力量！奉主耶穌基督的名禱告，阿們！',
      reflection: '荒漠甘泉：在最乾涸的曠野裡，信心的眼睛看見甘泉；在最深的黑夜中，等候天亮的光芒。'
    },
    {
      verseZh: '但那等候耶和華的必從新得力。他們必如鷹展翅上騰；他們奔跑卻不困倦，行走卻不疲乏。',
      referenceZh: '以賽亞書 40:31',
      verseEn: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      referenceEn: 'Isaiah 40:31',
      verseDe: 'Die auf den Herrn harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler, dass sie laufen und nicht matt werden, dass sie wandeln und nicht müde werden.',
      referenceDe: 'Jesaja 40:31',
      verseEs: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
      referenceEs: 'Isaías 40:31',
      verseJa: '主を待ち望む者は新たな力を得、鷲のように翼をかって上ることができる。走っても倦むことなく、歩いても疲れることはない。',
      referenceJa: 'イザヤ書 40:31',
      verseKo: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요.',
      referenceKo: '이사야 40:31',
      prayer: '主啊，我承認自己的疲乏與軟弱，但祢的話語應許：凡等候耶和華的，必從新得力！今天我不再憑藉自己的聰明與血氣硬撐，我單單安靜等候在祢面前。求聖靈的大風吹起，托住我的生命，使我如鷹展翅上騰，越過環境的狂風暴雨。在祢的同在裡，奔跑不困倦，行走不疲乏！奉主耶穌基督的聖名禱告，阿們！',
      reflection: '荒漠甘泉：狂風是鷹的僕役，風暴愈大，鷹愈能飛往更高清朗的晴空。'
    },
    {
      verseZh: '壓傷的蘆葦，祂不折斷；將殘的燈火，祂不吹滅。',
      referenceZh: '以賽亞書 42:3',
      verseEn: 'A bruised reed he will not break, and a smoldering wick he will not snuff out.',
      referenceEn: 'Isaiah 42:3',
      verseDe: 'Das geknickte Rohr wird er nicht zerbrechen, und den glimmenden Docht wird er nicht auslöschen.',
      referenceDe: 'Jesaja 42:3',
      verseEs: 'No quebrará la caña cascada, ni apagará el pábilo que humeare.',
      referenceEs: 'Isaías 42:3',
      verseJa: '傷ついた葦を折ることなく、ほの暗い灯心を消すことなく、真実をもって公道をもたらす。',
      referenceJa: 'イザヤ書 42:3',
      verseKo: '상한 갈대를 꺾지 아니하며 꺼져가는 등불을 끄지 아니하고.',
      referenceKo: '이사야 42:3',
      prayer: '恩典憐憫的主，即使世界將我壓傷、環境如同狂風要吹滅我微弱的希望，祢卻絕不折斷，也絕不吹滅。祢深知我的極限與眼淚，求祢用釘痕手撫平我心裡的創傷，在廢墟中重新點燃我信心的火焰。我把自己完全交在祢慈愛的懷抱中，宣告祢的拯救與慈愛永不落空！奉主耶穌基督的名禱告，阿們！',
      reflection: '荒漠甘泉：神在最破碎的器皿上，施展最深切的憐憫與重建。'
    }
  ],
  '聖經': [
    {
      verseZh: '神是我們的避難所，是我們的力量，是我們在患難中隨時的幫助。',
      referenceZh: '詩篇 46:1',
      verseEn: 'God is our refuge and strength, an ever-present help in trouble.',
      referenceEn: 'Psalm 46:1',
      verseDe: 'Gott ist unsre Zuversicht und Stärke, eine Hilfe in den großen Nöten, die uns getroffen haben.',
      referenceDe: 'Psalm 46:2',
      verseEs: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
      referenceEs: 'Salmos 46:1',
      verseJa: '神はわれらの避け所、また力。苦しむとき、そこにある強き助け。',
      referenceJa: '詩篇 46:1',
      verseKo: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라.',
      referenceKo: '시편 46:1',
      prayer: '全能的神，當地動山搖、環境翻覆、我不知道該怎麼辦的時候，祢是我永遠的避難所，是我隨時的盾牌與力量！我拒絕被眼前的困難與恐懼所吞噬，我定意先來向祢呼求。求祢親自立在我和仇敵之間，作我堅固的營壘，將屬天的勇氣與從容賜給我，引導我在風暴中站立得穩。奉耶穌基督得勝的聖名禱告，阿們！',
      reflection: '聖經金句：狂風大作之時，投靠耶和華的人便安然居住。'
    },
    {
      verseZh: '我留下平安給你們；我將我的平安賜給你們。我所賜的，不像世人所賜的。你們心裡不要憂愁，也不要膽怯。',
      referenceZh: '約翰福音 14:27',
      verseEn: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
      referenceEn: 'John 14:27',
      verseDe: 'Den Frieden lasse ich euch, meinen Frieden gebe ich euch. Nicht gebe ich euch, wie die Welt gibt. Euer Herz erschrecke nicht und fürchte sich nicht.',
      referenceDe: 'Johannes 14:27',
      verseEs: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
      referenceEs: 'Juan 14:27',
      verseJa: 'わたしは平安をあなたがたに残して行く。わたしの平安をあなたがたに与える。あなたがたは心を騒がせるな、またおじけるな。',
      referenceJa: 'ヨハネによる福音書 14:27',
      verseKo: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것과 같지 아니하니라.',
      referenceKo: '요한복음 14:27',
      prayer: '和平的君主耶穌，世界能給的只是短暫的刺激，但祢所賜下的，是穿透風暴的真正平安。當憂慮重重壓在我的心頭時，祢對我說：心裡不要憂愁，也不要膽怯！我現在就把一切的疑惑與害怕交在祢手中，求祢的平安如江河湧流在我心中，保守我的心思意念，使我深知祢掌權到底。奉主耶穌基督的名禱告，阿們！',
      reflection: '聖經金句：在任何境遇中，主同在的平安是我們隨時的確據與盾牌。'
    },
    {
      verseZh: '你要專心仰賴耶和華，不可倚靠自己的聰明，在你一切所行的事上都要認定祂，祂必指引你的路。',
      referenceZh: '箴言 3:5-6',
      verseEn: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
      referenceEn: 'Proverbs 3:5-6',
      verseDe: 'Verlass dich auf den Herrn von ganzem Herzen, und verlass dich nicht auf deinen Verstand; gedenke an ihn in allen deinen Wegen, so wird er dich recht führen.',
      referenceDe: 'Sprüche 3:5-6',
      verseEs: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
      referenceEs: 'Proverbios 3:5-6',
      verseJa: '心をつくして主に信頼せよ、自分の知識にたよってはならない。すべての道で主を認めよ、そうすれば主はあなたの道をまっすぐにされる。',
      referenceJa: '箴言 3:5-6',
      verseKo: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라.',
      referenceKo: '잠언 3:5-6',
      prayer: '親愛的主，我的眼光有限、智慧有限，當我不知道該怎麼辦時，我選擇不再靠自己的小聰明瞎猜。我在此刻立志專心仰賴祢，在我一切所行的事上都尊祢為主、認定祢的帶領。求祢親自指引我的方向，修平我前面的每一步道路，挪開所有攔阻，使我在祢的旨意中平安前行。奉主耶穌基督寶貴的聖名禱告，阿們！',
      reflection: '聖經金句：當我們交出主權，神就會為我們修平前方的每一步道路。'
    }
  ],
  'THE BIBLE': [
    {
      verseZh: '應當一無挂慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。',
      referenceZh: '腓立比書 4:6-7',
      verseEn: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      referenceEn: 'Philippians 4:6-7',
      verseDe: 'Sorgt euch um nichts, sondern in allen Dingen lasst eure Bitten in Gebet und Flehen mit Danksagung vor Gott kundwerden!',
      referenceDe: 'Philipper 4:6',
      verseEs: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
      referenceEs: 'Filipenses 4:6',
      verseJa: '何事も思い煩ってはならない。ただ、事ごとに祈りと願いをささげ、感謝をもってあなたがたの求めを神に申し上げなさい。',
      referenceJa: 'ピリピ人への手紙 4:6',
      verseKo: '아무 것도 염려하지 말고 오직 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라.',
      referenceKo: '빌립보서 4:6',
      prayer: '親愛的天父，當我不知道該怎麼辦的時候，我選擇先來到祢施恩座前禱告。我將心中的焦慮、重擔與不確定全然交託在祢大能的手中。求祢用那超越一切理解的平安親自保守我的心懷意念，指引我的腳步，賜我剛強前行的勇氣與信心。奉主耶穌基督得勝的名禱告，阿們！',
      reflection: 'THE BIBLE: True peace does not come from the absence of trouble, but from the presence of God.'
    },
    {
      verseZh: '我靠著那加給我力量的，凡事都能做。',
      referenceZh: '腓立比書 4:13',
      verseEn: 'I can do all this through him who gives me strength.',
      referenceEn: 'Philippians 4:13',
      verseDe: 'Ich vermag alles durch den, der mich mächtig macht, Christus.',
      referenceDe: 'Philipper 4:13',
      verseEs: 'Todo lo puedo en Cristo que me fortalece.',
      referenceEs: 'Filipenses 4:13',
      verseJa: 'わたしを強くして下さるかたによって、わたしはどんなことでもすることができる。',
      referenceJa: 'ピリピ人への手紙 4:13',
      verseKo: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라.',
      referenceKo: '빌립보서 4:13',
      prayer: '主耶穌，當我的力量耗盡、面對挑戰感到無力與猶豫時，我緊緊抓住祢的應許。祢是我生命的源頭，我的得勝在於祢。我宣告今天靠著那加給我力量的基督，凡事都能做！求祢加添我信心，挪去所有膽怯，帶領我迎向挑戰、活出得勝有餘的生命。奉主耶穌基督的聖名禱告，阿們！',
      reflection: 'THE BIBLE: In weakness and strength alike, Christ is our ever-present sufficiency.'
    }
  ]
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route: Search scripture with Google Search Grounding & Multilingual Support (中、英、德、西、日、韓)
  app.post('/api/scriptures/search', async (req, res) => {
    const { source = '聖經', seed = 0 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const targetSource = ['每日靈糧', '荒漠甘泉', '聖經', 'THE BIBLE'].includes(source)
      ? source
      : '聖經';

    const fallbackList = BACKUP_VERSES[targetSource as keyof typeof BACKUP_VERSES] || BACKUP_VERSES['聖經'];
    const fallbackItem = fallbackList[Math.abs(seed) % fallbackList.length];

    const packageResult = (item: any, isFallback: boolean, groundingSources: any[] = []) => {
      return {
        success: true,
        isFallback,
        source: targetSource,
        verse: item.verseZh || item.verse,
        reference: item.referenceZh || item.reference,
        verseZh: item.verseZh || item.verse,
        referenceZh: item.referenceZh || item.reference,
        verseEn: item.verseEn,
        referenceEn: item.referenceEn,
        translations: {
          en: {
            label: '英文 (English NIV/ESV)',
            verse: item.verseEn,
            reference: item.referenceEn,
          },
          de: {
            label: '德文 (Deutsch Luther)',
            verse: item.verseDe || item.verseEn,
            reference: item.referenceDe || item.referenceEn,
          },
          es: {
            label: '西班牙文 (Español RVR)',
            verse: item.verseEs || item.verseEn,
            reference: item.referenceEs || item.referenceEn,
          },
          ja: {
            label: '日文 (日本語)',
            verse: item.verseJa || item.verseEn,
            reference: item.referenceJa || item.referenceEn,
          },
          ko: {
            label: '韓文 (한국어)',
            verse: item.verseKo || item.verseEn,
            reference: item.referenceKo || item.referenceEn,
          },
        },
        prayer: item.prayer,
        reflection: item.reflection,
        groundingSources,
        message: isFallback ? '目前使用精選內建靈修多語對照金句。' : undefined,
      };
    };

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, serving curated multilingual backup scripture.');
      return res.json(packageResult(fallbackItem, true));
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let promptInstruction = '';
      if (targetSource === '每日靈糧') {
        promptInstruction = `請利用 Google 搜尋「每日靈糧 (Our Daily Bread)」近期靈修文章或金句，精選一句最具撫慰人心、充滿平安信心的聖經經文。
請同時提供繁體中文和合本經文，以及標準英文版 (NIV/ESV)、德文版 (Deutsch)、西班牙文版 (Español)、日文和韓文版本。`;
      } else if (targetSource === '荒漠甘泉') {
        promptInstruction = `請利用 Google 搜尋「荒漠甘泉 (Streams in the Desert) 考門夫人」經典靈修日誌，精選一句關於在患難中得安慰、安靜等候神的聖經金句。
請同時提供繁體中文和合本經文與出處，以及標準英文版 (NIV/ESV)、德文版 (Deutsch)、西班牙文版 (Español)、日文和韓文版本。`;
      } else if (targetSource === '聖經') {
        promptInstruction = `請利用 Google 搜尋繁體中文聖經和合本中，關於平安、力量、安慰或指引的經典金句（隨機選出不同書卷章節）。
請同時提供繁體中文經文、標準英文版 (NIV/ESV)、德文版 (Deutsch Luther)、西班牙文版 (Español RVR)、日文和韓文版本。`;
      } else {
        promptInstruction = `Search for an inspiring, uplifting Bible verse in English (NIV, ESV), focusing on peace, trust, or love.
Provide Traditional Chinese translation, English verse, German translation (Deutsch), Spanish translation (Español), Japanese translation, and Korean translation.`;
      }

      const prompt = `${promptInstruction}
請嚴格以乾淨的 JSON 格式回傳，格式如下：
{
  "verseZh": "繁體中文經文內容（和合本，不含多餘引號）",
  "referenceZh": "繁體中文出處書卷章節（例如：約翰福音 14:27）",
  "verseEn": "English Bible verse (NIV or ESV)",
  "referenceEn": "English Scripture reference (e.g., John 14:27)",
  "verseDe": "Deutsche Bibelstelle (z.B. Lutherbibel)",
  "referenceDe": "Deutsche Bibelstellenangabe (z.B. Johannes 14:27)",
  "verseEs": "Versículo bíblico en español (Reina-Valera)",
  "referenceEs": "Referencia bíblica en español (ej. Juan 14:27)",
  "verseJa": "日文聖書經文",
  "referenceJa": "日文出處",
  "verseKo": "韓文聖經經文",
  "referenceKo": "韓文出處",
  "prayer": "同心禱告文（繁體中文，約70-110字。屬靈直白、簡潔有力、充滿信心交託與平安力量，直面「不知道該怎麼辦」時的心靈呼求，宣告神的應許，以奉主耶穌的名禱告/阿們結尾）",
  "reflection": "簡短靈修默想（繁體中文，35字內）"
}
請不要在 JSON 外附加任何問候或額外解說文字。`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = geminiResponse.text || '';

      const chunks = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingSources: { title: string; uri: string }[] = [];
      for (const chunk of chunks) {
        if (chunk.web && chunk.web.uri) {
          groundingSources.push({
            title: chunk.web.title || '搜尋參考來源',
            uri: chunk.web.uri,
          });
        }
      }

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      const parsed = JSON.parse(cleaned);

      if (!parsed.verseZh || !parsed.referenceZh) {
        throw new Error('Gemini response missing required bilingual fields');
      }

      return res.json(packageResult({
        verseZh: parsed.verseZh.trim(),
        referenceZh: parsed.referenceZh.trim(),
        verseEn: parsed.verseEn ? parsed.verseEn.trim() : fallbackItem.verseEn,
        referenceEn: parsed.referenceEn ? parsed.referenceEn.trim() : fallbackItem.referenceEn,
        verseDe: parsed.verseDe ? parsed.verseDe.trim() : fallbackItem.verseDe,
        referenceDe: parsed.referenceDe ? parsed.referenceDe.trim() : fallbackItem.referenceDe,
        verseEs: parsed.verseEs ? parsed.verseEs.trim() : fallbackItem.verseEs,
        referenceEs: parsed.referenceEs ? parsed.referenceEs.trim() : fallbackItem.referenceEs,
        verseJa: parsed.verseJa ? parsed.verseJa.trim() : fallbackItem.verseJa,
        referenceJa: parsed.referenceJa ? parsed.referenceJa.trim() : fallbackItem.referenceJa,
        verseKo: parsed.verseKo ? parsed.verseKo.trim() : fallbackItem.verseKo,
        referenceKo: parsed.referenceKo ? parsed.referenceKo.trim() : fallbackItem.referenceKo,
        prayer: parsed.prayer ? parsed.prayer.trim() : fallbackItem.prayer,
        reflection: parsed.reflection ? parsed.reflection.trim() : fallbackItem.reflection,
      }, false, groundingSources.slice(0, 3)));

    } catch (err: any) {
      console.error('Gemini Search Grounding error:', err?.message || err);
      return res.json(packageResult(fallbackItem, true));
    }
  });

  // API Route: 真人溫暖親切發音 (Gemini 3.8 Flash Lite TTS - 多國語言支援)
  app.post('/api/voice/speak', async (req, res) => {
    const { text, voiceName = 'Kore', language = 'zh' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!apiKey) {
      return res.json({
        fallback: true,
        message: 'GEMINI_API_KEY 未設定，將由瀏覽器內建語音朗讀。',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // 為各語言專門調校溫暖親切的基督徒靈修朗讀風格
      let styleDescription = '溫暖、親切、柔和平靜的基督徒靈修朗讀聲音，語調真摯慈祥，充滿平安與安慰感';
      if (language === 'de') {
        styleDescription = 'Warme, sanfte, herzliche und andächtige christliche Lesestimme mit ruhigem, tröstendem Tonfall';
      } else if (language === 'es') {
        styleDescription = 'Voz de devoción cristiana cálida, apacible, cercana y llena de paz, con tono sereno y reconfortante';
      } else if (language === 'en') {
        styleDescription = 'Warm, gentle, soothing, and reverent Christian devotional narration with a friendly, peaceful tone';
      } else if (language === 'ja') {
        styleDescription = '温かく穏やかで親しみやすい、平安に満ちた祈りの朗読音声';
      } else if (language === 'ko') {
        styleDescription = '따뜻하고 다정하며 평안이 넘치는 경건한 기도 낭독 음성';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 350),
                speechMetadata: {
                  style: styleDescription,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error('TTS did not return audio data');
      }

      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });

    } catch (err: any) {
      console.error('Gemini TTS error:', err?.message || err);
      return res.json({
        fallback: true,
        message: 'TTS 服務繁忙，切換為本機溫暖朗讀。',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: '隨時禱告 PRAY ANYTIME' });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Always Near 隨禱] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});

/* ========================================
   カプる。 - メインアプリケーション
   ======================================== */

const MONTH_LABELS = {
  "2026-01": "1月",
  "2026-02": "2月",
  "2026-03": "3月",
  "2026-04": "4月",
  "2026-05": "5月",
  "2026-06": "6月",
};

const MONTH_LABELS_LONG = {
  "2026-01": "2026年 1月",
  "2026-02": "2026年 2月",
  "2026-03": "2026年 3月",
  "2026-04": "2026年 4月",
  "2026-05": "2026年 5月",
  "2026-06": "2026年 6月",
};

function getProductImage(item) {
  if (!item) return "images/placeholder_character.svg";
  if (item.image) return item.image;
  return typeof getPlaceholderForGenre === "function" ? getPlaceholderForGenre(item.genre) : "images/placeholder_character.svg";
}

const state = {
  selectedMonth: null,
  selectedGenre: null,
  selectedPrice: null,
  selectedMaker: null,
  searchQuery: "",
  sortBy: "month-asc",
};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof ensureDemoRanking === "function") ensureDemoRanking();
  renderStats();
  renderFilters();
  renderCards();
  setupScrollTop();
  setupSortSelect();
  setupFilterModal();
  setupSearch();
  setupFilterClear();
  setupHeartButtons();
});

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    const overlay = document.getElementById("gachaLoading");
    if (overlay) overlay.classList.remove("active");
    gachaNavigating = false;
  }
});


// ── Stats ── (search page)
function renderStats() {
  var el = document.getElementById("searchStats");
  if (!el) return;
  var thisMonth = GACHA_DATA.filter(function(g) { return g.releaseMonth === "2026-03"; }).length;
  el.innerHTML =
    '<span class="page-stat"><strong>' + GACHA_DATA.length + '</strong>件</span>' +
    '<span class="page-stat">今月 <strong>' + thisMonth + '</strong>件</span>' +
    '<span class="page-stat"><strong>' + MAKERS.length + '</strong>メーカー</span>';
}

// ── Home Curation (Curator Shelf + Article Cards) ──
function renderHomeCuration() {
  var container = document.getElementById('curationContainer');
  if (!container) return;

  var curators = getCuratorData();
  var articles = getArticleData();

  var curatorShelf = '<div class="curator-shelf">' + curators.map(function(c) {
    return '<a href="curator.html?id=' + c.id + '" class="curator-bubble">' +
      '<div class="curator-avatar-ring" style="--ring-color:' + c.color + '">' +
        '<img src="' + c.avatar + '" alt="' + c.name + '" class="curator-avatar-img">' +
      '</div>' +
      '<span class="curator-bubble-name">' + c.name + '</span>' +
      '<span class="curator-bubble-role">' + c.role.split('・')[0] + '</span>' +
    '</a>';
  }).join('') + '</div>';

  var articleGrid = '<div class="article-card-grid">' + articles.map(function(a) {
    var coverItem = GACHA_DATA.find(function(g) { return g.id === a.coverProductId; });
    var coverImg = coverItem ? getProductImage(coverItem) : 'images/placeholder_character.svg';
    var coverFallback = coverItem ? getPlaceholderForGenre(coverItem.genre) : 'images/placeholder_character.svg';
    var curator = curators.find(function(c) { return c.id === a.curatorId; });
    var curatorBadge = curator
      ? '<div class="article-card-curator">' +
          '<img src="' + curator.avatar + '" alt="" class="article-card-curator-img">' +
          '<span>' + curator.name + '</span>' +
        '</div>'
      : '';
    return '<a href="article.html?id=' + a.id + '" class="article-card">' +
      '<div class="article-card-cover">' +
        '<img src="' + coverImg + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + coverFallback + '\'">' +
        '<span class="article-card-tag">' + a.tag + '</span>' +
      '</div>' +
      '<div class="article-card-body">' +
        '<h3 class="article-card-title">' + a.title + '</h3>' +
        curatorBadge +
      '</div>' +
    '</a>';
  }).join('') + '</div>';

  container.innerHTML = curatorShelf + articleGrid;
}

function getCuratorData() {
  return [
    {
      id: 'yagi',
      name: '八木',
      avatar: 'images/yagi-profile.png',
      color: '#F58520',
      role: 'ネタ枠・コスパ・光りもの担当',
      bio: 'ガチャの棚で「なぜ作った？」と声が出るものに吸い寄せられる。実用性は二の次。面白さとコスパの天秤を楽しむのが流儀。深夜に光るガチャを集めて並べるのが趣味。',
      favoriteGenres: ['おもしろ', 'コスパ', '光る'],
      articleIds: ['omoshiro-3', 'light-up', 'budget-picks'],
    },
    {
      id: 'asakawa',
      name: '浅川',
      avatar: 'images/asakawa-profile.png',
      color: '#3DAAE0',
      role: 'キャラクター・推し活担当',
      bio: 'ちいかわで入り、サンリオで深みにハマり、ジャンプ系フィギュアで造形の沼に沈んだ。推しのガチャは発売月にコンプするのが信条。まちぼうけシリーズは棚1段を占拠中。',
      favoriteGenres: ['キャラクター', 'アニメ', 'シリーズ'],
      articleIds: ['chiikawa', 'sanrio-flood', 'jump-anime', 'machibouke'],
    },
    {
      id: 'onishi',
      name: '大西',
      avatar: 'images/onishi-profile.jpg',
      color: '#4CAF50',
      role: 'ミニチュア・造形担当',
      bio: 'ケンエレファントの新作はとりあえず回す。食品・日用品・ガジェット、何でも小さければ正義。塗装の断面と素材の質感を語り出すと止まらない。造形の密度が¥500に見合うかを常にジャッジしている。',
      favoriteGenres: ['ミニチュア', '動物', 'メーカー'],
      articleIds: ['miniature', 'kitan-animals', 'ken-elephant', 'retro-tech'],
    },
  ];
}

function getArticleData() {
  return [
    {
      id: 'omoshiro-3',
      curatorId: 'yagi',
      tag: 'おもしろ',
      title: 'ネタ枠ガチャ、今月の3つ',
      coverProductId: 2,
      productIds: [2, 8, 25],
      lede: 'ガチャガチャの棚の前で、思わず二度見してしまうラインがある。実用性ゼロ、だけど手が伸びる。そういうものを3つ選んだ。',
      body: [
        { type: 'h2', text: 'ガチャの中にガチャがある、という入れ子構造' },
        { type: 'p', text: 'タカラトミーアーツの「THE!ガチャハンドル リターンズ」は、ガチャを回すハンドル自体がガチャの景品になっているという、メタ的な発想の商品だ。回すとカチカチ音がする。それだけなのに妙に手が止まらない。初代が出たときにSNSで話題になって、今回のリターンズで再登場した。机に置いておくと確実に誰かが回す。¥400。' },
        { type: 'product', id: 2 },
        { type: 'h2', text: '枕元に牛乳瓶を置く生活' },
        { type: 'p', text: '「ぴかっと牛乳瓶ライト」は¥300。給食で見たあの瓶がLEDライトになっている。スイッチを押すとぼんやり温かい色で光る。間接照明として使うには暗いが、それがちょうどいいという人が多い。Twitterでは「枕元に置いたら毎晩牛乳飲みたくなる」という投稿が出回っていた。ノスタルジーの値段が¥300だとしたら安い。' },
        { type: 'product', id: 8 },
        { type: 'h2', text: '録音できるガチャという謎ジャンル' },
        { type: 'p', text: '「本当に録音再生！ポータブルゲーム機マスコット」。名前が長い。そして名前の通り、本当に録音して再生できる。録音時間は5秒ほどだが、それで十分だという人もいる。レトロなゲーム機の見た目をしていて、ボタンを押すと自分の声が返ってくる。¥500。会議中のメモ代わりに使っているという猛者の話を聞いたことがあるが、たぶん嘘だと思う。' },
        { type: 'product', id: 25 },
      ],
    },
    {
      id: 'chiikawa',
      curatorId: 'asakawa',
      tag: 'ちいかわ',
      title: 'ちいかわガチャ、どこまで増えるのか',
      coverProductId: 1,
      productIds: [1, 9, 54],
      lede: 'ちいかわ関連のガチャは、もはや毎月のように新作が出る。追いかけるのは大変だが、追いかけてしまう。現時点で押さえておきたい3種をまとめた。',
      body: [
        { type: 'h2', text: '棚が足りなくなるソフビ問題' },
        { type: 'p', text: '「ちいかわ ソフビフィギュア4」はシリーズ4作目。初代から集めている人の棚はそろそろ限界を迎えている頃だろう。今作の見どころはハチワレの表情バリエーションが増えたこと。怒り顔と泣き顔が加わって、並べたときの表情の幅が出るようになった。全5種、¥400。パレード製。ソフビの質感は相変わらず良くて、触ったときのむにっとした感触がある。' },
        { type: 'product', id: 1 },
        { type: 'h2', text: '巾着としての実用性が意外と高い' },
        { type: 'p', text: '「ちいかわ おかお巾着②」は顔がそのまま巾着になっているシリーズの第2弾。かわいさは見たまんまだが、実はサイズ感が絶妙で、イヤホンやリップ、鍵あたりの小物を入れるのにちょうどいい。推し活グッズを持ち歩く人には収納ケースとして活躍する。2作目でカラバリが増えた。¥500。タカラトミーアーツ。' },
        { type: 'product', id: 9 },
        { type: 'h2', text: 'コラボ先がサンリオ、という飛び道具' },
        { type: 'p', text: '「ちいかわ×サンリオ なりきりフィギュア」。ちいかわのキャラがサンリオキャラの衣装を着ているという、ファンが想像で描いていたようなコラボが公式から出た。ちいかわ勢とサンリオ勢の両方が反応するので、SNSでの拡散力が強い。ハチワレがシナモロールの格好をしている造形は確かにかわいい。¥500。タカラトミーアーツ。' },
        { type: 'product', id: 54 },
      ],
    },
    {
      id: 'miniature',
      curatorId: 'onishi',
      tag: 'ミニチュア',
      title: '食卓に並べたくなるミニチュアの話',
      coverProductId: 5,
      productIds: [5, 6, 21, 24],
      lede: 'ミニチュアガチャの世界は深い。食品、文具、家電——何でも小さくなる。その中から、特に「モノとしての精度」が高い4つを選んだ。',
      body: [
        { type: 'h2', text: '陶器は陶器で作るべき、という正解' },
        { type: 'p', text: 'ケンエレファントの「くら寿司 ミニチュア陶器コレクション」は、素材に実際の陶器を使っている。これが効いている。プラスチックのミニチュアとは手に取ったときの重さと冷たさがまったく違う。寿司皿のサイズ感もリアルで、小さな醤油皿として実用できなくもない（しないけど）。撮影用の小道具として使っている人も多い。¥300。' },
        { type: 'product', id: 5 },
        { type: 'h2', text: 'チーズの断面を見て「うまそう」と思ったら勝ち' },
        { type: 'p', text: '同じくケンエレファントの「フロマージュ研究会」。チーズのミニチュアだ。カマンベールの白カビ、ゴーダの気泡、ブルーチーズの青かび——断面の塗り分けが丁寧で、食品ミニチュアで一番大事な「おいしそうに見えるか」を完全にクリアしている。¥500と少し高いが、手に持つと納得できる密度。' },
        { type: 'product', id: 6 },
        { type: 'h2', text: 'コラショの机に赤ペン先生がいる' },
        { type: 'p', text: '「めざましコラショ ミニチュアコレクション」はケンエレファント製。進研ゼミの目覚まし時計「コラショ」のミニチュアだ。世代によって刺さるポイントが違う。20代は「懐かしい」、30代は「まだあるんだ」、親世代は「子どもに買おうかな」。赤ペン先生の机セットが当たり枠。¥400。' },
        { type: 'product', id: 21 },
        { type: 'h2', text: '文房具好きはJETSTREAMで倒れる' },
        { type: 'p', text: '「uni MITSUBISHI PENCIL ミニチュアチャーム3」。uniボールペンやJETSTREAMの精巧なミニチュアがチャームになっている。クリップ部分が可動するものもあり、文房具ファンの間では毎回話題になるシリーズ。第3弾でラインナップがさらに広がった。¥300というのも手が出やすい。' },
        { type: 'product', id: 24 },
      ],
    },
    {
      id: 'kitan-animals',
      curatorId: 'onishi',
      tag: '動物',
      title: 'キタンクラブの猫、5匹連れてきた',
      coverProductId: 14,
      productIds: [14, 50, 58, 63, 230],
      lede: 'キタンクラブは動物モチーフのガチャに強い。特に猫。シュールなものからリアル造形まで振れ幅が広い。今回は猫だけで5つ選んだ。',
      body: [
        { type: 'h2', text: '肉球を愛でながら酒が飲める器' },
        { type: 'p', text: '「ねこあし おちょこ」は猫の足をかたどったおちょこ。裏返すと肉球のディテールが見える。実際に日本酒を注いで使えるサイズ感で、酒器として機能する。キタンクラブはこういう「かわいいけど実用もできる」ラインの設計がうまい。¥500だが、陶器的な質感を考えれば高くない。' },
        { type: 'product', id: 14 },
        { type: 'h2', text: '丸まった猫は正義' },
        { type: 'p', text: '「ほっこり日和 猫」は丸まった猫の置き物。手のひらに載るサイズで、適度に重い。デスクに置くと視界の端に入るたびにちょっと和む。ガチャの景品にしては存在感があって、¥300でこの満足度は強い。5種あるが、茶トラとハチワレが人気。' },
        { type: 'product', id: 50 },
        { type: 'h2', text: 'ペンを挟んでくれる猫' },
        { type: 'p', text: '「猫キャッチ」は何かを掴んでいるポーズの猫。見た目のかわいさだけでなく、ペンやケーブルを挟める実用性がある。全5種で三毛・黒・茶トラなど色違いが揃う。机の上のケーブル整理に使っている人をよく見かける。¥300。' },
        { type: 'product', id: 58 },
        { type: 'h2', text: '棚の端からこちらを見ている' },
        { type: 'p', text: '「なおにゃん スイング2」はぶら下がって揺れる猫フィギュア。棚やモニターの縁に引っ掛けて飾る。第2弾で新しい毛色が追加された。ちょっとした隙間にぶら下がっている猫を見つけると、なぜか嬉しくなる。そういう種類のガチャ。¥300。' },
        { type: 'product', id: 63 },
        { type: 'h2', text: '造形がガチャの域を超えている' },
        { type: 'p', text: '「AIP森口修の猫フィギュアマスコット3」。造形作家・森口修による監修で、筋肉の付き方や毛並みの表現がガチャとは思えない。手に持つとずっしりくる。¥500だが、この造形密度ならフィギュアショップで¥2,000でも違和感がない。第3弾まで続いているのは売れている証拠。' },
        { type: 'product', id: 230 },
      ],
    },
    {
      id: 'sanrio-flood',
      curatorId: 'asakawa',
      tag: 'キャラクター',
      title: 'サンリオガチャ、正直出すぎではないか',
      coverProductId: 4,
      productIds: [4, 7, 10, 62, 67],
      lede: '2026年1月のガチャ新商品を数えたら、サンリオ関連が30種を超えていた。多い。明らかに多い。その中からデザインの方向性が異なる5つを選んで、この「出すぎ」現象を眺めてみた。',
      body: [
        { type: 'h2', text: '裏表でキャラが変わるという、ちょっとした裏切り' },
        { type: 'p', text: '「サンリオキャラクターズ リバーシブルぬいぐるみ いちごデザイン」。裏返すと別のキャラクターになるぬいぐるみだ。いちごモチーフの季節限定デザインで、表のピンクと裏の赤の色合いが春っぽい。バンダイの¥500ライン。リバーシブルという仕掛けがあるだけで、普通のぬいぐるみマスコットより「見せたくなる」のが面白い。' },
        { type: 'product', id: 4 },
        { type: 'h2', text: 'スイーツデコ的に並べられる造形' },
        { type: 'p', text: '「サンリオキャラクターズ ホイップクリームマスコット」。クリームの上にサンリオキャラが乗っている構図。ひとつだと小さいが、3つ4つ並べるとスイーツショップのショーケースみたいになる。写真を撮る人にとっては「配置のしやすさ」が重要で、このシリーズはそこが考えられている。¥400。バンダイ。' },
        { type: 'product', id: 7 },
        { type: 'h2', text: '時間は見えないが、存在感はある' },
        { type: 'p', text: '「サンリオキャラクターズ ダンボールウォッチ２」。ダンボール風デザインの腕時計で、当然ながら時間は読めない。でも腕につけるとインパクトがある。「何それ？」と聞かれるためのガチャというジャンルがあるとしたら、これはその最前線にいる。第2弾ということは、第1弾が売れたということだ。¥500。' },
        { type: 'product', id: 10 },
        { type: 'h2', text: 'しっぽだけを商品化する発想' },
        { type: 'p', text: '「サンリオキャラクターズ しっぽチャーム」。キャラクターの「しっぽ部分だけ」を切り取ったチャーム。シナモンのしっぽがくるんと巻いている造形は地味にかわいい。キャラの全身を見せなくても、パーツだけでそのキャラだと分かる——それはキャラクターの力が強い証拠だ。¥400。バンダイ。' },
        { type: 'product', id: 62 },
        { type: 'h2', text: '光を通すとちゃんと綺麗' },
        { type: 'p', text: '「サンリオ ステンドグラス風アクリルキーチェーン」。透過素材にステンドグラス柄を印刷したキーチェーン。窓際に掛けておくと光を通して色が出る。アクリル系のガチャは増えているが、「光に透かす」という使い方まで想定しているものは少ない。¥300。バンダイ。手を出しやすい価格。' },
        { type: 'product', id: 67 },
      ],
    },
    {
      id: 'budget-picks',
      curatorId: 'yagi',
      tag: 'コスパ',
      title: '¥300以下。安いガチャは安いなりか？',
      coverProductId: 37,
      productIds: [37, 49, 205, 15, 85],
      lede: 'ガチャの価格は年々上がっている。¥500や¥600が当たり前になってきた中で、¥300以下の商品はどうなのか。安かろう悪かろうなのか、それとも——。',
      body: [
        { type: 'h2', text: '¥200で手に入る半透明の和菓子' },
        { type: 'p', text: 'SO-TAの「ことりの葛まんじゅう うつろい」は¥200。200円のガチャは最近では珍しくなった。だが出来は悪くない。半透明の葛の表現が丁寧で、中に小鳥が透けて見える構造。SO-TAは食品ミニチュアが得意なメーカーで、安い価格帯でもディテールが崩れないのが信頼できる。' },
        { type: 'product', id: 37 },
        { type: 'h2', text: '犬のかわいさに値段は関係ない' },
        { type: 'p', text: '「はっぴ～ぬ！」も¥200。キタンクラブの犬マスコットで、5種類すべて表情が違う。目を閉じている子、舌を出している子、首をかしげている子。安いから雑なのかと思いきや、表情の描き分けが丁寧で、全種コンプしたくなるタイプ。¥200×5=¥1,000で全部揃うのは精神的にも楽。' },
        { type: 'product', id: 49 },
        { type: 'h2', text: 'ミッフィーの寝姿に¥200は安すぎる' },
        { type: 'p', text: '「miffy すやすやフレンドFig.ぱすてる」。¥200でミッフィーの寝姿フィギュアが手に入る。パステルカラーなので棚に並べたときの統一感が出しやすい。タカラトミーアーツ製で、造形はしっかりしている。これが200円でいいのかという気持ちになる。' },
        { type: 'product', id: 205 },
        { type: 'h2', text: 'キャンディの中にたまごっちがいる透明感' },
        { type: 'p', text: '「たまごっち カラフルキャンディチャーム」は¥300。クリアパーツのキャンディの中にたまごっちキャラが封入されている。光に透かすと綺麗で、カバンにつけると目を引く色味。バンダイ。300円でこのクオリティのクリアパーツが出てくるのは、大手メーカーの量産力のおかげだろう。' },
        { type: 'product', id: 15 },
        { type: 'h2', text: 'ティッシュ箱がなぜかフォトジェニック' },
        { type: 'p', text: '「nepia ミニチュアチャーム」。ケンエレファントの¥300ライン。ネピアのティッシュ箱がミニチュアになっている。生活感の塊みたいなモチーフだが、小さくするとなぜかフォトジェニックになる。ミニチュア撮影界隈では「日用品系」が人気ジャンルのひとつで、これはその入門に最適。' },
        { type: 'product', id: 85 },
      ],
    },
    {
      id: 'light-up',
      curatorId: 'yagi',
      tag: '光る',
      title: '暗い部屋で光るガチャだけ集めた',
      coverProductId: 55,
      productIds: [8, 17, 55, 65, 258],
      lede: '「光るガチャ」は地味に人気ジャンルだ。LEDが仕込まれた小さなマスコットを暗い部屋で光らせると、値段以上の雰囲気が出る。今月出ている中から5つ。',
      body: [
        { type: 'h2', text: '給食の記憶が光っている' },
        { type: 'p', text: '「ぴかっと牛乳瓶ライト」は底面のスイッチを押すとぼんやり光る牛乳瓶。間接照明としては暗いが、枕元に置くと「ちょうどいい暗さ」だという声が多い。光り方がやわらかくて、直接見ても眩しくない。¥300でこの雰囲気が買えるのは強い。タカラトミーアーツ。' },
        { type: 'product', id: 8 },
        { type: 'h2', text: 'チーズが光源になっているという洒落' },
        { type: 'p', text: '「TOM and JERRY ライトマスコット3」。トムとジェリーの追いかけっこシーンがそのまま発光する。光源がチーズになっている造形がよくできている。第3弾まで続いているのはそれだけ売れている証拠。シリーズ通して集めている人も多い。¥500。タカラトミーアーツ。' },
        { type: 'product', id: 17 },
        { type: 'h2', text: '電球の中にすみっコがいる光景' },
        { type: 'p', text: '「すみっコぐらし ほわっと光る！電球ライト2」。電球の形をしたカプセルの中にすみっコのフィギュアが入っていて、底面から光る。暗い部屋でつけるとキャラのシルエットが浮かぶ仕組み。第2弾で新キャラが追加された。子どもにも大人にもウケる万能タイプ。¥300。タカラトミーアーツ。' },
        { type: 'product', id: 55 },
        { type: 'h2', text: 'ミッフィーの顔面が発光する潔さ' },
        { type: 'p', text: '「ミッフィー マスコットライトPart.3」。ミッフィーの顔がまるごと光る。デスクライト代わりには暗いが、存在感だけなら部屋の中で一番。第3弾で色味のバリエーションが増えた。光り方に個体差があるのもガチャらしい。¥400。タカラトミーアーツ。' },
        { type: 'product', id: 65 },
        { type: 'h2', text: 'ポメラニアンは光るべきではないが、光る' },
        { type: 'p', text: '「光るポメラニアン」。名前のまんまだ。ポメラニアンが光る。それ以上でもそれ以下でもないのだが、暗い部屋で光らせた瞬間のインパクトはこのリストの中で最強。「なぜ光らせたのか」という疑問を抱いたまま眺めるのが正しい鑑賞法。¥500。ブシロードクリエイティブ。' },
        { type: 'product', id: 258 },
      ],
    },
    {
      id: 'machibouke',
      curatorId: 'asakawa',
      tag: 'シリーズ',
      title: '「まちぼうけ」という万能フォーマット',
      coverProductId: 18,
      productIds: [18, 35, 81, 166, 249],
      lede: 'バンダイの「まちぼうけ」シリーズは、キャラクターを棚の端に座らせるフォーマットのフィギュアだ。どんなIPでも成立する汎用性の高さが強みで、ラインナップが異常に広い。その中から5作。',
      body: [
        { type: 'h2', text: '放課後の部室に座っている軽音部' },
        { type: 'p', text: '「まちぼうけ けいおん！の場合」。唯たちが楽器を抱えたまま棚の端で待ちぼうけしている。けいおん！は2009年のアニメだが、こうしてガチャで再登場するあたり、IP寿命の長さを感じる。机の端に座らせると、放課後の部室のような空気が出る。¥400。バンダイ。' },
        { type: 'product', id: 18 },
        { type: 'h2', text: '実在のロックバンドがデフォルメで待つシュールさ' },
        { type: 'p', text: '「まちぼうけGLAY」。GLAYのメンバーがまちぼうけフォーマットで棚の端に座っている。実在のアーティストがこのフォーマットに入ると、独特のシュールさが生まれる。ファン以外にも「面白い」と受ける理由がそこにある。TERUやTAKUROの表情が絶妙。¥500。' },
        { type: 'product', id: 35 },
        { type: 'h2', text: 'キャラ知識不要の動物版' },
        { type: 'p', text: '「まちぼうけ パンダの場合」。パンダが棚の角でぼーっとしている。動物版まちぼうけの良さは、何のキャラか知らなくても楽しめること。笹を持っている子と持っていない子がいて、それぞれ微妙にポーズが違う。¥300と安い。まちぼうけ入門に最適。' },
        { type: 'product', id: 81 },
        { type: 'h2', text: 'ラーメン屋のカウンターがジオラマになる' },
        { type: 'p', text: '「まちぼうけ NARUTO ラーメン一楽 第2弾」。ナルトたちがラーメン屋一楽のカウンターに座っている。このシリーズの特徴はカウンターパーツが付属すること。複数体並べると、一楽の店内が再現できる。ジオラマ的な遊び方ができるまちぼうけは少ないので、ここが他と差がつくポイント。¥400。' },
        { type: 'product', id: 166 },
        { type: 'h2', text: 'ジョジョ立ちのまま座らせるという無理' },
        { type: 'p', text: '「ジョジョの奇妙な冒険 まちぼうけ スターダストクルセイダース」。承太郎たちがジョジョ立ちのまま棚に座っている。ポーズに無理がある。だがそこがいい。造形のこだわりがすごくて、帽子と髪の境目や学ランのしわまで再現されている。¥500。バンダイの気合を感じる。' },
        { type: 'product', id: 249 },
      ],
    },
    {
      id: 'ken-elephant',
      curatorId: 'onishi',
      tag: 'メーカー',
      title: 'ケンエレファントが作ると、なぜか欲しくなる',
      coverProductId: 41,
      productIds: [5, 6, 41, 86, 46],
      lede: 'ケンエレファントはミニチュアガチャの専門メーカーだ。食品、日用品、企業コラボ——何を小さくしても一定以上のクオリティが保証される。その安心感について、5つの商品を通して書く。',
      body: [
        { type: 'h2', text: '素材で本気を出してくるメーカー' },
        { type: 'p', text: 'まず「くら寿司 ミニチュア陶器コレクション」。このシリーズが象徴的なのは、陶器のミニチュアを陶器で作っていること。プラスチックで済ませてもよさそうなところを、素材まで合わせてくる。手に取ったときの重さと冷たさが「ミニチュアなのに本物っぽい」という感覚を生む。¥300。' },
        { type: 'product', id: 5 },
        { type: 'h2', text: '断面の塗り分けに込められた執念' },
        { type: 'p', text: '「フロマージュ研究会」はチーズのミニチュア。断面のカマンベールの白カビ部分、ゴーダの気泡、ブルーチーズの青かび——全部塗り分けされている。食品ミニチュアは「おいしそうに見えるか」が全てだと思っているが、ケンエレファントはそこに毎回応えてくる。¥500。' },
        { type: 'product', id: 6 },
        { type: 'h2', text: 'CoCo壱のカレーが小さくてもCoCo壱' },
        { type: 'p', text: '「CoCo壱番屋 ミニチュアマスコットvol.2」。カレーのルー、ライス、福神漬け——小さい面積の中でちゃんと色が分かれている。企業コラボのミニチュアはパッケージだけ再現して中身が適当なものもあるが、ケンエレファントは中身まで手を抜かない。第2弾まで続いているのは初弾の出来が良かった証拠。¥400。' },
        { type: 'product', id: 41 },
        { type: 'h2', text: '池袋の老舗が手のひらサイズに' },
        { type: 'p', text: '「タカセ洋菓子 ミニチュアチャーム」。池袋の老舗洋菓子店タカセとのコラボ。ケーキの断面にスポンジとクリームの層がちゃんと見える。こういう地元密着の企業コラボは、ファンの熱量が高い。池袋に行ったことがある人なら「あのタカセか」となる。¥400。' },
        { type: 'product', id: 86 },
        { type: 'h2', text: 'コスメのミニチュアが開く' },
        { type: 'p', text: '「ヴィセ ミニチュアコレクション」。コーセーのコスメブランド・ヴィセのアイシャドウパレットやリップがミニチュアになっている。一部のパレットは蓋が開閉できる。ミニチュアの世界では「動くギミック」は高評価ポイントで、このシリーズはそこを押さえている。¥500。' },
        { type: 'product', id: 46 },
      ],
    },
    {
      id: 'retro-tech',
      curatorId: 'onishi',
      tag: 'ミニチュア',
      title: 'ガジェットのミニチュアには、なぜ惹かれるのか',
      coverProductId: 133,
      productIds: [133, 139, 148, 151, 147],
      lede: 'カメラ、ゲーム機、車、ルーター。「機械」を小さくしたガチャには独特の引力がある。食品ミニチュアとは違う、プロダクトデザインそのものへの愛着が詰まっている。',
      body: [
        { type: 'h2', text: '初代PSからPS5まで、歴史が棚に並ぶ' },
        { type: 'p', text: '「The History Collection PlayStation」。初代プレイステーションからPS5まで、歴代ハードがミニチュアになっている。コントローラーまで再現されていて、実機を知っている世代には強烈に刺さる。知らない世代には「こんな形だったの？」という発見がある。歴史を並べる楽しさは、ミニカーコレクションに近い。¥500。タカラトミーアーツ。' },
        { type: 'product', id: 133 },
        { type: 'h2', text: '誰が買うのか分からないが第4弾まで続いている' },
        { type: 'p', text: '「手のひらネットワーク機器4」。ルーターやスイッチングハブのミニチュアだ。「誰が買うのか」とよく言われるが、第4弾まで続いている事実がすべてを物語っている。IT企業に勤めている人が自分のデスクに置いたり、情報系の学生がネタとして買ったり、ニッチだがファンが確実にいる。¥500。ターリン・インターナショナル。' },
        { type: 'product', id: 139 },
        { type: 'h2', text: 'カメラ好きへの贈り物に、ちょうどいい' },
        { type: 'p', text: '「Canon ミニチュアカメラコレクション」。キヤノンの一眼レフがミニチュアになっている。レンズの取り外しはできないが、グリップの形状やダイヤル周りの再現がしっかりしている。カメラ好きの人への手土産に、ガチャ一個¥500は「ちょうどいいサプライズ」の価格帯だと思う。バンダイ。' },
        { type: 'product', id: 148 },
        { type: 'h2', text: '80年代の電子ゲームが帰ってきた' },
        { type: 'p', text: '「ELECTRO GAME COLLECTION 4」。80年代の電子ゲーム機——ゲーム＆ウォッチ的なあの形のやつ——を再現したミニチュア。液晶部分はシールだが雰囲気は出ている。このシリーズはレトロゲーム好きに突き刺さるラインで、第4弾は初期モデルの復刻が入っているのがポイント。¥400。IP4。' },
        { type: 'product', id: 151 },
        { type: 'h2', text: '型式で語れる人は倒れるミニカー' },
        { type: 'p', text: '「Honda CIVIC TYPE R コレクション」。歴代シビックType Rのミニカー。EK9、FD2、FK8——型式名で反応する人にとっては夢のようなラインナップ。¥500で塗装の品質がよく、ダイキャスト系のミニカーコレクションに混ぜても違和感がない。IP4。' },
        { type: 'product', id: 147 },
      ],
    },
    {
      id: 'jump-anime',
      curatorId: 'asakawa',
      tag: 'アニメ',
      title: 'ジャンプ系ガチャ、造形で選ぶならこの5つ',
      coverProductId: 64,
      productIds: [64, 119, 149, 255, 186],
      lede: 'ジャンプ作品のガチャは山ほどある。だが「造形の出来」で選ぶとなると、かなり絞られる。今回はフィギュアとしての完成度だけを基準に5つ選んだ。',
      body: [
        { type: 'h2', text: 'HGシリーズという信頼' },
        { type: 'p', text: 'バンダイの「HG ONE PIECE 01」。HGシリーズはガチャフィギュアの中でもワンランク上の造形を約束するブランドだ。ONE PIECEの第1弾ではルフィのギア5フォルムが入っている。塗装のクオリティも高く、棚に飾ったときの見栄えが段違い。¥500。ONE PIECEファンでなくても、フィギュア好きなら触ってほしい。' },
        { type: 'product', id: 64 },
        { type: 'h2', text: 'つなげるとパーティが完成する楽しさ' },
        { type: 'p', text: '「葬送のフリーレン つまんでつなげてますこっと2」。指でつまめるサイズのフリーレンたちが、つなげて並べられる仕組み。第2弾でシュタルクとザインが追加されて、これでパーティ編成が完成する。つなげたときの「全員揃った感」がコンプリートの満足度を上げている。¥400。バンダイ。' },
        { type: 'product', id: 119 },
        { type: 'h2', text: '魔人ブウ編のメリハリ' },
        { type: 'p', text: '「HGドラゴンボール04 MAJIN BUU SAGA」。再びHGシリーズ。魔人ブウ編なのでベジット、ゴテンクス、アルティメット悟飯など人気キャラが揃っている。ドラゴンボールのHGは造形のメリハリが他シリーズより強くて、筋肉の隆起やオーラの表現がダイナミック。¥500。' },
        { type: 'product', id: 149 },
        { type: 'h2', text: 'フリーレンの寝姿が人気という現象' },
        { type: 'p', text: '「葬送のフリーレン ねむらせ隊」。バンダイの定番フォーマット「ねむらせ隊」にフリーレンが登場。フリーレンが魔導書を枕にして寝ている造形がSNSでバズった。キャラクターの「らしさ」がポーズだけで伝わるのは、原作の力とフィギュアの設計の両方が噛み合っている証拠。¥500。' },
        { type: 'product', id: 255 },
        { type: 'h2', text: '¥800の価値がある座りフィギュア' },
        { type: 'p', text: '「HUNTER×HUNTER すわらせ隊りある2」。ガチャとしては¥800と高い。だが「りある」版はデフォルメが少なく頭身が高い。ゴンやキルアの座りフィギュアの出来は、このシリーズでしか手に入らないクオリティ。「高いけどこれしかない」というタイプの商品。バンダイ。' },
        { type: 'product', id: 186 },
      ],
    },
  ];
}


// ── Filters ──
function renderFilters() {
  renderFilterPills("monthPills", MONTHS, "month", (v) => MONTH_LABELS[v] || v);
  renderFilterPills("genrePills", GENRES, "genre");
  renderFilterPills("pricePills", PRICES, "price", (v) => `¥${v}`);
  renderFilterPills("makerPills", MAKERS, "maker");
}

function renderFilterPills(containerId, items, group, labelFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items
    .map((item) => {
      const label = labelFn ? labelFn(item) : item;
      return `<button class="filter-pill" data-filter-group="${group}" data-value="${item}">${label}</button>`;
    })
    .join("");

  container.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => toggleFilter(group, pill.dataset.value, pill));
  });
}

function toggleFilter(group, value, pill) {
  const key = `selected${group.charAt(0).toUpperCase() + group.slice(1)}`;

  if (state[key] === value) {
    state[key] = null;
    pill.classList.remove("active");
  } else {
    const container = pill.parentElement;
    container.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    state[key] = value;
    pill.classList.add("active");
  }

  updateApplyBtnLabel();
  renderCards();
}

function clearFilters() {
  state.selectedMonth = null;
  state.selectedGenre = null;
  state.selectedPrice = null;
  state.selectedMaker = null;
  state.searchQuery = "";
  document.querySelectorAll(".filter-pill.active").forEach((p) => p.classList.remove("active"));
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  updateSearchClearVisibility();
  renderCards();
}

// ── Search ──
function setupSearch() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClear");
  if (!input) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.searchQuery = input.value.trim();
      updateSearchClearVisibility();
      renderCards();
    }, 200);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      state.searchQuery = "";
      updateSearchClearVisibility();
      renderCards();
      input.focus();
    });
  }
  updateSearchClearVisibility();
}

function updateSearchClearVisibility() {
  const clearBtn = document.getElementById("searchClear");
  if (clearBtn) clearBtn.style.display = state.searchQuery ? "flex" : "none";
}

// ── Sort ──
function setupSortSelect() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderCards();
  });
}

function sortData(data) {
  const sorted = [...data];
  switch (state.sortBy) {
    case "month-asc":
      return sorted.sort((a, b) => a.releaseMonth.localeCompare(b.releaseMonth));
    case "month-desc":
      return sorted.sort((a, b) => b.releaseMonth.localeCompare(a.releaseMonth));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    default:
      return sorted;
  }
}

// ── Filter Logic ──
function getFilteredData() {
  return GACHA_DATA.filter((item) => {
    if (state.selectedMonth && item.releaseMonth !== state.selectedMonth) return false;
    if (state.selectedGenre && item.genre !== state.selectedGenre) return false;
    if (state.selectedPrice && item.price !== Number(state.selectedPrice)) return false;
    if (state.selectedMaker && item.maker !== state.selectedMaker) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const haystack = [item.name, item.maker, item.genre, item.description || "", item.lineup || ""]
        .join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// ── Render Cards ──
function renderCards() {
  const container = document.getElementById("cardContainer");
  if (!container) return;
  const filtered = getFilteredData();
  const sorted = sortData(filtered);

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.innerHTML = `<strong>${sorted.length}</strong> 件`;

  if (sorted.length === 0) {
    const hint = state.searchQuery
      ? `「${state.searchQuery}」に一致する商品が見つかりません`
      : "該当する商品がありません";
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">-</div>
        <div class="empty-title">${hint}</div>
        <div class="empty-text">条件を変更してお試しください</div>
      </div>
    `;
    return;
  }

  if (state.sortBy.startsWith("month")) {
    renderGroupedByMonth(container, sorted);
  } else {
    container.innerHTML = `<div class="card-grid">${sorted.map(renderCard).join("")}</div>`;
  }
}

function renderGroupedByMonth(container, data) {
  const groups = {};
  data.forEach((item) => {
    if (!groups[item.releaseMonth]) groups[item.releaseMonth] = [];
    groups[item.releaseMonth].push(item);
  });

  const months = Object.keys(groups).sort(
    state.sortBy === "month-desc" ? (a, b) => b.localeCompare(a) : (a, b) => a.localeCompare(b)
  );

  container.innerHTML = months
    .map(
      (month) => `
      <div class="month-group">
        <div class="month-header">
          <span class="month-badge">${MONTH_LABELS_LONG[month] || month}</span>
          <span class="month-count">${groups[month].length}件</span>
        </div>
        <div class="card-grid">
          ${groups[month].map(renderCard).join("")}
        </div>
      </div>
    `
    )
    .join("");
}

function renderCard(item) {
  const imgSrc = getProductImage(item);
  const hasImage = !!imgSrc;
  const placeholder = getPlaceholderForGenre(item.genre);
  const imageHtml = hasImage
    ? `<div class="card-image"><img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholder}'"></div>`
    : `<div class="card-image"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--ink-muted);">No Image</div></div>`;

  var liked = typeof isLiked === "function" && isLiked(item.id);
  var heartClass = liked ? " liked" : "";

  return `
    <div class="gacha-card-wrap">
      <a href="detail.html?id=${item.id}" class="gacha-card">
        ${item.isNew ? '<div class="card-new-badge">NEW</div>' : ""}
        ${imageHtml}
        <div class="card-body">
          <div class="card-tags">
            <span class="card-tag">${item.genre}</span>
            <span class="card-tag">${item.maker}</span>
          </div>
          <div class="card-title">${item.name}</div>
          <div class="card-footer">
            <div class="card-price">&yen;${item.price}<small> /回</small></div>
          </div>
        </div>
      </a>
      <button class="card-heart${heartClass}" data-heart-id="${item.id}" aria-label="気になる">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </button>
    </div>
  `;
}

function setupHeartButtons() {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".card-heart");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var user = null;
    try { user = JSON.parse(localStorage.getItem("gacha_auth_user")); } catch(ex) {}
    if (!user) {
      window.location.href = "mypage.html";
      return;
    }

    var id = parseInt(btn.dataset.heartId, 10);
    if (typeof toggleLike === "function") {
      var added = toggleLike(id);
      btn.classList.toggle("liked", added);
      var path = btn.querySelector("svg path");
      if (path) path.setAttribute("fill", added ? "currentColor" : "none");
      if (added) {
        btn.classList.add("pop");
        setTimeout(function() { btn.classList.remove("pop"); }, 300);
      }
    }
  });
}

// ── Product Drop Card (注目ランキング) ──
function renderDropCard() {
  const section = document.getElementById("dropSection");
  const track = document.getElementById("dropTrack");
  const prevBtn = document.getElementById("dropPrev");
  const nextBtn = document.getElementById("dropNext");
  if (!section || !track || typeof getTopRanked !== "function") return;

  const top = getTopRanked("interest", 10);
  if (top.length === 0) {
    section.style.display = "none";
    return;
  }
  section.style.display = "";

  const items = top.map((entry, rank) => {
    const product = GACHA_DATA.find((g) => g.id === entry.id);
    if (!product) return null;
    const purchased = typeof getRankingCount === "function" ? getRankingCount(product.id, "purchased") : 0;
    const imgSrc = getProductImage(product);
    const fallback = getPlaceholderForGenre(product.genre);
    const monthLabel = MONTH_LABELS_LONG[product.releaseMonth] || product.releaseMonth;
    const rankClass = rank === 0 ? "rank-gold" : rank === 1 ? "rank-silver" : rank === 2 ? "rank-bronze" : "";
    return {
      rank: rank + 1,
      rankClass,
      name: product.name,
      meta: `${product.maker}・¥${product.price}`,
      time: `${monthLabel} 発売`,
      imgSrc,
      fallback,
      href: `detail.html?id=${product.id}`,
      interest: entry.count,
      purchased,
    };
  }).filter(Boolean);

  track.innerHTML = items.map((it) => `
    <a href="${it.href}" class="drop-item">
      <div class="drop-item-img-wrap">
        <span class="drop-item-rank ${it.rankClass}">${it.rank}</span>
        <img src="${it.imgSrc}" alt="${it.name}" class="drop-item-img" loading="lazy" onerror="this.onerror=null;this.src='${it.fallback}'">
      </div>
      <p class="drop-item-time">${it.time}</p>
      <p class="drop-item-name">${it.name}</p>
      <p class="drop-item-meta">${it.meta}</p>
      <div class="drop-item-stats">
        <span class="drop-item-stat">
          <svg viewBox="0 0 16 16" fill="none"><path d="M8 1C4.7 1 2 3.2 2 6c0 4 6 9 6 9s6-5 6-9c0-2.8-2.7-5-6-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          ${it.interest}
        </span>
        <span class="drop-item-stat">
          <svg viewBox="0 0 16 16" fill="none"><path d="M2 3h12v2l-5 4v3h3v1H4v-1h3v-3L2 5V3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          ${it.purchased}
        </span>
      </div>
    </a>
  `).join("");

  let currentIndex = 0;
  let autoTimer = null;

  function getColCount() {
    const w = window.innerWidth;
    if (w >= 768) return 3;
    if (w >= 520) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, items.length - getColCount());
  }

  function updateSlide() {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const gap = 16;
    const itemEls = track.querySelectorAll(".drop-item");
    if (itemEls.length === 0) return;
    const itemW = itemEls[0].offsetWidth + gap;
    track.style.transform = `translateX(-${currentIndex * itemW}px)`;

    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  function goTo(nextIndex) {
    const maxIndex = getMaxIndex();
    if (maxIndex === 0) {
      currentIndex = 0;
      updateSlide();
      return;
    }
    if (nextIndex < 0) {
      currentIndex = maxIndex;
    } else if (nextIndex > maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = nextIndex;
    }
    updateSlide();
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  function startAuto() {
    stopAuto();
    if (items.length <= getColCount()) return;
    autoTimer = setInterval(() => {
      goTo(currentIndex + 1);
    }, 4500);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goTo(currentIndex - 1);
      startAuto();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goTo(currentIndex + 1);
      startAuto();
    });
  }

  track.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseleave", startAuto);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  window.addEventListener("resize", updateSlide);
  requestAnimationFrame(updateSlide);
  startAuto();
}

// ── Filter Clear (desktop + mobile) ──
function setupFilterClear() {
  const clearBtn = document.getElementById("filterClearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearFilters();
      updateApplyBtnLabel();
    });
  }
}

// ── Filter Modal (Mobile) ──
let closeFilterModal = null;

function setupFilterModal() {
  const toggleBtn = document.getElementById("filterToggleBtn");
  const applyBtn = document.getElementById("filterApplyBtn");
  const overlay = document.getElementById("filterOverlay");
  const section = document.getElementById("filterSection");
  if (!toggleBtn || !section) return;

  function openFilter() {
    updateApplyBtnLabel();
    if (overlay) {
      overlay.style.display = "block";
      requestAnimationFrame(() => overlay.classList.add("active"));
    }
    requestAnimationFrame(() => section.classList.add("modal-open"));
    document.body.style.overflow = "hidden";
  }

  closeFilterModal = function () {
    section.classList.remove("modal-open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => { if (overlay) overlay.style.display = "none"; }, 350);
  };

  toggleBtn.addEventListener("click", openFilter);
  if (applyBtn) applyBtn.addEventListener("click", () => { renderCards(); closeFilterModal(); });
  if (overlay) overlay.addEventListener("click", closeFilterModal);
}

function updateApplyBtnLabel() {
  const btn = document.getElementById("filterApplyBtn");
  if (!btn) return;
  const count = getFilteredData().length;
  btn.textContent = `${count}件を表示する`;
}

// ── Gacha Loading Transition ──
let gachaNavigating = false;
let touchStartPos = null;
const TAP_THRESHOLD = 12;

document.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStartPos = { x: t.clientX, y: t.clientY };
}, { passive: true });

function handleGachaTouch(e) {
  const card = e.target.closest("a.gacha-card") || e.target.closest("a.carousel-slide") || e.target.closest("a.drop-item");
  if (!card || gachaNavigating) return;

  if (touchStartPos) {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - touchStartPos.x);
    const dy = Math.abs(t.clientY - touchStartPos.y);
    if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) return;
  }

  e.preventDefault();
  triggerGachaTransition(card);
}

function handleGachaClick(e) {
  if ("ontouchend" in document) return;
  const card = e.target.closest("a.gacha-card") || e.target.closest("a.carousel-slide") || e.target.closest("a.drop-item");
  if (!card || gachaNavigating) return;
  e.preventDefault();
  e.stopPropagation();
  triggerGachaTransition(card);
}

function triggerGachaTransition(card) {
  if (gachaNavigating) return;
  gachaNavigating = true;
  const href = card.getAttribute("href");
  const overlay = document.getElementById("gachaLoading");
  if (!overlay) {
    window.location.href = href;
    return;
  }
  overlay.classList.add("active");
  startCapsuleAnimation();
  setTimeout(() => { window.location.href = href; }, 2700);
}

document.addEventListener("click", handleGachaClick, true);
document.addEventListener("touchend", handleGachaTouch, { passive: false });

// ── Capsule Loading Animation ──
function startCapsuleAnimation() {
  const overlay = document.getElementById("gachaLoading");
  if (!overlay) return;
  const capsuleWrap = overlay.querySelector(".capsule-wrap");
  const topHalf = overlay.querySelector(".capsule-top");
  const glowSeam = overlay.querySelector(".capsule-glow-seam");
  const starEl = overlay.querySelector(".capsule-star");
  const burstEl = overlay.querySelector(".capsule-burst");
  const progressBar = overlay.querySelector(".capsule-progress-fill");
  const statusText = overlay.querySelector(".capsule-status");
  const ambientGlow = overlay.querySelector(".capsule-ambient");

  capsuleWrap.classList.remove("twist", "open");
  if (glowSeam) glowSeam.classList.remove("visible");
  if (starEl) starEl.classList.remove("visible");
  if (burstEl) burstEl.innerHTML = "";
  if (progressBar) progressBar.style.width = "0%";
  if (statusText) statusText.textContent = "読み込み中";
  if (ambientGlow) ambientGlow.style.opacity = "0";

  requestAnimationFrame(() => {
    capsuleWrap.classList.add("twist");
    animateProgress(progressBar, 0, 60, 900);

    setTimeout(() => {
      capsuleWrap.classList.remove("twist");
      capsuleWrap.classList.add("open");
      if (glowSeam) glowSeam.classList.add("visible");
      if (statusText) statusText.textContent = "";
      animateProgress(progressBar, 60, 80, 600);
    }, 900);

    setTimeout(() => {
      if (starEl) starEl.classList.add("visible");
      if (ambientGlow) ambientGlow.style.opacity = "1";
      generateBurst(burstEl);
      generateSparkles(burstEl);
      animateProgress(progressBar, 80, 100, 300);
    }, 1500);
  });
}

function animateProgress(el, from, to, duration) {
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    el.style.width = (from + (to - from) * t) + "%";
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function generateBurst(container) {
  if (!container) return;
  const colors = ["#3daae0", "#f58520", "#f5c800", "#2888c0"];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * 360 + Math.random() * 20;
    const rad = angle * Math.PI / 180;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(rad) * dist;
    const ty = Math.sin(rad) * dist;
    const size = 3 + Math.random() * 5;
    const dot = document.createElement("div");
    dot.className = "burst-dot";
    dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${colors[i % 4]};--tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random() * 0.2}s;`;
    container.appendChild(dot);
  }
}

function generateSparkles(container) {
  if (!container) return;
  const colors = ["#3daae0", "#f58520", "#f5c800", "#2888c0"];
  for (let i = 0; i < 6; i++) {
    const sp = document.createElement("div");
    sp.className = "sparkle-dot";
    sp.textContent = "·";
    sp.style.cssText = `left:${-50 + Math.random() * 100}px;top:${-70 + Math.random() * 80}px;font-size:${12 + Math.random() * 12}px;color:${colors[i % 4]};animation-delay:${Math.random() * 0.5}s;`;
    container.appendChild(sp);
  }
}

// ── Scroll to Top ──
function setupScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

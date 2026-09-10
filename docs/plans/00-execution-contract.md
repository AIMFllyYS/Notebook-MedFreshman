# 00 路 浠ｇ爜娓呮礂鎵ц濂戠害锛?026-09锛?
> 閫傜敤鑼冨洿锛歚18`鈥揱22` 浜斾唤璁″垝鐨?*鎵€鏈?*鎵ц鍨嬩笌楠屾敹鍨嬪瓙鏅鸿兘浣撱€傚紑宸ュ墠蹇呰锛屽叏绋嬮伒瀹堛€?> 鏈绾︾殑瀛樺湪鐞嗙敱锛氭湰浠撳簱鍚屾椂鏈夊彟涓€涓?Agent 鍦ㄦ寔缁洿鏂?*姝ｆ枃璁茶В鍐呭**锛屽畠璧?`feat/*` 鍒嗘敮 + PR 鍚堝苟鍥炰富绾裤€備袱杈瑰繀椤讳簰涓嶅共鎵般€?
---

## 銆囥€佸綋鍓嶈繘搴︿笌鎵ц椤哄簭

| 璁″垝 | 涓婚 | 鐘舵€?|
|------|------|------|
| `18` | 宸ョ▼鍩虹嚎锛圙it 鍗敓銆佹浠ｇ爜銆佹姢鏍忥級 | 宸叉墽琛屻€佸凡楠屾敹 |
| `19` | 鑱婂ぉ娴佹粴鍔ㄤ笌鎶栧姩 | 宸叉墽琛屻€佸凡楠屾敹銆佸凡淇锛堜笁杞級 |
| `20` | 绐楀彛 / Artifact 浣撶郴鏀舵暃 | 宸叉墽琛屻€佸凡楠屾敹锛堝垽瀹氶€氳繃锛屾棤蹇呴』淇椤癸級 |
| `22` | Agent 鏋舵瀯涓?lint 娆犺处 | 宸叉墽琛屻€?*宸查獙鏀讹紙涓夋壒鍏ㄩ€氳繃锛?* |
| `23` | UI 灞傚綊浣嶏紙`lib` 涓嶅啀渚濊禆 `components`锛?| 宸叉墽琛屻€?*宸查獙鏀?*锛堝惈浜嬪悗鏂幆淇锛?|
| `24` | 璁板繂鍗′笌鎸囦护灞炴€цВ鏋愶紙**鏃㈠瓨 P0**锛岄潪鍥炲綊锛?| 宸叉墽琛屻€侀棬绂佸叏缁匡紱**闃舵 C 鐪熸満楠岃瘉寰呬汉宸ュ畬鎴?* |
| `21` | 鍐呭椤靛竷灞€妗ｄ綅 | 宸叉墽琛屻€侀棬绂佸叏缁匡紙build 鏈窇锛夛紱**鐪熸満楠岃瘉寰呬汉宸ュ畬鎴?* |

**涓轰粈涔?`22` 鎻掑埌 `21` 鍓嶉潰锛?* 鍐呭 Agent 鐨勬敼鍔ㄩ泦涓湪 `lib/content-data/manifest.ts`銆乣nav.generated.json`銆乣subjects.registry.ts`锛岃€岃繖姝ｆ槸璁″垝 `21` 鐨勬闈㈡垬鍦猴紱瀹冨綋鍓嶆鍦ㄦ敼 `docs/refer/mineru-parsing-guide.md`锛岃鏄庝笅涓€鎵硅浠跺鍏ュ湪璺笂锛岃惤鍦版椂蹇呯劧鍐嶅姩杩欎笁涓枃浠躲€傝鍒?`22` 鍔ㄧ殑鏄?`lib/ai/**`銆乣lib/stores/**`銆乣components/chat/**`锛屼笌鍐呭 Agent 闆堕噸鍙狅紝鍏堝仛娌℃湁鍐茬獊鎴愭湰銆傝鍒?`21` 灏介噺绛夎繖鎵瑰鍏ヨ惤鍦板悗鍐嶅姩銆?
---

## 涓€銆佸苟鍙戜綔涓氶殧绂?
**鍙︿竴涓?Agent 鐨勪綔涓氬煙锛堟垜鏂圭粷瀵逛笉纰帮級锛?*

- `content/**` 鈥斺€?鍏ㄩ儴鏁欏姝ｆ枃銆佷緥棰樸€佹祴楠?JSON
- `public/images/**`銆乣public/media/**` 鈥斺€?鍐呭閰嶅浘涓庡獟浣?- `lib/content-data/**` 閲岀殑**鏁版嵁鏉＄洰**锛堝绉?鏉垮潡/鍐呭椤圭殑鍏蜂綋 name銆乮tems 鏁扮粍銆佸綍闊虫竻鍗曠瓑锛?- `content/.index/`锛堢敓鎴愮墿锛?
**鎴戞柟浣滀笟鍩燂紙鍙︿竴涓?Agent 涓嶄細纰帮級锛?*

- 鏋勫缓涓庡伐鍏烽厤缃細`package.json` scripts銆乣tsconfig.json`銆乣eslint.config.mjs`銆乣knip.json`銆乣vitest.config.ts`銆乣.gitignore`
- `scripts/**`锛堟瀯寤洪摼鑴氭湰涓庡綊妗ｆ暣鐞嗭級
- `components/**`銆乣app/**`锛堥櫎 `content` 鏁版嵁澶栫殑鎵€鏈?tsx/ts锛?- `lib/**`锛堥櫎涓婇潰鐐瑰悕鐨勬暟鎹潯鐩級
- `docs/plans/**`銆乣docs/refer/**`銆乣docs/archive/**`
- `tests/**`锛堟祴璇曚唬鐮侊紱浣嗚涓嬫潯锛?
**鐏拌壊鍦板甫涓庡鐞嗘柟寮忥細**

- `lib/content-data/category-templates.ts`銆乣lib/types/content.ts`锛氳鍒?`21` 浼氱粰**绫诲瀷鍜屾ā鏉?*鍔犲瓧娈碉紙濡?`layoutProfile`锛夈€傚厑璁告敼锛屼絾**缂栬緫鍓嶅繀椤婚噸鏂?Read 璇ユ枃浠?*锛堜笉瑕佷緷璧栧嚑鍗佸垎閽熷墠鐨勮鍙栫粨鏋滐級锛屼笖鍙姞瀛楁銆佷笉鍔ㄤ换浣曞凡鏈夋潯鐩殑鏁版嵁鍊笺€?- `tests/content/**`锛氳繖浜涙槸**鍐呭鏍￠獙**娴嬭瘯锛屾柇瑷€鐨勬槸鍙︿竴涓?Agent 姝ｅ湪浜у嚭鐨勫唴瀹广€傚畠浠け璐?*涓嶆槸**鎴戞柟鐨勯棶棰橈細
  - 涓ョ閫氳繃淇敼 `content/**` 涓嬬殑 markdown 鏉?淇"瀹冧滑銆?  - 涓ョ閫氳繃鏀惧鏂█鏉?淇"瀹冧滑銆?  - 姝ｇ‘鍋氭硶锛氳褰曞け璐ラ」锛屽湪鎶ュ憡閲屽垪鍑猴紝缁х画鑷繁鐨勪换鍔°€?  - 宸茬煡鍩虹嚎澶辫触锛歚tests/content/sophomore-textbooks.test.ts` 鐨?`cell-biology/textbook/ch08-4 鏈夊浘棰樹絾娌℃湁浠讳綍鍥剧墖寮曠敤`銆傛墽琛屾湡闂村彲鑳藉嚭鐜?*鏂扮殑**鍐呭娴嬭瘯澶辫触锛堝鏂规鍦ㄥ悎鍐呭锛夛紝鍚屾牱鍙褰曚笉淇€?
---

## 浜屻€丟it 绾緥锛堣繚鍙嶄細鐮村潖鍙︿竴涓?Agent 鐨勫伐浣滐級

**绂佹锛?*

- `git add -A`銆乣git add .`銆乣git commit -a` 鈥斺€?浼氭妸瀵规柟鐨勫湪閫旀枃浠朵竴璧锋彁浜?- `git stash`锛堜换浣曞舰寮忥級銆乣git reset --hard`銆乣git checkout -- .`銆乣git clean`銆乣git restore .`
- `git pull`銆乣git fetch` + `merge`銆乣git rebase`銆乣git push`銆佷换浣曞垎鏀垏鎹紙`checkout`/`switch`锛?- 浠讳綍浼氶噸鍐欏巻鍙茬殑鎿嶄綔锛坄filter-repo`銆乣commit --amend` 宸叉帹閫佺殑鎻愪氦銆乣rebase -i`锛?- 淇敼 `.git/` 涓嬩换浣曞唴瀹?
**蹇呴』锛?*

- 鍙敤鏄惧紡璺緞鎻愪氦锛歚git add path/a path/b && git commit -m "..."`
- 姣忎釜闃舵锛堣鍒掗噷鏍囦簡 Commit 鐨勫湴鏂癸級鍗曠嫭鎻愪氦锛屾彁浜ょ矑搴﹀皬銆佸彲 revert
- 鎻愪氦鍓嶈窇 `git status --short`锛岀‘璁ゆ殏瀛樺尯**鍙湁**鑷繁鏀圭殑鏂囦欢
- 鑻ュ彂鐜板伐浣滃尯鏈変笉灞炰簬鑷繁鐨勮剰鏂囦欢锛堝鏂圭殑鍦ㄩ€斿唴瀹癸級锛?*鍘熸牱鐣欑潃**锛屼笉瑕佹彁浜ゃ€佷笉瑕佽繕鍘熴€佷笉瑕侀棶
- Commit message 娌跨敤浠撳簱椋庢牸锛坄type(scope): 涓枃鎴栬嫳鏂囨弿杩癭锛?- 鍏ㄧ▼鐣欏湪 **`dev`** 鍒嗘敮锛屼笉鎺ㄩ€併€傛帹閫佷笌 PR 鐢辩敤鎴峰喅瀹氥€?  锛堟敞鎰忥細鏈绾︽棭鏈熺増鏈鍐欎负 `master`銆傜湡瀹炲伐浣滃垎鏀槸 `dev`锛宍master` 钀藉悗浜庡畠銆傚鍙戠幇鑷繁涓嶅湪 `dev` 涓婏紝鍋滀笅鏉ユ姤鍛婏紝涓嶈鑷鍒囨崲銆傦級

---

## 涓夈€佹ā鍨嬩笌宸ュ叿

- 鎵€鏈夊瓙鏅鸿兘浣撶粺涓€浣跨敤 **Cursor Grok 4.6 Xhigh Fast**锛岀敱涓绘櫤鑳戒綋鍦ㄦ淳鍙戞椂鎸囧畾锛屽瓙鏅鸿兘浣撹嚜韬笉鍐嶆淳鍙戝叾浠栨ā鍨嬬殑瀛愪换鍔°€?- 鐜锛歐indows 10 / PowerShell / pnpm銆傝矾寰勭敤鍙嶆枩鏉犳垨寮曞彿鍖呰９锛屾敞鎰?PowerShell 鐨勫紩鍙蜂笌缂栫爜鍧戯紙浠撳簱閲屾湁澶ч噺涓枃鏂囦欢鍚嶏紝`Test-Path` 瀵规煇浜涘瓧绗︿細鎶ラ敊锛屾敼鐢?`git ls-files` 鎴?`Get-ChildItem -LiteralPath`锛夈€?- 鏂囦欢鎿嶄綔涓€寰嬬敤 Read / StrReplace / Write / Glob / Grep 宸ュ叿锛屼笉瑕佺敤 `cat`/`sed`/`awk`/`echo >`銆?  **杩欐潯涓嶆槸椋庢牸鍋忓ソ銆?* 鏈绾︽枃浠惰嚜韬氨鏄弽闈㈡暀鏉愶細瀹冨綋鍒濊 PowerShell 閲嶅畾鍚戝啓鍑猴紝涓枃缁?GBK 鏈夋崯杞崲锛岃惤鐩樻椂鐣欎笅 121 涓潪娉?UTF-8 瀛楄妭锛屽鑷存暣浠芥枃浠跺湪閮ㄥ垎宸ュ叿閲岃В鐮佸洖閫€鎴?Latin-1銆侀€氱瘒涔辩爜锛岃€屽畠鎭版伆鏄瘡涓瓙鏅鸿兘浣撳紑宸ュ繀璇荤殑瀹堝垯銆傜敤 Write / StrReplace 鍐欐枃浠朵笉浼氭湁杩欎釜闂銆?- 绔彛锛歚pnpm dev` 鍥哄畾 `35349`锛堣 package.json锛夈€傝捣浜?dev server 璁板緱鍦ㄤ换鍔＄粨鏉熷墠鍏虫帀銆?
---

## 鍥涖€侀獙璇佺邯寰?
姣忎釜闃舵瀹屾垚鍚庤嚦灏戣窇锛?
```powershell
pnpm exec tsc --noEmit
pnpm lint
pnpm test:react
```

璁″垝鍏ㄩ儴瀹屾垚鍚庡啀璺戝畬鏁?`pnpm test`銆傚尯鍒嗕袱绫诲け璐ワ細

- **浠ｇ爜澶辫触** 鈫?蹇呴』淇埌缁?- **鍐呭澶辫触**锛坄tests/content/**`锛夆啋 璁板綍锛屼笉淇紙瑙佺涓€鑺傦級

涓嶈涓轰簡璁╂祴璇曢€氳繃鑰屽垹闄?璺宠繃娴嬭瘯鐢ㄤ緥銆傜‘闇€璋冩暣鏂█鐨勶紝蹇呴』鍦ㄦ姤鍛婇噷鍗曞垪骞惰鏄庣悊鐢便€?
---

## 浜斻€佷氦浠樼墿

姣忎釜鎵ц鍨嬪瓙鏅鸿兘浣撳湪瀹屾垚鍚庯紝鍚戣皟鐢ㄦ柟杩斿洖涓€浠界粨鏋勫寲鎶ュ憡锛屽寘鍚細

1. 姣忎釜闃舵鐨?commit hash 涓庝竴鍙ヨ瘽璇存槑
2. 瀹為檯鏀瑰姩涓庤鍒掔殑**鍋忓樊**锛堣鍒掗噷鍐欑殑鍋氭硶鍦ㄧ湡瀹炰唬鐮侀噷涓嶆垚绔嬫椂浣犳€庝箞澶勭悊鐨勶級锛岃繖鏄渶閲嶈鐨勪竴鑺?3. 璁″垝閲岃姹傚啓鍏?鎵ц璁板綍"鐨勬暟鎹紙濡?knip 棣栬窇鏁伴噺銆乸ersist name 娓呭崟銆佹姈鍔ㄥ抚鏁帮級
4. 鏈畬鎴愰」涓庡師鍥?5. 閬楃暀椋庨櫓 / 缁欓獙鏀舵柟鐨勯噸鐐规鏌ユ彁绀?
鍚屾椂鎶?1锝? 杩藉姞鍐欒繘瀵瑰簲璁″垝鏂囨。鏈熬鐨?`## 鎵ц璁板綍` 灏忚妭銆?
---

## 鍏€佹棦鎴愪笉鍙橀噺锛堝悗缁鍒掍笉寰楀洖閫€锛?
杩欎簺鏄墠搴忚鍒掍粯鍑轰唬浠锋崲鏉ョ殑缁撹锛屾敼鍔ㄧ浉鍏充唬鐮佹椂蹇呴』淇濇寔銆?
**婊氬姩濂戠害锛堣鍒?`19` 寤虹珛锛岀粡涓夎疆鐪熸満楠岃瘉锛?*

- **閫€鍑鸿创搴曡窡闅忓彧璁ょ湡瀹炵敤鎴锋墜鍔?*锛歚wheel` 鐨?`deltaY < 0`銆佷笅鎷?`touchmove`銆乣PageUp`/`ArrowUp`/`Home`銆佹粴鍔ㄦ潯 gutter 鎷栨嫿銆?- **`scrollTop` 浣嶇疆鍙敤浜?鐢ㄦ埛婊戝洖搴曢儴鍚庤嚜鍔ㄦ仮澶嶈窡闅?**锛岀粷涓嶇敤浜庡弽鎺?鐢ㄦ埛鏄惁鎯崇寮€搴曢儴"銆?- 鍘熷洜锛氬唴瀹归缂╋紙濡?`AgentTrace` 鎬濊€冨潡鎶樺彔锛変細璁╂祻瑙堝櫒鎶?`scrollTop` 澶瑰埌 0锛岀敤浣嶇疆鍙嶆帹浼氭妸杩欎釜绋嬪簭鎬т笅闄嶈鍒ゆ垚鐢ㄦ埛涓婃粦锛岃窡闅忎竴鏂紝鏁存娴佸紡閮戒笉鍐嶈窡闅忊€斺€旇繖灏辨槸鐢ㄦ埛鍙嶉"鐢熸垚鏃舵暣椤靛拷涓婂拷涓?鐨勭湡姝ｆ満鍒躲€?- 娑夊強 `components/chat/ChatThread.tsx`銆乣lib/hooks/useStickToBottom.ts`銆?*涓嶈閫€鍥炵敤 `scrollHeight - scrollTop - clientHeight` 鍒ゆ柇鐢ㄦ埛鎰忓浘銆?*
- 璐村簳鐘舵€佷笅鍐呭鏀剁缉鏃跺簲缁х画閽変綇鏂扮殑 `scrollHeight - clientHeight`锛屼笉瑕佸仠鍦ㄥ崐鎴€?- `AgentTrace` 鎶樺彔鐨?`max-height` 杩囨浮锛堢害 160ms锛夋槸鎶婄粨鏉熷抚鐨勬暟鐧?px 鍗曡烦鎽婃垚 10锝?4px 鍙伴樁鐨勫叧閿紝**涓嶈鏃犳晠鎷嗘帀**銆?- `.chat-message` 涓嶅緱鍐嶄娇鐢?`content-visibility` / `contain-intrinsic-size`锛堜笌 tanstack 鐨?`measureElement` 鍐茬獊锛夈€傚綋鍓嶆槸 `contain: style paint`锛涜嫢寰€娑堟伅姘旀场閲屽姞**闈?portal** 鐨勬诞灞傦紙涓嬫媺銆佹皵娉℃彁绀猴級锛岄渶閲嶆柊璇勪及閫€鍒?`contain: style`銆?
**绐楀彛灞傚绾︼紙璁″垝 `19` 瀹氫綅锛岃鍒?`20` 鏀舵暃锛?*

- AI 瀵硅瘽浜х墿锛坅rtifact / document / imageGen锛夌殑娴獥灞炰簬 `AppShell` 鐨?*鍏ㄥ眬绐楀彛灞?*锛宍createPortal` 鍒?`document.body`锛涘畠浠棦涓嶅睘浜庡彸渚ч潰鏉匡紝涔熶笉灞炰簬涓棿绗旇鍖恒€備换浣曟柊娴眰閮藉繀椤?portal 鍒?body锛屼笉瑕佸亣瀹氱鍏堟病鏈?`contain` / `transform` 閫犳垚鐨勫寘鍚潡銆?- **娴獥澶栧３鍞竴瀹炵幇鏄?`components/window/ManagedWindow.tsx`**锛堥厤濂?`lib/hooks/useManagedWindowChrome.ts`锛夈€傚叓涓?viewer 宸插叏閮ㄨ縼鍏ャ€傛柊澧炴诞绐椾竴寰嬪鐢ㄥ畠锛?*涓嶈鍐嶆墜鍐?`useDraggable` + `useResizable` + `createPortal` + `WindowChrome` 鐨勯偅濂楃粍鍚?*鈥斺€旀鏄繖濂楅噸澶嶄簡鍏亶鐨勬牱鏉块€犳垚浜嗙敤鎴锋姳鎬ㄧ殑"鏀逛簡鍗婂ぉ娌″弽搴?锛堟敼鍒颁簡閿欒鐨勫壇鏈級銆?  - 渚嬪锛歚components/chat/BillingDashboard.tsx` 鏈夋剰鏈縼绉伙紝瀹冩槸 `absolute` + 鑷畾涔夋嫋鎷斤紝涓嶆槸 portal 娴獥锛堥厤濂楀叆鍙?`lib/window/openBillingDashboard.ts`锛夈€傚畠鏄?`components` 涓嬪敮涓€杩樼暀鐫€ `useResizable(` 鐨勭獥鍙ｇ被缁勪欢锛屾壂姝讳唬鐮佹椂涓嶈璇垽銆?- 绗旇鏍忓鍣?id 鍙兘閫氳繃 `lib/constants/layout.ts` 鐨?`NOTES_PANEL_ID` 寮曠敤锛屼笉瑕佸啀鍑虹幇 `getElementById("notes-panel")` 瀛楅潰閲忋€?- `fullscreenTarget` 鐨勯粯璁ゅ€兼槸 **`notes`**锛堝榻愮瑪璁版爮锛夛紝涓嶆槸 viewport銆傝繖鏄縼绉诲墠鍏釜 viewer 鐨勬棦鏈夎涓猴紝璁″垝 `20` 鎸夌幇缃戣涓轰繚鐣欙紱鐢ㄦ埛鍙湪璁剧疆閲屽垏鎴愭暣绐楋紙`artifactFullscreenTarget`锛夈€?  涓嶅彉閲忔槸銆宍notes` 鍏ㄥ睆鐨勭煩褰?*绮剧‘绛変簬楠屾敹褰撳満** `#notes-panel` 鐨?rect 涓?`borderRadius: 0`銆嶏紝**涓嶆槸鏌愪釜鍥哄畾鏁板瓧**鈥斺€斾晶鏍忓搴︺€佸骞村竷灞€涓€鍙樺畠灏变細婕傘€傞獙鏀舵椂蹇呴』鍏堝綋鍦鸿涓€娆?`#notes-panel` 鐨?rect 鍐嶅姣旓紝涓嶈鎷垮埆杞殑鏁板瓧鍒ゅ洖閫€銆?  涓よ疆瀹炴祴锛堝潎涓?1440脳900 瑙嗗彛锛夛細璁″垝 `20` 褰撴椂 notes 鏄?`{274, 48, 719脳852}`锛岃鍒?`22` 绗笁鎵瑰綋鏃舵槸 `{267, 48, 702脳852}`锛屼袱杞悇鑷兘涓庡綋鍦?rect 绮剧‘鐩哥瓑 鈥斺€?鏁板瓧涓嶅悓锛屽绾︽湭鐮淬€?  鍙︿袱鏉¤涓€璧蜂繚浣忥細`viewport` 鏄?`{0, 0, 1440脳900}`锛岃蛋 `resolveFullscreenRect` 鐨勬暣绐楃煩褰紝**涓嶆槸绌哄疄鐜?*锛涢€€鍑哄叏灞忎細杩樺師鍒板叏灞忓墠鍑犱綍銆?  宸茬煡鐜扮爜琛屼负锛堜笉鏄紡閰嶏級锛氬垝璇嶆诞绐楄蛋鑷繁鐨?notes 鍥炶皟锛?*涓嶅彈 `artifactFullscreenTarget` 璁剧疆褰卞搷**锛涘垏"鏁翠釜绐楀彛"鍙綔鐢ㄤ簬 artifact / document銆?- `FloatingChatWindow` 浼?`registerOverlay={false}`鈥斺€斿畠涓嶈繘 overlay 鏍堬紝Esc 涓嶅叧瀹冿紝杩欐槸蹇犲疄浜庤縼绉诲墠鐨勮涓猴紝**涓嶆槸婕忛厤**銆傚疄娴?Esc 閾句笉浼氬洜姝ゅ崱浣忥紝鍚庨潰鐨勭獥浠嶆寜 z 搴忛€愪釜鍏抽棴銆?- 涓や釜绐楀彛鍚屾椂鍏ㄥ睆鏃讹紝鍚庡叏灞忕殑浼氭妸鍓嶄竴涓嚜鍔ㄦ渶灏忓寲锛堟姢鏍忕敤渚嬶細`tests/windowManager.test.ts` 鐨?`fullscreen auto-minimizes other fullscreen windows`锛夈€?- **宸ュ叿 id `renderInteractive` 涓嶅緱鏀瑰悕銆?* 瀹冨凡闅忚亰澶╁巻鍙叉寔涔呭寲杩?IndexedDB锛屾敼鍚嶉渶瑕侀厤濂楀瓨鍌ㄨ縼绉汇€俇I 鏂囨缁熶竴鍙?HTML 婕旂ず"锛屼絾 id 鍐荤粨銆?
**Agent 涓庣姸鎬佸绾︼紙璁″垝 `22` 寤虹珛锛岀粡涓夋壒绔祴楠岃瘉锛?*

- **宸ュ叿鐩綍鏄敮涓€鐪熺浉婧愩€?* 姣忎釜宸ュ叿涓€涓?`lib/ai/agent/tools/<name>/` 鐩綍锛?3 涓細`types.ts` / `presentation.ts` / `tool.ts`锛夛紝鏈?UI 鐨勫啀閰?`components/chat/toolCards/<name>Card.tsx`锛? 涓級銆傚崱鐗囬『搴忕敱 `components/chat/toolCards/registry.tsx` 鐨?`RESULT_CARD_ORDER` 鍐冲畾锛沗components/chat/ChatMessage.tsx` 閲?*涓嶅緱鍐嶅嚭鐜板伐鍏峰悕瀛楅潰閲?*锛堝凡娓呴浂锛屽埆鍐欏洖鍘伙級銆?- **瀹㈡埛绔笉寰楀鍏ヤ换浣?`tool.ts` / `server.ts`銆?* 鍏 `no-restricted-imports` 瑙勫垯锛坄components/**`銆乣lib/hooks/**`銆乣components/notes/**`銆乣RightPanel.tsx`銆乣components/interactives/**`銆乣components/canvas/**`锛夊潎涓?`error`锛屽凡瀹炴祴鑳芥嫤浣忋€傜牬浜嗚繖鏉′細鎶婂瘑閽ヨ鍙栭€昏緫鎵撹繘娴忚鍣?bundle 鎴栨姤 `fs` 鎵句笉鍒帮紱`lib/ai/agent/tools/index.ts` 鐨勫叕鍏卞啀瀵煎嚭锛堟爣浜?`@public`锛?*涓嶈椤烘墜鎶?`tool.ts` 鎸備笂鍘?*銆?- **store 娓呯偣鍙ｅ緞锛?8 涓級锛?* `lib/stores/` 涓嬫帓闄ゆ祴璇曚笌 `_persist.ts` 鍏?28 涓枃浠?= `from "zustand"` 鐨?`create(` **22** 涓?+ `createPersistedStore` 鍖呰 **6** 涓紙artifacts / documents / imageGen / skills / reviewCards / billing锛夈€傚彧鐢?`git grep 'from "zustand"'` 浼氭紡鎺?`chatHistory` / `chatUI` / `tokenTracker` / `floatingTokenTracker` 杩?4 涓紙鍐欐硶涓嶇粺涓€锛夈€備互鍚庢竻鐐瑰繀椤绘寜杩欎釜鍙ｅ緞锛屽惁鍒欎細璇垽"store 鍙樺皯浜?銆?- **persist 鍚嶄笉寰楁敼銆?* 鎵€鏈?`persist` 鐨?key 閮藉凡钀藉湪鐢ㄦ埛鐨?localStorage / IndexedDB 閲岋紝鏀瑰悕绛変簬璁╃敤鎴锋暟鎹嚟绌烘秷澶憋紱璁″垝 `22` 鎼 28 涓?store 鏃堕€愪釜鏍稿杩?key 鏈彉锛堢涓€鎵圭娴嬪疄娴嬫棤鏁版嵁涓㈠け锛夈€?- `chat-history` 閿笉瀛樺湪鏄?v2 鐨勯鏈熷舰鎬侊紙manifest + 鍒嗙墖锛夛紝**涓嶆槸鏁版嵁涓㈠け**銆?
**鍒嗗眰濂戠害锛堣鍒?`23` 寤虹珛锛?*

- **`lib/**` 涓嶅緱 import `components/**`銆?* `eslint.config.mjs` 閲岄偅鏉?`no-restricted-imports` 宸叉槸 **`error` 涓旈浂渚嬪**锛堝師涓?`warn`锛?7 澶勫瓨閲忓凡娓呴浂锛夈€傝鍔犺眮鍏嶅氨鏄湪鐮村潖杩欐潯瑙勫垯瀛樺湪鐨勭悊鐢扁€斺€旂湡 UI 涓€寰嬫斁 `components`锛宍lib` 鍙斁 types / presentation / tool銆?- **鎵佸钩閰嶇疆鐨勫潡搴忎笉鍙墦涔?*锛歚files: ["lib/**"]`锛堢 97 琛岄檮杩戯級蹇呴』鎺掑湪 `files: ["lib/hooks/**"]`锛堢 106 琛岄檮杩戯級**涔嬪墠**锛屽惁鍒?hooks 浼氫涪鎺?`tool.ts` 杈圭晫銆傚洓涓竟鐣屽潡锛坄components/** + lib/hooks/**`銆乣components/notes/** + RightPanel + interactives`銆乣components/canvas/**`銆乣lib/hooks/**`锛夌洰鍓嶅叏涓?`error`銆?- **鎸囦护娉ㄥ唽琛ㄧ殑鐜凡鏂紝涓嶈鎶婂畠鎺ュ洖鍘汇€?* 鏇剧粡瀛樺湪鐨勭幆鏄細
  `components/quiz/QuizMarkdown.tsx` 鈫?`components/shared/directives/registry.ts` 鈫?`components/shared/directives/MemoryCard.tsx` 鈫?鍥炲埌 `QuizMarkdown.tsx`銆?  璁″垝 `23` 鍒犳帀浜?`QuizMarkdown` 閲?`useMemo` 寤惰繜灞曞紑鐨勭粫琛屻€佹敼鎴愭ā鍧楅《灞傚睍寮€锛屽綋鏃舵病鎶ラ敊鎵€浠ュ垽瀹氬畨鍏ㄢ€斺€?*浣嗛偅鏄繍姘?*銆備簨鍚庣敤姹傚€奸『搴忔祴璇曞疄娴嬶細**鍏堟眰鍊?`registry.ts` 鏃?`blockComponents` 鍙墿 `table` / `img`锛?4 涓寚浠ょ粍浠惰闈欓粯涓㈠純**锛堥《灞傚睍寮€璁块棶鍒版湭鍒濆鍖栫殑 `const`锛岃€?`{...undefined}` 鍚堟硶锛夛紝鎺у埗鍙板共鍑€銆侀〉闈笉鎶ラ敊銆傚巻鍙蹭笂鍚屼竴涓幆杩樹互 `Cannot access 'directiveComponents' before initialization` 鐨勫穿婧冨舰鎬佸嚭鐜拌繃涓€娆°€?  鐜板湪鐨勭粨鏋勶紙`fdce7907`锛夛細`components/quiz/QuizMarkdownBase.tsx` 鏄?*鍙跺瓙**娓叉煋鍣紝**姘镐笉 import 鎸囦护 registry**锛沗QuizMarkdown` = Base + `directiveComponents`锛沗MemoryCard` 鍙?import Base銆?  **绾㈢嚎**锛歚QuizMarkdownBase` 涓嶅緱 import `components/shared/directives/registry`锛堢洿鎺ユ垨闂存帴鍧囦笉鍙紝娉ㄦ剰 `ContentImage` 閭ｆ潯閾句篃瑕佷繚鎸佸共鍑€锛夛紱`MemoryCard` 涓嶅緱鏀瑰洖 import `QuizMarkdown`銆侻emoryCard 鍐呴儴鑻ヨ鏀寔宓屽鎸囦护锛岀敤 props 娉ㄥ叆鎸囦护鏄犲皠锛?*涓嶈**閲嶆柊 import registry銆?  **鎶ゆ爮**锛歚components/shared/directives/registry.evaluation-order.test.tsx` 鎸夊洓绉嶆眰鍊奸『搴忔柇瑷€ 14 涓寚浠ら敭榻愬叏涓旀瘡涓€奸兘鏄嚱鏁扳€斺€斿畠鍚屾椂鎶撳穿婧冧笌闈欓粯绌烘槧灏勪袱绉嶅舰鎬併€?*涓嶈鍓婂急杩欎釜娴嬭瘯**锛堝挨鍏朵笉瑕佸彧鏂█閿瓨鍦ㄨ€屼笉鏂█鏄嚱鏁帮紝鍗犱綅绗︿細婕忚繃鍘伙級銆?  宸查噺鍖栵細鍏ㄩ噺 3201 涓鏂囨枃浠躲€?11 涓?`:::memory` 鍧楀唴**闆跺**宓屽鎸囦护锛屾晠鏂幆甯︽潵鐨勩€孧emoryCard 鍐呬笉鏀寔宓屽鎸囦护銆嶅鐜版湁姝ｆ枃闆跺奖鍝嶃€?
**鎸囦护灞炴€цВ鏋愶紙璁″垝 `24` 寤虹珛锛?*

- **`normalizeDirectiveLabels` 鐨勫睘鎬ц竟鐣屽彧鑳芥寜鐧藉悕鍗曞垽瀹氾紝涓嶅緱閫€鍥炲舰鐘跺尮閰?`/\s+[\w-]+=/`銆?* 缁撴瀯涓?`mode=cloze` 涓庢爣棰樻鏂囬噷鐨?`k=0`銆乣y=10sin(鈥?`銆乣A260=1.0` 瀹屽叏鍚屽舰锛屽舰鐘跺尮閰嶄細鎶婂叕寮忚鍒囨垚灞炴€с€佹妸鏍囬鎴柇锛堟鏂囧疄娴?2 澶勶級锛屽苟璁╂爣棰樺唴宓?ASCII 寮曞彿鐨勫啓娉曪紙姝ｆ枃瀹炴祴 21 澶勶紝濡?`{label="鐔?鐨勬湰璐▆`锛夐€€鍥?remark-directive 瑙ｆ瀽涓嶄簡鐨勫舰鐘垛€斺€斿嵆 `24738d98` / `72c7464d` 淇帀鐨勫師濮嬬己闄峰鍙戙€傚噣鏁堟灉鏄€屼慨濂?78 澶勩€佹墦鍧?23 澶勩€嶃€?- `lib/markdown/normalizeDirectiveLabels.ts` 鐨?`KNOWN_ATTRS` 蹇呴』涓?`lib/markdown/remarkDirectives.ts` 閲岃鍙栫殑 `attrs.*` 淇濇寔鍚屾锛堝綋鍓?29 涓級銆?*鏂板鎸囦护灞炴€ф椂蹇樹簡鍚屾锛岃灞炴€у氨浼氳褰撴垚鏍囬姝ｆ枃鍚炴帀**锛屼笖涓嶄細鏈変换浣曟姤閿欍€?- 甯﹀紩鍙风殑鍊硷紝灞炴€ц竟鐣屾悳绱㈠繀椤讳粠**闂悎寮曞彿涔嬪悗**寮€濮嬶紝鍚﹀垯 `{label="鐢?width=3 鐢诲浘" mode=cloze}` 浼氳鍒囪繘寮曞彿鍐呴儴銆?- 鎶ゆ爮锛歚lib/markdown/normalizeDirectiveLabels.test.ts` 鏈?4 渚嬩笓閽夎繖鏉★紙鏈姞寮曞彿鍚叕寮?脳2銆佹爣棰樺唴宓屽紩鍙枫€佸紩鍙峰唴鍚櫧鍚嶅崟璇嶏級銆傚垽鎹竴閫€鍥炲舰鐘跺尮閰嶅畠浠珛鍒诲彉绾€?- **璁板繂鍗℃鏂囪蛋 `hProperties.raw`锛坮emark 浠庢簮鏂囦欢鍒囧嚭鐨勫師鏂囷級锛屼笉鏄粠宸茶В鏋?React 鏍戝洖鎶姐€?* 鍥炴娊鎸夋瀯閫犳湁鎹燂細`<strong>` 涓?`**`銆乧heckbox 涓?`- [ ]`銆並aTeX 鍦?`dangerouslySetInnerHTML` 閲屽洖鎶戒负绌恒€俙MemoryCard.extract()` **淇濈暀**涓鸿亰澶╀晶鍏滃簳锛圓I 娴佸紡鑺傜偣娌℃湁 position锛夛紝涓嶈鍒犮€?- `raw` 鐨?8 KB 涓婇檺锛氳秴闄愰€€鍥?`extract()`銆傚疄娴嬫渶澶у崟鍗?4168 瀛楃锛岄槇鍊间粠鏈Е鍙戯紱涓綅椤甸潰鍥?`raw` 澧為噸绾?1.3 KB銆佹渶閲?8.1 KB锛坮eact-markdown 浼氭妸 `hProperties` 鍚屾椂浣滀负 prop 鍜?`node.properties` 浼犱笅鍘伙紝鏁呰涓や唤锛夈€?
**甯冨眬妗ｄ綅濂戠害锛堣鍒?`21` 寤虹珛锛?*

- **銆屾樉绀哄摢浜?tab / 鍝簺鏍忋€嶇殑鍞竴鍒ゆ嵁鏄?`lib/content/layoutProfile.ts`**锛坄resolveLayoutProfile` + `layoutFlags`锛夛紝涓夋。 `full` / `article` / `reference`銆俙ContentPageClient` **涓嶅緱**鍐嶇洿鎺ョ敤 `renderType === 'markdown'` 鍐冲畾渚嬮/娴嬮獙 tab锛宍RightPanel` 涓嶅緱鍐欐鍏ㄩ儴 tab銆?- **`RightTab` 娲剧敓鑷?`LayoutRightTab`锛屼笉瑕佸湪 `lib/stores/ui.ts` 閲岄噸鏂板啓涓€浠藉悓褰㈠瓧闈㈤噺銆?* 鏂瑰悜鏄?`ui.ts` 鈫?`layoutProfile.ts`锛堝弽鍚戜細鎴愮幆锛屾墍浠ョ被鍨嬬湡鐩告簮鍦?`layoutProfile.ts`锛夈€備袱澶勫悇鍐欎竴浠界殑璇濓紝鏂板绗簲涓彸鏍?tab 鏃朵笉浼氭湁浠讳綍缂栬瘧閿欒锛岃€?`resolveRightTabs` 姘歌繙涓嶅悙鍑哄畠鈥斺€旇 tab 浼氬湪鎵€鏈夋。浣嶄笅**闈欓粯娑堝け**銆?- **涓棿 tab 鐨勯潪娉曞€煎洖閫€蹇呴』鍦ㄦ覆鏌撴湡娲剧敓锛屼笉鑳界敤 effect 閲?`setState`銆?* `react-hooks/set-state-in-effect` 鐜颁负 error銆?- **`AppShell` 鐨勫垎鏍忕粨鏋勪粠銆岃矾鐢?+ manifest銆嶅綋鍦虹畻锛屼笉瑕佸彧绛?store銆?* `setActiveRoute` 鍦?effect 閲岋紝绛?store 浼氭櫄涓€甯ф媶閿欐爮銆俿tore 浠嶇劧鍐欙紝渚?`RightPanel` 娑堣垂銆?- **`autoSaveId` 鎸夋。浣嶅垎妗?*锛歚full` 缁х画鐢ㄦ棫 key `gailvlun-layout-v2`锛屽叾浣欐。浣嶇敤鍚勮嚜鐨?key鈥斺€斿惁鍒?article 鎶樺彔鍚庣殑瀹藉害浼氬啓鍥炲苟姹℃煋璇﹁В涓夋爮銆傚彸鏍忔姌鍙犺蹇嗙殑鏂?persist key 鏄?`gailvlun-right-collapsed-by-profile`锛堟柊澧?key 鍙互锛屼絾**宸叉湁 key 涓€寰嬩笉寰楁敼鍚?*锛岃涓婃枃 Agent 涓庣姸鎬佸绾︼級銆?- **`loader.ts` 閲屼笉寰楀啀鍑虹幇 `"chapters"` 瀛楃涓茬壒鍒ゃ€?* 鐩綍褰㈡€佺敱 `subjects.registry.ts` 鐨?`contentRoot.detail`锛坄subject-tree` | `legacy-chapters`锛夊０鏄庯紝璺緞鎷兼帴缁熶竴璧?`lib/content/contentPaths.ts` 鐨?`CONTENT_PATH_RESOLVERS`銆傛敼杩欎釜鏋氫妇鏃?*蹇呴』鍚屾 `scripts/check-registry-consistency.ts`**锛屽惁鍒?`prebuild` 浼氳鍒ゆ枃浠剁己澶便€?- 浜у搧鍙缁撴灉锛氭暀鏉?/ 璇句笂褰曢煶娌℃湁 `media` 鑳藉姏锛屽彸渚т笉鍐嶅嚭鐜扮┖鐨勩€屽姩鐢汇€嶃€屽彲浜や簰銆峵ab锛涜瑙ｄ粛鏄洓 tab銆傝繖鏄寜鑳藉姏椹卞姩鐨勯鏈熻涓猴紝涓嶆槸鍥炲綊銆?
**"鍙充晶 Agent 閲岄偅涓彲瑙嗗寲 HTML"鐨勫敮涓€鍏ュ彛**

鐢ㄦ埛鏇惧洜涓烘壘閿欐枃浠跺弽澶嶆敼鍔ㄦ棤鏁堛€傛纭摼璺槸鍗曚竴鐨勪竴鏉★紝鏀瑰姩鍓嶅厛璁ゅ噯锛?
`lib/ai/agent/tools/renderInteractive/tool.ts`锛堟湇鍔＄瀹氫箟锛夆啋 `lib/ai/artifact.ts` 鈫?`/api/artifact` 鈫?`components/chat/toolCards/renderInteractiveCard.tsx`锛堢粨鏋滃崱鐗囷級鈫?`components/chat/ArtifactCard.tsx` 鈫?`lib/hooks/useArtifacts.ts` 鈫?**`components/chat/ArtifactViewer.tsx`**锛堝叏灞€娴獥锛屾渶缁堝憟鐜帮級

> 璺緞宸蹭袱娆″彉鍔細璁″垝 `22` 鎶婂崟鏂囦欢 `lib/ai/agent/tools.ts` 鎷嗘垚浜?`lib/ai/agent/tools/<name>/` 鐩綍锛岃鍒?`23` 鍙堟妸缁撴灉鍗＄墖浠?`lib/.../ResultCard.tsx` 绉诲埌浜?`components/chat/toolCards/<name>Card.tsx`銆?*`lib` 渚х幇鍦ㄥ彧鏈?types / presentation / tool锛屼换浣?UI 閮藉湪 `components`銆?*

鎼滅储鏃剁敤銆屽彲瑙嗗寲 HTML銆嶃€孒TML 婕旂ず銆嶆垨 `renderInteractive` 杩欎笁涓瘝涔嬩竴銆?*鍙悳銆屽彲瑙嗗寲銆嶄袱涓瓧浼氳鍏?* `components/interactives/registry.ts` 閲屼竴鍫嗐€屆椕楀彲瑙嗗寲銆嶅拰 `ChatMessageVisualizations.tsx`锛涘彧鎼?`interactive` 浼氳繘鍙充晶銆屽彲浜や簰銆峵ab銆?
瀹?*涓嶆槸**涓嬮潰杩欎笁涓紝涓嶈鏀归敊锛?
- `components/interactives/**` 鈥斺€?鍙充晶"鍙氦浜?tab 閲岀殑鎵嬪啓 React 缁勪欢锛屼笌 AI 浜х墿鏃犲叧
- `components/canvas/renderers/HtmlRenderer.tsx` 鈥斺€?娑堟伅鍐呰仈 iframe
- `components/notes/**` 鈥斺€?涓棿绗旇鍖猴紝鍘嗗彶涓婃浘琚鍔犵粍浠剁殑鍦版柟

璇﹁ `docs/refer/rendering-architecture.md` 鐨?鍥涙潯娓叉煋璺緞"涓€鑺傘€?
---

## 涓冦€侀亣鍒伴樆濉炴椂

- 璁″垝涓庣湡瀹炰唬鐮佸啿绐侊紙鏂囦欢涓嶅瓨鍦ㄣ€佽鍙峰涓嶄笂銆丄PI 鐗堟湰涓嶅悓锛夛細**浠ョ湡瀹炰唬鐮佷负鍑?*锛屾寜璁″垝鐨?*鎰忓浘**璋冩暣鍋氭硶锛屽苟鍦ㄦ姤鍛婄殑"鍋忓樊"涓€鑺傚啓娓呫€?- 涓嶈涓轰簡鐓ф惉璁″垝鑰屽埗閫犱笉鍚堢悊鐨勪唬鐮併€?- 涓嶈鎵╁ぇ浣滀笟鑼冨洿鍘?椤烘墜浼樺寲"璁″垝澶栫殑涓滆タ鈥斺€旈偅浼氳 commit 鏃犳硶浜屽垎瀹氫綅銆?- 鐪熸鏃犳硶鍐虫柇鐨勶紙娑夊強浜у搧鍙栬垗銆佹暟鎹畨鍏ㄣ€侀渶瑕佺敤鎴烽€夋嫨鐨勶級锛屽仠涓嬫潵鍦ㄦ姤鍛婇噷璇存槑锛屼笉瑕佺寽銆?
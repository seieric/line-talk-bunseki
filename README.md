# LINEトーク分析

![](https://raw.githubusercontent.com/seieric/line-talk-bunseki/main/eyecatch.png "LINE Talk Analyzer")

LINEアプリで出力したLINEのトーク履歴を分析します。

## 取得可能なデータ
- ✅頻出ワードとその登場回数（31回以上の語句のみ）
- 😆ユーザー別送信数
- 📅日付別送信数
- 📞グループ通話数
- 🔗URL数
- 🎉あみだくじ数
- 💤スタンプ数
- 📸写真数
- 🙋‍連絡先数
- 📂ファイル数
- 💭総メッセージ数
言語設定が日本語以外の端末やLINEで出力したデータは正しく分析できないことがあります。(Japanese environment only.)

## ダウンロードとインストール
**動作には[MeCab](https://taku910.github.io/mecab/)（形態素分析ライブラリ）がインストールされた環境が必要です。([mecab-ipadic-NEologd ](https://github.com/neologd/mecab-ipadic-neologd)の追加インストール推奨)[^1]**

まず、このリポジトリをクローンしてください。
```bash
git clone https://github.com/seieric/line-talk-bunseki.git
```

次に、依存モジュールをインストールします。
```bash
cd line-talk-bunseki
npm install
```
これでインストールは完了です。

[^1]: LINEのトーク履歴は話し言葉が多いため、MeCab以外の形態素分析ライブラリではまともな分析結果が得られませんでした。追加辞書もほぼ必須です。（もちろんなくても使えますが。）
## 使い方
引数にLINEで出力したトーク履歴のテキストファイルを渡すだけです。
```bash
npm run analyze /path/to/your-text-file.txt
```
MeCabで既定辞書以外を使う場合やMeCabのバイナリを指定する場合は、環境変数LA_MECAB_COMMANDで指定できます。[^2]

mecab-ipadic-NEologdを使用する場合：
```bash
LA_MECAB_COMMAND='mecab -d /usr/local/lib/mecab/dic/mecab-ipadic-neologd'
export LA_MECAB_COMMAND
```

MeCabのバイナリを指定する場合：
```bash
LA_MECAB_COMMAND='/path/to/your/mecab/binary'
export LA_MECAB_COMMAND
```

[^2]: 使用する辞書は[mecab-ipadic-NEologd](https://github.com/neologd/mecab-ipadic-neologd)を推奨。

実行時間は、トーク履歴のサイズによります。メッセージ件数3000件程度のファイルで9秒かかりました。実行結果の例はこちら。（内容は改変しているので不整合。）
```
頻出ワード
┌──────────────────────┬────────┐
│       (index)        │ Values │
├──────────────────────┼────────┤
│         参加          │   80   │
│         投票          │   80   │
│         今日          │   75   │
│         提出          │   74   │
│ よろしくお願いします     │   73   │
│         てる          │   73   │
│          方           │   68   │
│         団体          │   68   │
│         時間          │   67   │
└──────────────────────┴────────┘
ユーザー別送信数
┌─────────────────────────┬────────┐
│         (index)         │ Values │
├─────────────────────────┼────────┤
│         seieric         │  189   │
│          Octcat         │  175   │
│          たろう          │  162   │
└─────────────────────────┴────────┘
日付別送信数
┌─────────────────┬────────┐
│     (index)     │ Values │
├─────────────────┼────────┤
│ Tue Sep 21 2021 │   22   │
│ Wed Sep 29 2021 │   6    │
│ Thu Sep 30 2021 │   13   │
│ Sat Oct 02 2021 │   1    │
│ Thu Feb 17 2022 │   3    │
└─────────────────┴────────┘
グループ通話数:  17
URL数:  342
あみだくじ数:  26
スタンプ数:  143
写真数:  611
連絡先数:  12
ファイル数:  31
総メッセージ数:  3226
Processed in 11.34082111s
```

## ライセンス
GPLです。

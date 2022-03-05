/*
LINEトーク分析
Copyright (C) 2022  seieric(opensource@yaseiblog.org)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const fs = require("fs");
const readline = require("readline");
const MeCab = new require("mecab-async");
const mecab = new MeCab();
mecab.command = process.env.LA_MECAB_COMMAND || "mecab";

const infoRegExp = /^[0-9]{2}:[0-9]{2}\t\t(.*)$/; //招待や削除などの情報
const contentRegExp = /^[0-9]{2}:[0-9]{2}\t.+\t\[(.+)\](\s\(null\))?$/; //写真や連絡先、スタンプ、アルバムなど
const messageRegExp = /^[0-9]{2}:[0-9]{2}\t.+\t(.*)$/; //通常メッセージ（あみだくじも含まれる）
const dateRegExp = /^20[0-9]{2}\/[0-1][0-9]\/[0-3][0-9]/s; //日付
const userRegExp = /\t((.+))\t(.*)/s;
const messagetTextRegExp = /\t.+\t(.*)/s;
const ladderShuffleRegExp = /^[0-9]{2}:[0-9]{2}\t.+\t(Ladder\sshuffle\screated:\slet the\sladders\sdecide\!|あみだくじを作成しました。)?$/;
const urlRegExp = /https?:\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g;
const hiraganaRegExp = /^[ぁ-ん]$/;
const numberRegExp = /^[0-9]*$/;

const wordTypes = ['名詞', '副詞', '形容詞', '動詞'];

async function main(textFilePath) {
    let date;
    let usersCount = {};
    let wordsCount = {};
    let dateCount = {};
    let callCount = 0;
    let msgCount = 0;
    let urlCount = 0;
    let ladderShuffleCount = 0;
    let photoCount = 0;
    let stampCount = 0;
    let addressCount = 0;
    let fileCount = 0;
    const stream = fs.createReadStream(textFilePath, {
        encoding: "utf8",
        highWaterMark: 1024
    });
    const reader = readline.createInterface({ input: stream });

    let i = 1;
    for await (const line of reader) {
        let userCount;
        i++;
        if (line.match(dateRegExp)) {
            date = Date.parse(line);
            dateCount[date] = 0;
        } else if (line.match(contentRegExp)) {
            msgCount++;
            dateCount[date]++;
            const message = line.match(contentRegExp);
            switch (message[1]) {
                case '写真':
                    photoCount++;
                    break;
                case 'スタンプ':
                    stampCount++;
                    break;
                case '連絡先':
                    addressCount++;
                    break;
                case 'ファイル':
                    fileCount++;
                    break;
            }
            userCount = true;
        } else if (line.match(infoRegExp)) {
        } else if (line.match(ladderShuffleRegExp)) {
            ladderShuffleCount++;
            userCount = true;
        } else if (line.match(messageRegExp) || i > 4) {
            if (line.match(messageRegExp)) {
                msgCount++;
                dateCount[date]++;
                userCount = true;
            }
            message = line.match(messagetTextRegExp) || ['', line];
            if (message[1] === "☎ グループ通話が開始されました。") {
                callCount++;
            } else {
                //URLを除去
                const text = message[1].replace(urlRegExp, '').replace('"', '');
                if (text !== '') {
                    await mecab.parse(text, function(err, result) {
                        if (err) throw err;
                        for (let j=0;j<result.length;j++) {
                            const wordType = result[j][1];
                            const word = result[j][0];
                            if(wordTypes.includes(wordType)) {
                                if (word in wordsCount) {
                                    wordsCount[word]++;
                                } else {
                                    wordsCount[word] = 1;
                                }
                            };
                        }
                    });
                }
                urlCount += (message[1].match(urlRegExp) || []).length;
            }
        }

        if (userCount) {
            const user = line.match(userRegExp)[1];
            if (user in usersCount) {
                usersCount[user]++;
            } else {
                usersCount[user] = 1;
            }
        }
    }

    const usersCountArray = Object.keys(usersCount).map(name=>({name, count: usersCount[name]})).sort((x,y) => y.count - x.count);
    const wordsCountArray = Object.keys(wordsCount).map(word=>({word, count: wordsCount[word]})).filter(word=> word.count > 30 && !word.word.match(hiraganaRegExp) && !word.word.match(numberRegExp)).sort((x,y) => y.count - x.count);
    const dateCountArray = Object.keys(dateCount).map(date=>({date: new Date(parseInt(date)).toDateString(), count: dateCount[date]})).filter(item=> item.count > 0);
    console.log('頻出ワード');
    console.table(Object.assign({}, ...wordsCountArray.map(word=>({[word.word]:word.count}))));
    console.log('ユーザー別送信数')
    console.table(Object.assign({}, ...usersCountArray.map(user=>({[user.name]:user.count}))));
    console.log('日付別送信数')
    console.table(Object.assign({}, ...dateCountArray.map(date=>({[date.date]:date.count}))));
    console.log('グループ通話数: ', callCount);
    console.log('URL数: ', urlCount);
    console.log('あみだくじ数: ', ladderShuffleCount);
    console.log('スタンプ数: ', stampCount);
    console.log('写真数: ', photoCount);
    console.log('連絡先数: ', addressCount);
    console.log('ファイル数: ', fileCount);
    console.log('総メッセージ数: ', msgCount);
}

async function processInit() {
    const hrstart = process.hrtime();
    await main(process.argv[2]);
    const hrend = process.hrtime(hrstart);
    console.info('Processed in %ds', hrend[0] + (hrend[1] / 1e9));
}

processInit();

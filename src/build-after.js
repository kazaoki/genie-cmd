
'use strict'

/**
 * parcel でビルド後、調整を行う。
 */

const fs = require('fs');
const from = 'dist/genie.js';
const to = 'dist/genie';

// genie.jsが正常に生成されていない場合は終了
if(!fs.existsSync(from)) process.exit(1);

// genieファイルを作成してシェバン行のみ書き込み
fs.writeFileSync(to, '#!/usr/bin/env node\n' + fs.readFileSync(from))

// genie.jsファイルを削除する
fs.unlinkSync(from)

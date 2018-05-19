'use strict'

let words, encoding

const fs = require('fs')
const readline = require('readline')
const levenshtein = require('js-levenshtein')



//Thanks to vsemozhetbyt
//https://gist.github.com/vsemozhetbyt/3b225c62f226e8d71156c6029ce298eb

function pb(edge = 0) {
  const rl = require('readline');

  const DEFAULT_FREQ = 500;
  const HUNDRED_PERCENT = 100;
  const PB_LENGTH = 50;
  const PB_SCALE = HUNDRED_PERCENT / PB_LENGTH;

  const NANOSECONDS_PER_SECOND = 1e9;

  const hrStart = process.hrtime();

  function clearLine() {
    rl.cursorTo(process.stdout, 0);
    rl.clearLine(process.stdout, 0);
  }

  function getTimePast() {
    const hrEnd = process.hrtime(hrStart);
    return `${
      ((hrEnd[0] * NANOSECONDS_PER_SECOND + hrEnd[1]) / NANOSECONDS_PER_SECOND).toFixed(1)
    } s`;
  }

  return {
    edge,
    stat: 0,

    start(freq = DEFAULT_FREQ) {
      this.updater = setInterval(() => { this.update(); }, freq);
    },

    update(stat = this.stat) {
      const statPercent =
        stat === this.edge || stat > this.edge ?
        HUNDRED_PERCENT :
        stat / this.edge * HUNDRED_PERCENT;

      const barsNumber = Math.floor(statPercent / PB_SCALE);
      const padsNumber = PB_LENGTH - barsNumber;

      clearLine();
      process.stdout.write(
        `${'█'.repeat(barsNumber)}${'░'.repeat(padsNumber)} ${statPercent.toFixed(1)}%  ${getTimePast()} (${stat.toLocaleString()} of ${this.edge.toLocaleString()})`
      );
    },

    end() {
      clearInterval(this.updater);
      this.stat = this.edge;
      this.update();
      console.log('\n');
    },

    clear() {
      clearInterval(this.updater);
      clearLine();
    },
  };
}



function spinner_sync_update(msg, arr) {

    readline.cursorTo(process.stdout, 0)
    readline.clearLine(process.stdout, 0)
    process.stdout.write(msg.replace(/%s/, arr[0]))
    arr.push(arr.shift())
  
}

function spinner_sync_stop (msg) {
  readline.cursorTo(process.stdout, 0)
  readline.clearLine(process.stdout, 0)

  if (msg !== undefined) {
    process.stdout.write(msg)
  }
}


function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) {
    return false
  }
}

if ((process.argv.length === 4) || (fileExists(process.argv[2]))) {
  
  main()  

} else {

  console.log('Invalid command line.')
  process.exit()

}

function guessEncoding (path) {
  const BOM_0 = 0xff
  const BOM_1 = 0xfe

  try {
    const fd = fs.openSync(path, 'r')
    const bf = Buffer.alloc(2)
    fs.readSync(fd, bf, 0, 2, 0)
    fs.closeSync(fd)
    return bf[0] === BOM_0 && bf[1] === BOM_1 ? 'utf16le' : 'utf8'
  } catch (e) {
    console.error(`Error: ${e.message}.`)
    return null
  }
}



function main() {

  
  encoding = guessEncoding(process.argv[2])

  fs.writeFileSync(process.argv[3], '', {encoding: encoding, flag: 'w'})

  words = fs
    .readFileSync(process.argv[2], encoding)
    .toString()
    .replace(/^\uFEFF/, '')
    .split('\n')
    .map((el) => { return el.trim() })
    .filter(Boolean)

  const pbSync = pb(words.length)

  let count = 0
  
  for (let w0 of words) {
    process_word(w0)
    count++
    if (count % 100 === 0)
      pbSync.update(count)
  }
  
  pbSync.end()

}


function process_word(w0) {
  
  let arr = []

  for (let w1 of words) {
    if (levenshtein(w0, w1) === 1) arr.push(w1)
  }

  if (arr.length > 0) {
      
      fs.writeFileSync(process.argv[3], `${w0}\n\t${arr.join(', ')}\n`, {encoding: encoding, flag: 'a'}) 
  }
  
}





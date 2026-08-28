/**
 * 拼图生成脚本：
 * 扫描 src/static/puzzles/ 下的图片，自动生成 src/config/puzzles.json 拼图清单。
 * 使用：npm run gen:puzzles （或 node scripts/generate-puzzles.js）
 * 往图片文件夹里添加图片后重新运行即可，无需改页面代码。
 */
const fs = require('fs')
const path = require('path')

const SRC_DIR = path.resolve(__dirname, '../src/static/puzzles')
const OUT_FILE = path.resolve(__dirname, '../src/config/puzzles.json')
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif']

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'puzzle'
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`拼图目录不存在: ${SRC_DIR}`)
    process.exit(1)
  }
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort()

  const puzzles = files.map((file, index) => {
    const base = path.basename(file, path.extname(file))
    return {
      id: toId(base) + '-' + (index + 1),
      name: base,
      image: '/static/puzzles/' + file,
      pieces: 9, // 默认 3x3；文件名含 4x4 时自动升级为 16 块
    }
  })

  // 文件名含 4x4 / 16 的升级为 16 块
  files.forEach((file, index) => {
    if (/4x4|16/.test(file)) {
      puzzles[index].pieces = 16
    }
  })

  fs.writeFileSync(OUT_FILE, JSON.stringify(puzzles, null, 2) + '\n', 'utf8')
  console.log(`已生成 ${puzzles.length} 个拼图 -> ${OUT_FILE}`)
  puzzles.forEach((p) => console.log(`  - ${p.id} (${p.pieces} 块): ${p.name}`))
}

main()

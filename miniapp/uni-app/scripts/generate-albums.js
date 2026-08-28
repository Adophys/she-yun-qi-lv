/**
 * 图片自动登记脚本（uni-app 正式版）：
 * 扫描 src/static/albums/ 下的图片，自动生成 src/config/albums.json，
 * 同时供「拼图游戏」和「文化收藏」使用。
 *
 * 用法：npm run gen:albums（或 node scripts/generate-albums.js）
 * 之后往 albums 文件夹添加图片，重新运行一次即可，无需改页面代码。
 *
 * 规则：
 * - 文件名即图片名（自动去掉扩展名）
 * - 文件名含 4x4 / 16 时拼图为 16 块，否则 9 块（3x3）
 * - 文件名以 clothing-/pattern-/music-/cuisine-/craft- 开头时归入对应图鉴分类，否则默认 craft
 */
const fs = require('fs')
const path = require('path')

const SRC_DIR = path.resolve(__dirname, '../src/static/albums')
const OUT_FILE = path.resolve(__dirname, '../src/config/albums.json')
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif']
const CATEGORY_PREFIX = ['clothing', 'pattern', 'music', 'cuisine', 'craft']

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'album'
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`图片目录不存在: ${SRC_DIR}`)
    process.exit(1)
  }
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort()

  const albums = files.map((file, index) => {
    const base = path.basename(file, path.extname(file))
    const lower = base.toLowerCase()
    const category = CATEGORY_PREFIX.find((c) => lower.startsWith(c + '-')) || 'craft'
    return {
      id: toId(base) + '-' + (index + 1),
      name: base,
      image: '/static/albums/' + file,
      category,
      rarity: 'common',
      isDiscovered: true,
      pieces: /4x4|16/.test(file) ? 16 : 9,
    }
  })

  fs.writeFileSync(OUT_FILE, JSON.stringify(albums, null, 2) + '\n', 'utf8')
  console.log(`已登记 ${albums.length} 张图片 -> ${OUT_FILE}`)
  albums.forEach((a) => console.log(`  - ${a.id} [${a.category}] ${a.name} (${a.pieces} 块拼图)`))
}

main()

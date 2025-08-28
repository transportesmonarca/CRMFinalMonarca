const fs = require('fs')
const path = require('path')

const appDir = path.join(__dirname, '..', 'app')

function findPageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let pages = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      pages = pages.concat(findPageFiles(full))
    } else if (e.isFile() && e.name === 'page.tsx') {
      pages.push(full)
    }
  }
  return pages
}

function main() {
  if (!fs.existsSync(appDir)) {
    console.error('No se encontró la carpeta app/')
    process.exit(1)
  }

  const pages = findPageFiles(appDir)
  const pagesWithoutMainLayout = []
  const pagesWithMainLayout = []

  for (const p of pages) {
    const content = fs.readFileSync(p, 'utf8')
    const hasMainLayout = /import\s+\{\s*MainLayout\s*\}/.test(content) || /MainLayout\(/.test(content)
    if (hasMainLayout) pagesWithMainLayout.push(p)
    else pagesWithoutMainLayout.push(p)
  }

  console.log('Total pages found:', pages.length)
  console.log('Pages importing MainLayout:', pagesWithMainLayout.length)
  console.log('Pages WITHOUT MainLayout (potentially public):')
  pagesWithoutMainLayout.forEach((p) => console.log(' -', path.relative(process.cwd(), p)))

  // Exit code 0
}

main()

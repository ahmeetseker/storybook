import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'chrome' })
for (const [w,name] of [[1440,'genis-1440'],[834,'tablet-834'],[390,'mobil-390']]) {
  const c = await b.newContext({ viewport:{width:w,height:1000}, locale:'tr-TR' })
  const p = await c.newPage()
  await p.goto('http://127.0.0.1:3000/ilan/listing-1-1', { waitUntil:'networkidle' })
  await p.waitForTimeout(1000)
  const r = await p.evaluate(() => {
    const main = document.querySelector('main#main-content')
    const page = main.firstElementChild
    const stage = page.firstElementChild
    const rail = page.querySelector('aside')
    const dock = [...page.children].find(el => getComputedStyle(el).position === 'sticky')
    const gc = (el) => el ? getComputedStyle(el) : null
    return {
      cols: gc(page).gridTemplateColumns,
      stageW: Math.round(stage.getBoundingClientRect().width),
      stageTop: Math.round(stage.getBoundingClientRect().top),
      railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
      railShown: rail ? gc(rail).display !== 'none' : false,
      dockShown: dock ? gc(dock).display !== 'none' : false,
      contact: [...page.querySelectorAll('button')].filter(x=>/Mesaj gönder/.test(x.textContent||'') && x.offsetParent !== null).length,
    }
  })
  console.log(name.padEnd(12), JSON.stringify(r))
  await p.screenshot({ path:`/Users/ahmet/Desktop/ilan-${name}.png` })
  await c.close()
}
await b.close()

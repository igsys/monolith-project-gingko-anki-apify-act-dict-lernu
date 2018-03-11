const Apify = require('apify')
const typeCheck = require('type-check').typeCheck
const cheerio = require('cheerio')

// Definition of the input
const INPUT_TYPE = `{
    query: String
    source: String
    translation: String
}`

const LEVEL_TYPE = {
    NOVOICE: 'NOVOICE',
    INTERMEDIATE: 'INTERMEDIATE',
    EXPERT: 'EXPERT'
}

const getLanguage = language => {
    switch (language) {
        case 'french': return 'fr'
        case 'english': return 'en'
        case 'russian': return 'ru'
        case 'spanish': return 'es'
        case 'italian': return 'it'
        case 'chinese': return 'zh-cn'
        case 'japanese': return 'ja'
        case 'german': return 'de'
        case 'korean': return 'ko'
        case 'esperanto': return 'eo'
        default: return ''
    }
}

Apify.main(async () => {
    // Fetch the input and check it has a valid format
    // You don't need to check the input, but it's a good practice.
    const input = await Apify.getValue('INPUT')
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:')
        console.log(INPUT_TYPE)
        console.log('Received input:')
        console.dir(input)
        throw new Error('Received invalid input')
    }

    // Here's the place for your magic...
    console.log(`Input query: ${input.query}`)

    // Environment variables
    const launchPuppeteer = process.env.NODE_ENV === 'development' ? puppeteer.launch : Apify.launchPuppeteer

    // Navigate to page
    const uri = `https://lernu.net/${getLanguage(input.translation)}/vortaro/${input.query}/`
    const browser = await launchPuppeteer()
    const page = await browser.newPage()
    await page.goto(uri, {
        timeout: 200000,
    })

    const html = await page.content()
    const $ = cheerio.load(html)

    const ipa = $('div#dictionary-search-results').find('li').eq(0).find('span.dictionary-structure').text().trim().replace('(', '').replace(')', '')
    const def_simple = $('div#dictionary-search-results').find('li').eq(0).find('ul').text().trim()
    // console.log('definition', definition, 'uri', uri)

    // Store the output
    const output = {
        input,
        meta: {
            ipa,
            def_simple,
        }
    }
    await Apify.setValue('OUTPUT', output)
})

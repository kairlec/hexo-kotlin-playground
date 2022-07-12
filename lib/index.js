const {highlight, escapeHTML, prismHighlight, stripIndent} = require('hexo-util')
const fs = require('fs')
const {Config, getCodeBlockConfig, makeSpecialConfigKey} = require('./config')
const {parseHide} = require('./parse')

makeSpecialConfigKey('line-numbers', 'lines')
makeSpecialConfigKey('line-number', 'lines')
makeSpecialConfigKey('lines-numbers', 'lines')
makeSpecialConfigKey('lines-number', 'lines')
makeSpecialConfigKey('line', 'lines')
makeSpecialConfigKey('gutter', 'lines')

makeSpecialConfigKey('min-version', 'data-min-compiler-version')

makeSpecialConfigKey('autocomplete', 'data-autocomplete')
makeSpecialConfigKey('auto-complete', 'data-autocomplete')

makeSpecialConfigKey('readonly', 'data-highlight-only')
makeSpecialConfigKey('read-only', 'data-highlight-only')
makeSpecialConfigKey('runable', 'data-highlight-only', value => !JSON.parse(value || 'true'), value => !value)
makeSpecialConfigKey('runnable', 'data-highlight-only', value => !JSON.parse(value || 'true'), value => !value)

makeSpecialConfigKey('platform', 'data-target-platform')

makeSpecialConfigKey('version', 'data-version')

makeSpecialConfigKey('auto-check', 'highlight-on-fly')

makeSpecialConfigKey('brackets', 'match-brackets')
makeSpecialConfigKey('bracket', 'match-brackets')

const preCodeBlockConfig = new Config()
const preConfig = new Config()
const scriptIntroduceConfig = new Config()

function initPreConfig(kotlinPlaygroundConfig) {
    preConfig.set('html-tag', kotlinPlaygroundConfig.html_tag, 'code')
    preConfig.set('html-tag-class', kotlinPlaygroundConfig.html_tag_class, 'kotlin-code')
    preConfig.set('other-highlight', kotlinPlaygroundConfig.other_highlight, 'highlight')
    preConfig.set('other-highlight-config', kotlinPlaygroundConfig.other_highlight_config, {})
    preConfig.set('css', kotlinPlaygroundConfig.css, {})
    preConfig.set('tab', kotlinPlaygroundConfig.tab, '    ')
    preConfig.set('ext', kotlinPlaygroundConfig.extend, {})
    preConfig.set('disabled-plugin', kotlinPlaygroundConfig.disable_plugin, false)
    preConfig.set('data-selector', kotlinPlaygroundConfig.data_selector, '.kotlin-code')
    scriptIntroduceConfig.set('src', kotlinPlaygroundConfig.src, 'https://unpkg.com/kotlin-playground@1')
    scriptIntroduceConfig.set('data-server', kotlinPlaygroundConfig.data_server, null)
    scriptIntroduceConfig.set('data-version', kotlinPlaygroundConfig.data_version, null)
    if (kotlinPlaygroundConfig.custom_pre) {
        for (const key in kotlinPlaygroundConfig.custom_pre) {
            preConfig.set(key, kotlinPlaygroundConfig.custom_pre[key])
        }
    }

    preCodeBlockConfig.set('lines', kotlinPlaygroundConfig.line_numbers, true)
    preCodeBlockConfig.set('auto-indent', kotlinPlaygroundConfig.auto_indent, true)
    preCodeBlockConfig.set('indent', kotlinPlaygroundConfig.indent, 4)
    preCodeBlockConfig.set('theme', kotlinPlaygroundConfig.theme, 'default')
    if (kotlinPlaygroundConfig.custom_cb_pre) {
        for (const key in kotlinPlaygroundConfig.custom_cb_pre) {
            preCodeBlockConfig.set(key, kotlinPlaygroundConfig.custom_cb_pre[key])
        }
    }
}

function isPluginDisabled() {
    return preConfig.get('disabled-plugin')
}

function tryHighLightKotlin(code, args) {
    const config = getCodeBlockConfig(args, preCodeBlockConfig)
    if (!isPluginDisabled()) {
        const tag = preConfig.get('html-tag')
        const tagClass = preConfig.get('html-tag-class')
        const _code = parseHide(escapeHTML(code), '<textarea class="hidden-dependency">', '</textarea>')
        return `<pre class="language-kotlin"><${tag} class="${tagClass}"${config.toString()}>${_code}</${tag}></pre>`
    } else {
        return null
    }
}

function makeHeadEndInjectContent() {
    // 统一highlight.js,playground,prismjs的样式
    return `<style type="text/css">
.CodeMirror-lines,.line,.code-output,.code,.token {
    font-size: ${preConfig.get('css').font_size || '16px'};
    line-height: ${preConfig.get('css').line_height || '22px'};
}
</style>`
}

function makeBodyEndInjectContent() {
    const dataSelector = preConfig.get('data-selector')
    let jsCode = ''
    const ext = preConfig.get('ext')
    if (ext.js && fs.existsSync(ext.js)) {
        jsCode = fs.readFileSync(ext.js, {encoding: 'utf-8'})
    }

    return `<script${scriptIntroduceConfig.toString(item => '')}></script>
<script>
${jsCode}
if(typeof ktpgOptions !== 'undefined'){
    KotlinPlayground('${dataSelector}',ktpgOptions)
}else{
    KotlinPlayground('${dataSelector}')
}
window.addEventListener('pjax:complete', event => {
    if(typeof ktpgOptions !== 'undefined'){
        KotlinPlayground('${dataSelector}',ktpgOptions)
    }else{
        KotlinPlayground('${dataSelector}')
    }
});
</script>`
}

function ktpgResolveFunction(hexo, args, contents, err) {
    const code = stripIndent(contents).replace(/\t/mg, preConfig.tab)
    const data = tryHighLightKotlin(code, args)
    if (data !== null) {
        return `<figure class="highlight kotlin">${data}</figure>`
    }
    return otherHighLightCode(code, "kotlin", () => `<pre><code language="kotlin">${code}</code></pre>`)
}

function otherHighLightCode(code, _lang, els) {
    const line = preCodeBlockConfig.get('lines')
    const tab = preCodeBlockConfig.get('tab')
    const engine = preConfig.get('other-highlight')
    const engineConfig = preConfig.get('other-highlight-config')
    if (engine === 'highlight') {
        return highlight(code, {hljs: engineConfig.hljs, gutter: line, tab: tab, lang: _lang, ...engineConfig})
    } else if (engine === 'prismjs') {
        return prismHighlight(code, {lineNumber: line, tab: tab, lang: _lang, ...engineConfig})
    } else {
        return els()
    }
}

exports.initPreConfig = initPreConfig
exports.isPluginDisabled = isPluginDisabled
exports.ktpgResolveFunction = ktpgResolveFunction
exports.makeBodyEndInjectContent = makeBodyEndInjectContent
exports.makeHeadEndInjectContent = makeHeadEndInjectContent

'use strict'; //eslint-disable-line
let hljs, prismjs
try {
  hljs = require('highlight.js')
} catch {}
try {
  prismjs = require('prismjs')
} catch {}
const stripIndent = require('strip-indent')
const codeBlockPreConfig = {}
const codeBlockPreSingalConfig = []
const preConfig = {}

function initPreConfig () {
  const kotlinPlaygroundConfig = hexo.config.kotlin_playground || {}
  preConfig.htmlTag = kotlinPlaygroundConfig.html_tag || 'code'
  preConfig.htmlTagClass = kotlinPlaygroundConfig.html_tag_class || 'kotlin-code'
  preConfig.enable = kotlinPlaygroundConfig.enable_all !== false
  preConfig.otherHighlight = kotlinPlaygroundConfig.other_highlight
  preConfig.otherHighlightConfig = kotlinPlaygroundConfig.other_highlight_config || {}
  preConfig.css = kotlinPlaygroundConfig.css || {}
  preConfig.tab = kotlinPlaygroundConfig.tab || 4
  if (kotlinPlaygroundConfig.custom_pre) {
    Object.assign(preConfig, kotlinPlaygroundConfig.custom_pre)
  }
  codeBlockPreConfig.lines = kotlinPlaygroundConfig.line_numbers !== false
  codeBlockPreConfig['auto-indent'] = kotlinPlaygroundConfig.auto_indent !== false
  codeBlockPreConfig.indent = kotlinPlaygroundConfig.indent || 4
  codeBlockPreConfig.theme = kotlinPlaygroundConfig.theme || 'default'
  if (kotlinPlaygroundConfig.custom_cb_pre) {
    Object.assign(codeBlockPreConfig, kotlinPlaygroundConfig.custom_cb_pre)
  }
}

initPreConfig()

function getConfig (sourceCode) {
  const config = Object.assign({}, codeBlockPreConfig)
  const singalConfig = new Set(codeBlockPreSingalConfig)
  let enable = preConfig.enable
  // 获取第一行注释
  const firstLineIndex = sourceCode.indexOf('\n')
  const firstLine = sourceCode.slice(0, firstLineIndex)
  const comment = /^\s*\/{2,} *(.*)$/m.exec(firstLine)
  if (comment !== null && comment[1].length > 0) {
    sourceCode = sourceCode.slice(firstLineIndex + 1)
    comment[1].toLowerCase().split(/\s+/).forEach((item) => {
      const result = /^([^=]+)=(.*)$/.exec(item)
      if (result) {
        if (result[1] === 'playground') {
          enable = result[2] !== 'false'
        } else {
          config[result[1]] = result[2]
        }
      } else {
        if (item === 'playground') {
          enable = true
        } else {
          singalConfig.add(item)
        }
      }
    })
  }
  if (enable) {
    const lt = Array.from(singalConfig)
    for (const c in config) {
      lt.push(`${c}="${config[c]}"`)
    }
    return {
      attributes: lt.join(' '),
      code: sourceCode,
      ok: true
    }
  } else {
    return {
      ok: false
    }
  }
}

function parse (sourceCode) {
  const { attributes, code, ok } = getConfig(sourceCode)
  if (ok) {
    const hideStart = /[^\n]*^\/{2,}\s*@hidestart[^\n]*$\n?/mg.exec(code)
    const hideEnd = /[^\n]*^\/{2,}\s*@hideend[^\n]*$\n?/mg.exec(code)
    if (hideStart && hideEnd) {
      const prefix = escapeHtml(code.substr(0, hideStart.index - 1))
      const hiddenCode = escapeHtml(code.slice(hideStart.index + hideStart[0].length, hideEnd.index - 1))
      const suffix = escapeHtml(code.slice(hideEnd.index + hideEnd[0].length))
      return `<div class="highlight-container"></div><pre class="language-kotlin"><${preConfig.htmlTag} class="${preConfig.htmlTagClass}" ${attributes}>${prefix}<textarea class="hidden-dependency">${hiddenCode}</textarea>${suffix}</${preConfig.htmlTag}></pre>`
    } else {
      return `<div class="highlight-container"></div><pre class="language-kotlin"><${preConfig.htmlTag} class="${preConfig.htmlTagClass}" ${attributes}>${code}</${preConfig.htmlTag}></pre>`
    }
  } else {
    return null
  }
}

hexo.extend.injector.register('head_end', (function () {
  // 统一highlight.js,playground,prismjs的样式
  return `<style type="text/css">
    .CodeMirror-lines,.line,.code-output {
        font-size: ${preConfig.css.font_size || '16px'};
        line-height: ${preConfig.css.line_height || '22px'};
    }
    </style>`
})(), 'default')

hexo.extend.injector.register('body_end', (function () {
  const kotlinPlaygroundConfig = hexo.config.kotlin_playground || {}
  const src = kotlinPlaygroundConfig.src || 'https://unpkg.com/kotlin-playground@1'
  const dataSelector = kotlinPlaygroundConfig.data_selector || '.kotlin-code'
  const dataServer = kotlinPlaygroundConfig.data_server || null
  const dataVersion = kotlinPlaygroundConfig.data_version || null
  const attbitures = [`src="${src}"`]
  if (dataServer) {
    attbitures.push(`data-server="${dataServer}"`)
  }
  if (dataVersion) {
    attbitures.push(`data-version="${dataVersion}"`)
  }
  return `<script ${attbitures.join(' ')}"></script>
  <script>
    KotlinPlayground('${dataSelector}')
    window.addEventListener('pjax:complete', event => {
        KotlinPlayground('${dataSelector}')
      });
  </script>`
})(), 'default')

const escapeHtml = (str) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )

hexo.extend.filter.register('marked:renderer', function (renderer) {
  // 定义 renderer.code 来自定义代码块的解析行为
  renderer.__code = renderer.code
  renderer.code = (sourceCode, language) => {
    sourceCode = stripIndent(sourceCode)
    if (language.toLowerCase() === 'kotlin') {
      return parse(sourceCode) || otherHighLightCode(sourceCode, language, () => renderer.__code(sourceCode, language))
    }
    return otherHighLightCode(sourceCode, language, () => renderer.__code(sourceCode, language))
  }
})

function replaceTabs (line, tab) {
  let str = ' '
  for (let i = 0; i < tab; i++) {
    str += ' '
  }
  return line.replace(/\t/mg, str)
}
function formatLine (line, useHljs) {
  return (useHljs ? '' : '<span class="line') + (useHljs ? line : `">${line}</span><br>`)
}

function otherHighLightCode (code, _lang, els) {
  const gutter = codeBlockPreConfig.lines
  const tab = preConfig.tab
  const engine = preConfig.otherHighlight
  const useHljs = preConfig.otherHighlightConfig.hljs
  if (engine === 'highlight' && hljs) {
    const firstLine = 1
    hljs.configure({ classPrefix: useHljs ? 'hljs-' : '' })
    const data = hljs.highlight(_lang, code)
    const lang = _lang || data.lang || ''
    const classNames = (useHljs ? 'hljs' : 'highlight') + (lang ? ` ${lang}` : '')

    const before = useHljs ? `<pre><code class="${classNames}">` : '<pre>'
    const after = useHljs ? '</code></pre>' : '</pre>'

    const lines = data.value.split('\n')
    let numbers = ''
    let content = ''

    for (let i = 0, len = lines.length; i < len; i++) {
      let line = lines[i]
      if (tab) line = replaceTabs(line, tab)
      numbers += `<span class="line">${Number(firstLine) + i}</span><br>`
      content += formatLine(line, useHljs)
    }

    let result = `<figure class="highlight${data.language ? ` ${data.language}` : ''}">`
    result += '<table><tr>'
    if (gutter) {
      result += `<td class="gutter"><pre>${numbers}</pre></td>`
    }
    result += `<td class="code">${before}${content}${after}</td>`
    result += '</tr></table></figure>'
    return result
  } else if (engine === 'prismjs' && prismjs) {

  } else {
    return els()
  }
}

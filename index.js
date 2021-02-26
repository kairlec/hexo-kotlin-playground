// eslint-disable-next-line
'use strict';
const { highlight, escapeHTML, prismHighlight } = require('hexo-util')
const stripIndent = require('strip-indent')
const fs = require('fs')
const kotlinPlaygroundConfig = hexo.config.kotlin_playground || {}
const KotlinPlaygroundExtend = kotlinPlaygroundConfig.extend || {}
if (!kotlinPlaygroundConfig.disable_plugin) {
  const codeBlockPreConfig = {}
  const codeBlockPreSingalConfig = []
  const preConfig = {}

  function initPreConfig () {
    preConfig.htmlTag = kotlinPlaygroundConfig.html_tag || 'code'
    preConfig.htmlTagClass = kotlinPlaygroundConfig.html_tag_class || 'kotlin-code'
    preConfig.enable = kotlinPlaygroundConfig.enable_all !== false
    preConfig.otherHighlight = kotlinPlaygroundConfig.other_highlight
    preConfig.otherHighlightConfig = kotlinPlaygroundConfig.other_highlight_config || {}
    preConfig.css = kotlinPlaygroundConfig.css || {}
    preConfig.tab = kotlinPlaygroundConfig.tab || '    '
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
        const prefix = escapeHTML(code.substr(0, hideStart.index - 1))
        const hiddenCode = escapeHTML(code.slice(hideStart.index + hideStart[0].length, hideEnd.index - 1))
        const suffix = escapeHTML(code.slice(hideEnd.index + hideEnd[0].length))
        return `<pre class="language-kotlin"><${preConfig.htmlTag} class="${preConfig.htmlTagClass}" ${attributes}>${prefix}<textarea class="hidden-dependency">${hiddenCode}</textarea>${suffix}</${preConfig.htmlTag}></pre>`
      } else {
        return `<pre class="language-kotlin"><${preConfig.htmlTag} class="${preConfig.htmlTagClass}" ${attributes}>${escapeHTML(code)}</${preConfig.htmlTag}></pre>`
      }
    } else {
      return null
    }
  }

  hexo.extend.injector.register('head_end', (function () {
    // 统一highlight.js,playground,prismjs的样式
    return `<style type="text/css">
      .CodeMirror-lines,.line,.code-output,.code,.token {
          font-size: ${preConfig.css.font_size || '16px'};
          line-height: ${preConfig.css.line_height || '22px'};
      }
      </style>`
  })(), 'default')

  hexo.extend.injector.register('body_end', (function () {
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
    let jsCode = ''
    if (KotlinPlaygroundExtend.js && fs.existsSync(KotlinPlaygroundExtend.js)) {
      jsCode = fs.readFileSync(KotlinPlaygroundExtend.js, { encoding: 'utf-8' })
    }

    return `<script ${attbitures.join(' ')}"></script>
    <script>
      ${jsCode}
      KotlinPlayground('${dataSelector}',ktpgOptions)
      window.addEventListener('pjax:complete', event => {
          KotlinPlayground('${dataSelector}',ktpgOptions)
      });
    </script>`
  })(), 'default')

  hexo.extend.filter.register('marked:renderer', function (renderer) {
    // 定义 renderer.code 来自定义代码块的解析行为
    renderer.__code = renderer.code
    renderer.code = (sourceCode, language) => {
      sourceCode = stripIndent(sourceCode).replace(/\t/mg, preConfig.tab)
      if (language.toLowerCase() === 'kotlin') {
        const data = parse(sourceCode)
        if (!data) {
          return otherHighLightCode(sourceCode, language, () => renderer.__code(sourceCode, language))
        }
        return `<figure class="highlight kotlin">${data}</figure>`
      }
      return otherHighLightCode(sourceCode, language, () => renderer.__code(sourceCode, language))
    }
  })

  function otherHighLightCode (code, _lang, els) {
    const gutter = codeBlockPreConfig.lines
    const tab = preConfig.tab
    const engine = preConfig.otherHighlight
    const useHljs = preConfig.otherHighlightConfig.hljs
    const otherPreConfig = kotlinPlaygroundConfig.other_pre_config
    if (engine === 'highlight') {
      return highlight(code, { hljs: useHljs, gutter: gutter, tab: tab, lang: _lang, ...otherPreConfig })
    } else if (engine === 'prismjs') {
      return prismHighlight(code, { hljs: useHljs, gutter: gutter, tab: tab, lang: _lang, ...otherPreConfig })
    } else {
      return els()
    }
  }
}

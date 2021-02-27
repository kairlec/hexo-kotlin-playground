const { initPreConfig, isPluginDisabled, rendererFilterFunction, makeBodyEndInjectContent, makeHeadEndInjectContent } = require('./lib/index')

initPreConfig(hexo.config.kotlin_playground || {})
if (!isPluginDisabled()) {
  hexo.extend.injector.register('head_end', makeHeadEndInjectContent(), 'default')

  hexo.extend.injector.register('body_end', makeBodyEndInjectContent(), 'default')

  hexo.extend.filter.register('marked:renderer', rendererFilterFunction)
}

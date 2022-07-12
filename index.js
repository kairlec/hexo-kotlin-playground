const {
    initPreConfig,
    isPluginDisabled,
    ktpgResolveFunction,
    makeBodyEndInjectContent,
    makeHeadEndInjectContent
} = require('./lib/index')

initPreConfig(hexo.config.kotlin_playground || {})

if (!isPluginDisabled()) {
    hexo.extend.injector.register('head_end', makeHeadEndInjectContent(), 'default')

    hexo.extend.injector.register('body_end', makeBodyEndInjectContent(), 'default')

}

hexo.extend.tag.register('ktpg', (args, contents, err) => {
    return ktpgResolveFunction(hexo, args, contents, err)
}, {
    ends: true,
})

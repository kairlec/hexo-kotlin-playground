# Hexo Kotlin Playground
使Hexo的CodeBlock支持[Kotlin Playground](https://github.com/JetBrains/kotlin-playground)

## 使用方法

##### 安装

```bash
npm install hexo-kotlin-playground
```
##### 启用插件
1. 拷贝样例[_config.yml](https://github.com/kairlec/hexo-kotlin-playground/blob/main/sample/_config.yml)内的内容至你的`_config.yml`
2. 设置`disable_plugin: ~`或`disable_plugin: false`
3. 启用代码块,可以选择设置`_config.yml`里`enable_all: true`或在每个代码块进行独立设置

### 独立设置
- 在每个代码块开头,可以以一行`//@playground`注释开头,将自动解析后面的配置,比如
  ```kotlin
  //@playground enable line-number=false
  fun main(){
    println("Hello Kotlin")
  }
  ```
  将自动解析`enable`来启用该代码块的playground,`line-number=false`将禁用该代码块的行号显示
  > 支持 **key** | **key=value** | **key='value'** | **key="value"** 四种格式的设置
  支持如下设置:
  - data-version
  - args
  - data-target-platform
  - data-highlight-only
  - data-js-libs
  - auto-indent
  - ...
  - 更多配置和配置意义请看[Kotlin Playground Customizing editors](https://github.com/JetBrains/kotlin-playground#customizing-editors)

- 支持使用别名来指定参数名
  > 如:   
  > version => data-version  
  > platform => data-target-platform  
  > readonly => data-highlight-only  
  > ...  
  > 更多可以看[SpecialConfigKey](https://github.com/kairlec/hexo-kotlin-playground/blob/main/lib/index.js#L7-L24)

  [其他别名](https://github.com/kairlec/hexo-kotlin-playground/blob/main/lib/index.js#L7-L24)

- 隐藏代码
  在代码块中插入以`//@hidestart`,以`//@hideend`结尾的,即可隐藏这段代码块中间的内容
  如:
  ```kotlin
  fun main(){
    println(str)
  }
  //@hidestart
  val str = "Hello Kotlin"
  //@hideend
  ```

### 其他
- 适配 next的copy-btn  
  在配置文件`_config.yml`启用拓展js内容
  ```yaml
  kotlin_playground:
    extend:
      js: "source/_data/kotlin_playground.js"
  ```
  添加如下内容
  ```javascript
  const ktpgOptions = {
    callback: (targetNode, mountNode) => {
      mountNode.querySelector('.CodeMirror-lines').classList.add('code')
      mountNode.querySelectorAll('.CodeMirror-line').forEach(element => {
        element.classList.add('line')
      })
    }
  }
  ```


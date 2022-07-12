# Hexo Kotlin Playground
使Hexo的CodeBlock支持[Kotlin Playground](https://github.com/JetBrains/kotlin-playground)

## 使用方法

##### 安装

```bash
npm install hexo-kotlin-playground --save
```
##### 启用插件

拷贝样例[_config.yml](https://github.com/kairlec/hexo-kotlin-playground/blob/v2/sample/_config.yml)内的内容至你的`_config.yml`

#### 注意事项

- **如果是由v1升级来的,注意用法已经不是首行注释了,而是tag,标签名为`ktpg`**

- **而且已经没有设置独立开关的地方了(除了总开关),要关闭就使用普通代码块**

### 独立设置
- 在tag参数列表里,设置在后面即可
  ```kotlin
  {% ktpg line-number=false auto-indent=4 %}
  //@playground enable line-number=false
  fun main(){
    println("Hello Kotlin")
  }
  {% endktpg %}
  ```
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
  > 更多可以看[SpecialConfigKey](https://github.com/kairlec/hexo-kotlin-playground/blob/82d3fcede3de651c4986ad1f6ae9ef3574cb7b50/lib/index.js#L6-L30)

  [其他别名](https://github.com/kairlec/hexo-kotlin-playground/blob/main/lib/index.js#L6-L30)

- 隐藏代码
  在代码块中插入以`//@hidestart`,以`//@hideend`结尾的,即可隐藏这段代码块中间的内容
  如:
  ```kotlin
  {% ktpg line-number=false auto-indent=4 %}
  fun main(){
    println(str)
  }
  //@hidestart
  val str = "Hello Kotlin"
  //@hideend
  {% endktpg %}
  ```
- 仅显示代码
  在代码块中插入以`//sampleStart`,以`//sampleEnd`结尾,即可只显示这块代码中间的内容
  忽略此注释则使用代码块的`none-markers`属性
  取消显示隐藏代码的按钮则设置代码块的属性`folded-button`为`false`(**`folded-button=false`**)
  > 这部分和[Kotlin Playground Customizing editors](https://github.com/JetBrains/kotlin-playground#customizing-editors)官方使用方法一样
  

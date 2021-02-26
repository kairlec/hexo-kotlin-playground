### 适配其他对代码块的操作
> 如next的copy-btn  

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

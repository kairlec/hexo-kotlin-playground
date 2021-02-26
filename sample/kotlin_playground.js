// 这里是kotlin playground的配置样例
// 参考 https://github.com/JetBrains/kotlin-playground/blob/master/README.md#options
// 注意 PlayGround(selector,ktpgOptions)将自动调用,无需设置

function onChange (code) {
  console.log('Editor code was changed:\n' + code)
}

function onTestPassed () {
  console.log('Tests passed!')
}

const ktpgOptions = {
  onChange: onChange,
  onTestPassed: onTestPassed,
  callback: (targetNode, mountNode) => {
    console.log(targetNode)
    console.log(mountNode)
  }
}

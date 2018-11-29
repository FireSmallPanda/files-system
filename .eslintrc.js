/**
 * 参考文档
 * https://eslint.org/
 * https://www.npmjs.com/package/eslint-config-airbnb
 * 
 * 注意: 
 * 1.这个文件只由一人维护, 其他人尽量不要改动
 * 2.请大家务必遵守规则, 提交的文件不允许出现红色波浪线
 */

module.exports = {
    "env": { "browser": true, "commonjs": false, "es6": true },
    "rules": { "indent": ["error", 4], "linebreak-style": ["error", "windows"], "quotes": ["error", "single"], "semi": ["error", "never"], "linebreak-style": false },
}
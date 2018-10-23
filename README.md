## FastScan
苦于没有找到一个比较合适的敏感词过滤库，所以我自己花了点时间撸了一个。
它基于广为人知的 ahocorasick 字符串匹配算法，使用原生的 js 实现。

## 安装方法
```
npm install --save fastscan
```

## 使用方法
```
import FastScanner from fastscan

var words = ["今日头条"，"微信", "支付宝"]
var scanner = new FastScanner(words)
var content = "今日头条小程序终于来了，这是继微信、支付宝、百度后，第四个推出小程序功能的App。猫眼电影率先试水，出现在今日头条。"
var offWords = scanner.search(content)
console.log(offWords)
var hits = scanner.hits(content)
console.log(hits)

-------------
[ [ 0, '今日头条' ], [ 15, '微信' ], [ 18, '支付宝' ], [ 53, '今日头条' ] ]
{ '今日头条': 2, '微信': 1, '支付宝': 1 }
```

## API

1. 查询匹配的词汇以及所在字符串的位置 search(content, option={})
2. 查询匹配词汇的命中数量 hits(content, options={})
3. 临时动态增加词汇，不修正其它词汇的回溯指针 add(word)

```
options = {quick: false, longest: false}
```
1. quick 选项表示快速模式，匹配到一个就立即返回
2. longest 表示最长模式，同一个位置出现多个词汇(中国、中国人)，选择最长的一个(中国人)
3. 默认匹配出所有的词汇，同一个位置可能会出现多个词汇
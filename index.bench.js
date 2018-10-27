var FastScanner = require('./index')
var chars = 'abcdefghijklmnopqrstuv'

function randomString(min, max) {
	var cs = []
	var len = 0
	if(min == max) {
		len = min
	} else {
		len = Math.floor(Math.random() * (max-min)) + min
	}
	for(var i=0;i<len;i++) {
		var k = Math.floor(Math.random() * chars.length)
		cs.push(chars[k])
	}
	return cs.join('')
}

function randomWords(wordNum, min, max) {
	var words = []
	for(var k=0;k<wordNum;k++) {
		words.push(randomString(min, max))
	}
	return words
}

function benchBuild() {
	var wordLen = [10, 20]
	var wordNums = [20000, 40000, 60000, 80000, 100000]
	for(var i=0;i<wordNums.length;i++) {
		var words = randomWords(wordNums[i], wordLen[0], wordLen[1])
		var start = new Date().getTime()
		var scanner = new FastScanner(words)
		var end = new Date().getTime()
		console.log("build ac tree of %d words costs %dms", words.length, end - start)
	}
}

function benchSearch() {
	var wordLen = [10, 20]
	var wordNums = [20000, 40000, 60000, 80000, 100000]
	var articleLens = [20000, 40000, 60000, 80000, 100000]
	var articles = []
	for(var i=0;i<articleLens.length;i++) {
		articles.push(randomString(articleLens[i], articleLens[i]))
	}
	for(var i=0;i<wordNums.length;i++) {
		var words = randomWords(wordNums[i], wordLen[0], wordLen[1])
		var scanner = new FastScanner(words)
		for(var k=0;k<articles.length;k++) {
			var start = new Date().getTime()
			scanner.search(articles[k])
			var end = new Date().getTime()
			console.log("search article of %d chars by %s words tree costs %dms", articles[k].length, wordNums[i], end - start)
		}
	}
}

function benchMemory() {
	var wordLen = [10, 20]
	var wordNums = [0, 20000, 40000, 60000, 80000, 100000]
	for(var i=0;i<wordNums.length;i++) {
		var words = randomWords(wordNums[i], wordLen[0], wordLen[1])
		gc()
		var before = process.memoryUsage()
		var scanner = new FastScanner(words)
		gc()
		var after = process.memoryUsage()
		scanner.search('abcdefg')
		console.log("build tree of %d words costs rss=%dM heapTotal=%dM heapUsed=%dM", wordNums[i], (after.rss-before.rss) >> 20, (after.heapTotal - before.heapTotal) >> 20, (after.heapUsed - before.heapUsed) >> 20)
	}
}

benchBuild()
benchSearch()
benchMemory()

'use strict';

function FastScanner(words) {
	this.root = buildTree(words);
}

function buildTree(words) {
	// 词汇去重
	words = dedupAndSort(words);
	var root = {
		next: {}, // 子节点指针
		val: null, // 当前节点的字符，null表示根节点
		back: null, // 回溯指针，也称失败指针
		parent: null, // 父节点指针,
		depth: 0, // 节点深度
		accept: false // 是否形成了一个完整的词汇，中间节点也可能为true
	}
	// make trie tree
	for (var i = 0; i < words.length; i++) {
		addWord(root, words[i]);
	}
	// fix backtrace pointer
	fallbackAll(root);
	return root;
}

function dedupAndSort(words) {
	// 砍掉空格
	words = words.map(function (word) {
		return word.trim()
	});
	// 滤掉空串
	words = words.filter(function (word) {
		return word.length > 0
	});
	var seen = {};
	var out = [];
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (!seen[word]) {
			seen[word] = true;
			out[out.length] = word;
		}
	}
	return out.sort();
}

function addWord(root, word) {
	var current = root;
	for (var i = 0; i < word.length; i++) {
		var c = word[i];
		var next = current.next[c];
		if (!next) {
			current.next[c] = {
				next: {},
				val: c,
				accept: false,
				back: root,
				parent: current,
				depth: current.depth + 1
			}
		}
		current = current.next[c];
	}
	current.accept = true;
}

function fallbackAll(root) {
	var curExpands = [root];
	while (curExpands.length > 0) {
		var nextExpands = [];
		for (var i = 0; i < curExpands.length; i++) {
			var node = curExpands[i];
			for (var c in node.next) {
				nextExpands.push(node.next[c]);
			}
			// 根节点
			if (node.back == null) {
				break;
			}
			var parent = node.parent
			var back = parent.back
			// 第一层节点也谈不上回溯
			if (back == null) {
				continue;
			}
			// 匹配父节点的回溯节点的子节点
			for (var c in back.next) {
				if (node.val == back.next[c].val) {
					node.back = back.next[c]
					break
				}
			}
		}
		curExpands = nextExpands
	}
}

function fallback(root, word) {
	var current = root.next[word[0]]
	for (var i = 1; i < word.length; i++) {
		var c = word[i]
		var parent = current.parent
		var back = parent.back
		// 第一层节点也谈不上回溯
		if (back == null) {
			current = current.next[c]
			continue;
		}
		// 匹配父节点的回溯节点的子节点
		for (var c in back.next) {
			if (current.val == back.next[c].val) {
				current.back = back.next[c]
				break
			}
		}
		current = current.next[c]
	}
}

function selectLongest(offsetWords) {
	var stands = {}
	for (var i = 0; i < offsetWords.length; i++) {
		var offword = offsetWords[i];
		var word = stands[offword[0]];
		if (!word || word.length < offword[1].length) {
			stands[offword[0]] = offword[1];
		}
	}
	var offsets = Object.keys(stands).map(function (key) {
		return parseInt(key)
	}).sort(function (a, b) {
		return a - b
	});
	return offsets.map(function (off) {
		return [off, stands[off]]
	});
}

FastScanner.prototype.add = function add(word) {
	addWord(this.root, word)
	fallback(this.root, word)
}

function collect(node) {
	var word = [];
	while (node.val != null) {
		word.unshift(node.val);
		node = node.parent;
	}
	return word.join('')
}

FastScanner.prototype.hits = function hits(content, options) {
	var offWords = this.search(content, options);
	var seen = {};
	for (var i = 0; i < offWords.length; i++) {
		var word = offWords[i][1];
		var count = seen[word] || 0;
		seen[word] = count + 1
	}
	return seen
}

FastScanner.prototype.search = function search(content, options) {
	var offWords = [];
	var current = this.root;
	options = options || {}
	for (var i = 0; i < content.length;) {
		var c = content[i];
		var next = current.next[c];
		if (next) {
			current = next;
			i++;
			// 收集匹配的词汇
			if (next.accept) {
				var word = collect(current)
				offWords.push([i - word.length, word]);
				// 只选第一个词
				if (options.quick) {
					return offWords
				}
			}
			continue;
		}
		var back = current.back;
		if (back == null) {
			i++;
			continue;
		}
		// 回溯
		var delta = current.depth - back.depth - 1;
		current = back;
		i -= delta;
		// 收集匹配的词汇
		if (current.accept) {
			var word = collect(current)
			offWords.push([i - word.length, word]);
			// 只选第一个词
			if (options.quick) {
				return offWords
			}
		}
	}
	// 同一个位置选最长的
	if (options.longest) {
		return selectLongest(offWords)
	}
	return offWords
}

module.exports = FastScanner;
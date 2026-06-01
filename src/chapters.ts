export interface Chapter {
  id: string
  title: string
  desc: string
  guide: string
  exercises: string[]
}

export const chapters: Chapter[] = [
  {
    id: 'literal',
    title: 'Getting Started - Literal Matches',
    desc: 'Regex starts simple: type the exact text you want to find. No special syntax, just plain characters.',
    guide: `A **literal** regex is just the characters you want to match, in order.

\`\`\`
/cat/   → matches "cat" anywhere in the text
/hello/ → matches "hello" exactly
\`\`\`

**Key points:**
• Every character matches itself (except special metacharacters)
• The match is case-sensitive by default
• Use the \`i\` flag for case-insensitive matching
• Use the \`g\` flag to find ALL matches, not just the first

**Escaping:** If you need to match a special character like \`.\`, \`*\`, or \`+\`, put a backslash before it: \`\\.\` matches a literal dot.

> In the exercises, try matching "cat" and notice it also matches inside "category" - that's why we later learn about word boundaries!`,
    exercises: ['01', '33', '34', '38'],
  },
  {
    id: 'classes',
    title: 'Character Classes',
    desc: 'Match one character from a set using square brackets, or use shorthands like `\\d` for digits.',
    guide: `**Character classes** let you match any one character from a group.

\`\`\`
/[aeiou]/   → matches any vowel
/[0-9]/     → matches any digit (same as \\d)
/[a-z]/     → matches any lowercase letter
/[^0-9]/    → matches anything EXCEPT a digit
\`\`\`

**Shorthand classes** are shortcuts for common sets:
| Shorthand | Meaning | Equivalent |
|-----------|---------|------------|
| \`\\d\` | Digit | \`[0-9]\` |
| \`\\w\` | Word char | \`[a-zA-Z0-9_]\` |
| \`\\s\` | Whitespace | \`[ \\t\\n\\r\\f]\` |
| \`\\D\` | Non-digit | \`[^0-9]\` |
| \`\\W\` | Non-word | \`[^\\w]\` |
| \`\\S\` | Non-whitespace | \`[^\\s]\` |

**Ranges:** Use \`-\` inside brackets: \`[0-9a-fA-F]\` matches hex digits.

**Negation:** Use \`^\` right after the opening bracket: \`[^aeiou]\` matches anything that is NOT a vowel.

> Pro tip: Character classes match exactly ONE character. Use quantifiers like \`+\` or \`{3}\` to match multiple!`,
    exercises: ['02', '03', '04', '05', '06', '07', '08', '09'],
  },
  {
    id: 'quantifiers',
    title: 'Quantifiers',
    desc: 'Control repetition: match a pattern exactly N times, or one-or-more, or zero-or-one.',
    guide: `**Quantifiers** attach to the preceding element and control how many times it repeats.

\`\`\`
/\\d+/     → one or more digits   ("42", "7", "999")
/\\d{3}/   → exactly 3 digits     ("911", "555")
/colou?r/  → "u" is optional      ("color", "colour")
/\\d{2}:\\d{2}/ → time pattern   ("14:30", "09:15")
\`\`\`

| Quantifier | Meaning | Example |
|-----------|---------|---------|
| \`*\` | Zero or more | \`a*\` matches "", "a", "aa"… |
| \`+\` | One or more | \`a+\` matches "a", "aa"… but not "" |
| \`?\` | Zero or one | \`a?\` matches "" or "a" |
| \`{n}\` | Exactly n | \`a{3}\` matches "aaa" |
| \`{n,}\` | n or more | \`a{2,}\` matches "aa", "aaa"… |
| \`{n,m}\` | Between n and m | \`a{1,3}\` matches "a", "aa", "aaa" |

**Greedy vs Lazy:** Quantifiers are greedy by default (take as many as possible). Add \`?\` to make them lazy:
• \`/.*/\` on "abc" → matches "abc"
• \`/.*?/\` on "abc" → matches "" (zero chars, then "a", etc.)

> Most patterns use \`+\` and \`{n}\` day-to-day. Start with those!`,
    exercises: ['10', '11', '35', '12', '36', '13', '39', '31'],
  },
  {
    id: 'anchors',
    title: 'Anchors & Boundaries',
    desc: 'Match positions instead of characters: start of line, end of line, word boundaries.',
    guide: `**Anchors** don't match characters - they match positions in the text.

\`\`\`
/^Hello/m  → lines starting with "Hello"
/world$/m  → lines ending with "world"
/\\bcat\\b/   → "cat" as a whole word
/\\b\\w{5}\\b/ → exactly 5-letter words
\`\`\`

| Anchor | Meaning |
|--------|---------|
| \`^\` | Start of string (or line with \`m\` flag) |
| \`$\` | End of string (or line with \`m\` flag) |
| \`\\b\` | Word boundary (between \\w and \\W) |
| \`\\B\` | NOT a word boundary |

**Multiline mode** (\`m\` flag) changes \`^\` and \`$\` to match line boundaries instead of string boundaries. Without it, \`^\` matches only the very start of the text.

**Word boundaries** are essential for matching whole words. Without \`\\b\`, a pattern like \`cat\` will match inside "category", "scat", "catalog" etc.

> Think of anchors as "invisible checkpoints" - they assert something about the position but consume no characters.`,
    exercises: ['14', '15', '16', '37'],
  },
  {
    id: 'groups',
    title: 'Groups & Alternation',
    desc: 'Capture parts of your match, reuse captured text, and choose between alternatives.',
    guide: `**Groups** serve two purposes: grouping parts of a pattern together, and capturing the matched text for later use.

\`\`\`
/(cat|dog)/      → matches "cat" or "dog", captures it
/(\\d{4})-(\\d{2})/ → captures year and month separately
/(\\w+) \\1/      → matches repeated words ("the the")
/(?:https?:\\/\\/)?/ → non-capturing group (groups but doesn't save)
\`\`\`

| Syntax | Name | Use |
|--------|------|-----|
| \`(x)\` | Capturing group | Captures match into \`\\1\`, \`\\2\`… |
| \`(?:x)\` | Non-capturing group | Groups without saving |
| \`x|y\` | Alternation | Match x OR y |
| \`\\1\` | Backreference | Match same text as group 1 |
| \`(?<name>x)\` | Named group | Capture with a readable name |
| \`\\k<name>\` | Named backref | Reference named group |

**Capture groups** are numbered from left to right by opening parenthesis \`(\`. The full match is always group 0.

**Named groups** make patterns self-documenting: \`(?<year>\\d{4})\` vs remembering "group 1 is year".

> Groups are the most powerful regex feature - they turn "does it match?" into "what did it match and can I reuse it?"`,
    exercises: ['17', '18', '19', '20', '26'],
  },
  {
    id: 'lookaround',
    title: 'Lookahead & Lookbehind',
    desc: 'Match based on what comes before or after, without including it in the match.',
    guide: `**Lookaround** lets you match a pattern only if it is (or isn't) followed or preceded by another pattern.

\`\`\`
/\\d+(?=px)/      → digits before "px" (positive lookahead)
/\\b(?!cat\\b)\\w{3}\\b/ → 3-letter words NOT "cat"
/(?<=\\$)\\d+/     → digits after $ (positive lookbehind)
/(?<![A-Z])\\d+/  → digits NOT preceded by uppercase
\`\`\`

| Syntax | Name | Matches… |
|--------|------|----------|
| \`(?=x)\` | Positive lookahead | If followed by x |
| \`(?!x)\` | Negative lookahead | If NOT followed by x |
| \`(?<=x)\` | Positive lookbehind | If preceded by x |
| \`(?<!x)\` | Negative lookbehind | If NOT preceded by x |

**Important:** Lookaround does NOT consume characters. The pattern \`\\d(?=px)\` matches only the digit, not "px".

**Stacking lookaheads** is how you implement password validation: each lookahead checks one requirement without interfering with the others.

> Lookaround is like peeking ahead or behind without taking a step. It's essential for patterns like "extract prices" or "validate passwords".`,
    exercises: ['21', '22', '23', '27', '40'],
  },
  {
    id: 'practical',
    title: 'Practical Patterns',
    desc: 'Real-world patterns you\'ll actually use: emails, URLs, HTML, IPs, colors, and version numbers.',
    guide: `**Practical patterns** combine everything you've learned into useful real-world matchers.

\`\`\`
/\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b/  → IPv4 address
/<(\\w+)[^>]*>.*?<\\/\\1>/                    → HTML tags
/https?:\\/\\/[\\w./?=&%-]+/                   → URL with query
/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}$/     → Strong password
\`\`\`

**Email pattern breakdown:**
\`\`\`
/([\\w.-]+)@([\\w.-]+)\\.(\\w+)/
  ↑username    ↑domain     ↑TLD
\`\`\`

**HTML tag pattern breakdown:**
\`\`\`
/<(\\w+)[^>]*>.*?<\\/\\1>/
  ↑tag  ↑attrs  ↑content ↑close tag
\`\`\`

**Tips for real regex:**
• Start simple and add complexity iteratively
• Test against edge cases (empty, missing, malformed)
• Use online regex testers (like this one!)
• Document complex patterns with comments (use \`x\` flag)
• Named groups make patterns self-documenting

> Professional regex is about knowing which patterns are reliable vs "good enough". Email validation, for example, is famously complex - many production systems use a \`@\` check plus a library.`,
    exercises: ['24', '25', '28', '29', '30', '32'],
  },
]

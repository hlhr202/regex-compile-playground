// reference: https://gist.github.com/timshen91/f6a3f040e5b5b0685b2a
type Matcher = (target: string, next: (rest: string) => boolean) => boolean;

const createConcatMatcher: (
    matchLeft: Matcher,
    matchRight: Matcher
) => Matcher = (matchLeft, matchRight) => (target, next) =>
    matchLeft(target, (leftRest) =>
        matchRight(leftRest, (rightRest) => next(rightRest))
    );

const createAlternateMatcher: (
    matchLeft: Matcher,
    matchRight: Matcher
) => Matcher = (matchLeft, matchRight) => (target, next) =>
    matchLeft(target, next) || matchRight(target, next);

const createSingleMatcher: (ch: string) => Matcher = (ch) => (target, next) =>
    !!target && target[0] === ch && next(target.slice(1));

const createEpsilonMatcher: () => Matcher = () => (target, next) =>
    next(target);

const createOptionalMatcher: (matcher: Matcher) => Matcher = (matcher) =>
    createAlternateMatcher(matcher, createEpsilonMatcher());

const createRepeatMatcher: (matcher: Matcher) => Matcher =
    (matcher) => (target, next) =>
        matcher(
            target,
            (rest) =>
                (rest.length < target.length && matcher(rest, next)) ||
                next(target)
        );

const fullMatch = (target: string, matcher: Matcher) =>
    matcher(target, (rest) => rest === "");

const regexSearch = (target: string, matcher: Matcher) =>
    matcher(target, () => true) ||
    (!!target && regexSearch(target.slice(1), matcher));

const match_a = createSingleMatcher("a");
const match_b = createSingleMatcher("b");
const match_c = createSingleMatcher("c");

/**
 * Test below
 */
const testConcat = () => {
    const match_a_b = createConcatMatcher(match_a, match_b); // /ab/
    const source1 = "ab";
    const match1 = regexSearch(source1, match_a_b);
    console.log(match1); // true

    const source2 = "abc";
    const match2 = regexSearch(source2, match_a_b);
    console.log(match2); // true

    const source3 = "cab";
    const match3 = regexSearch(source3, match_a_b);
    console.log(match3); // true

    const source4 = "ac";
    const match4 = regexSearch(source4, match_a_b);
    console.log(match4); // false
};

const testAlternate = () => {
    const match_a_or_b = createAlternateMatcher(match_a, match_b); // /a|b/
    const source1 = "c";
    const match1 = regexSearch(source1, match_a_or_b);
    console.log(match1);
};

const testOptional = () => {
    const match_a_and_b_opt = createConcatMatcher(
        createConcatMatcher(match_a, createOptionalMatcher(match_b)),
        match_a
    ); // /ab?a/
    const source1 = "aba";
    const match1 = regexSearch(source1, match_a_and_b_opt);
    console.log(match1);
};

const testRepeat = () => {
    const match_ab_repeat = createRepeatMatcher(
        createConcatMatcher(createConcatMatcher(match_a, match_b), match_c)
    ); // /(abc)*/
    const source1 = "abcabc";
    const match = regexSearch(source1, match_ab_repeat);
    console.log(match);
};

testRepeat();

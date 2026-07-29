/**
 * hangulDecompose.js
 * 한글 음절 유니코드 분해 유틸리티
 * 
 * 유니코드 한글 음절 범위: U+AC00 ~ U+D7A3 (11172자)
 * 공식: syllable = 초성 × 588 + 중성 × 28 + 종성 + 0xAC00
 */

// 초성 (19개)
export const CHOSEONG_LIST = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
  'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

// 중성 (21개)
export const JUNGSEONG_LIST = [
  'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ',
  'ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
];

// 종성 (28개, 0번은 받침 없음)
export const JONGSEONG_LIST = [
  '','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ',
  'ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];

// 수직 모음 (중성이 오른쪽에 배치되는 모음들)
export const VERTICAL_VOWELS = new Set([0,1,2,3,4,5,6,7,20]); // ㅏㅐㅑㅒㅓㅔㅕㅖㅣ

/**
 * 한글 음절인지 확인
 */
export function isHangulSyllable(char) {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

/**
 * 한글 음절을 초성/중성/종성 인덱스로 분해
 */
export function decomposeHangul(char) {
  if (!isHangulSyllable(char)) return null;
  
  const code = char.charCodeAt(0) - 0xAC00;
  const jongseong = code % 28;
  const jungseong = Math.floor(code / 28) % 21;
  const choseong = Math.floor(code / 588);
  
  return {
    char,
    choseong: { index: choseong, jamo: CHOSEONG_LIST[choseong] },
    jungseong: { index: jungseong, jamo: JUNGSEONG_LIST[jungseong] },
    jongseong: { index: jongseong, jamo: JONGSEONG_LIST[jongseong] },
    hasJongseong: jongseong > 0,
    isVerticalVowel: VERTICAL_VOWELS.has(jungseong),
  };
}

/**
 * 텍스트에서 한글 음절 배열 추출 (비한글 포함)
 */
export function parseText(text) {
  return [...text].map(char => ({
    char,
    isHangul: isHangulSyllable(char),
    decomposed: isHangulSyllable(char) ? decomposeHangul(char) : null,
  }));
}

/**
 * 컴포넌트 인덱스(0,1,2)를 자소 유형으로 분류
 * UnDotum composite glyph의 컴포넌트 순서:
 *   - 받침 있는 음절: [초성, 중성, 종성] (3개)
 *   - 받침 없는 음절: [초성, 중성] (2개)
 * 
 * 단, 일부 음절은 중성이 복합(ㅘ=ㅗ+ㅏ)이어서 컴포넌트가 더 많을 수 있음
 * 이 경우 유니코드 분해 결과를 활용하여 분류
 */
export function classifyComponents(components, decomposed) {
  if (!decomposed || !components || components.length === 0) return [];
  
  const result = [];
  const { hasJongseong } = decomposed;
  
  if (hasJongseong) {
    // 3개 이상: 마지막이 종성, 첫번째가 초성, 중간이 중성
    for (let i = 0; i < components.length; i++) {
      if (i === 0) {
        result.push({ ...components[i], type: 'choseong' });
      } else if (i === components.length - 1) {
        result.push({ ...components[i], type: 'jongseong' });
      } else {
        result.push({ ...components[i], type: 'jungseong' });
      }
    }
  } else {
    // 2개 이상: 마지막이 중성, 첫번째가 초성
    for (let i = 0; i < components.length; i++) {
      if (i === 0) {
        result.push({ ...components[i], type: 'choseong' });
      } else {
        result.push({ ...components[i], type: 'jungseong' });
      }
    }
  }
  
  return result;
}

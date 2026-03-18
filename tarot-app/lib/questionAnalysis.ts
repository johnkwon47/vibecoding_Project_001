/**
 * 질문 분석 모듈
 * 
 * 타로 리딩의 품질 향상을 위해 질문자의 질문을 분석하여
 * 질문 유형, 핵심 의도, 맥락을 파악합니다.
 */

export interface QuestionAnalysis {
  /** 질문 유형 */
  type: QuestionType;
  /** 질문 영역 */
  domain: QuestionDomain;
  /** 시간 지향 (과거/현재/미래) */
  timeOrientation: TimeOrientation;
  /** 질문의 핵심 의도 */
  coreIntent: string;
  /** 추출된 핵심 키워드 */
  keywords: string[];
  /** 감정 톤 */
  emotionalTone: EmotionalTone;
  /** 구체성 수준 (1-5, 5가 가장 구체적) */
  specificityLevel: number;
}

export type QuestionType =
  | "yes-no"           // 예/아니오 질문 (가능성)
  | "choice"           // 선택 질문 (A vs B)
  | "timing"           // 시기 질문
  | "how"              // 방법 질문
  | "why"              // 이유 질문
  | "what-if"          // 가정 질문
  | "general"          // 일반적/열린 질문
  | "advice";          // 조언 요청

export type QuestionDomain =
  | "love"             // 연애/관계
  | "career"           // 직업/커리어
  | "money"            // 재정/금전
  | "health"           // 건강
  | "self-growth"      // 자기계발/성장
  | "decision"         // 의사결정
  | "relationship"     // 인간관계
  | "general";         // 일반

export type TimeOrientation =
  | "past"             // 과거 회고
  | "present"          // 현재 상황
  | "future"           // 미래 전망
  | "mixed";           // 복합

export type EmotionalTone =
  | "anxious"          // 불안/걱정
  | "hopeful"          // 희망적
  | "confused"         // 혼란스러움
  | "frustrated"       // 좌절/답답함
  | "curious"          // 호기심
  | "neutral";         // 중립적

/**
 * 질문을 분석하여 유형, 영역, 의도를 파악합니다.
 */
export function analyzeQuestion(question: string): QuestionAnalysis {
  const lowerQ = question.toLowerCase().trim();
  
  // 질문 유형 분석
  const type = detectQuestionType(lowerQ);
  
  // 질문 영역 분석
  const domain = detectQuestionDomain(lowerQ);
  
  // 시간 지향 분석
  const timeOrientation = detectTimeOrientation(lowerQ);
  
  // 핵심 의도 추출
  const coreIntent = extractCoreIntent(question, type);
  
  // 키워드 추출
  const keywords = extractKeywords(lowerQ);
  
  // 감정 톤 분석
  const emotionalTone = detectEmotionalTone(lowerQ);
  
  // 구체성 수준 측정
  const specificityLevel = measureSpecificity(lowerQ);
  
  return {
    type,
    domain,
    timeOrientation,
    coreIntent,
    keywords,
    emotionalTone,
    specificityLevel,
  };
}

/**
 * 질문 유형 감지
 */
function detectQuestionType(question: string): QuestionType {
  // 예/아니오 질문
  if (
    /^(할 수 있을까|될까|되나|가능할까|될 수 있나|성공할까|이루어질까|맺어질까)/.test(question) ||
    /(\?|인지|일까|할까)$/.test(question) && /(될|할|갈|올|올까)/.test(question)
  ) {
    return "yes-no";
  }
  
  // 선택 질문
  if (/(vs|대|또는|아니면|중|둘 중|어느|어떤 것)/.test(question)) {
    return "choice";
  }
  
  // 시기 질문
  if (/(언제|얼마나|시기|타이밍|때|기간)/.test(question)) {
    return "timing";
  }
  
  // 방법 질문
  if (/(어떻게|방법|해야|하면|노력|할 수|전략)/.test(question)) {
    return "how";
  }
  
  // 이유 질문
  if (/(왜|이유|원인|어째서|때문)/.test(question)) {
    return "why";
  }
  
  // 가정 질문
  if (/(만약|~면|가정|한다면)/.test(question)) {
    return "what-if";
  }
  
  // 조언 요청
  if (/(조언|충고|말해|알려|가이드|도움|해줘)/.test(question)) {
    return "advice";
  }
  
  return "general";
}

/**
 * 질문 영역 감지
 */
function detectQuestionDomain(question: string): QuestionDomain {
  // 연애/관계
  if (/(연애|사랑|애인|남자친구|여자친구|썸|짝사랑|이별|재회|결혼|배우자|데이트)/.test(question)) {
    return "love";
  }
  
  // 직업/커리어
  if (/(직장|회사|커리어|취업|이직|승진|사업|창업|프로젝트|업무|일)/.test(question)) {
    return "career";
  }
  
  // 재정/금전
  if (/(돈|재정|수입|월급|투자|금전|매출|수익|경제|재산)/.test(question)) {
    return "money";
  }
  
  // 건강
  if (/(건강|몸|병|치료|회복|아픈|건강)/.test(question)) {
    return "health";
  }
  
  // 자기계발/성장
  if (/(성장|발전|배움|공부|학습|수행|자기계발|변화|성숙)/.test(question)) {
    return "self-growth";
  }
  
  // 의사결정
  if (/(결정|선택|고민|망설|결심|판단)/.test(question)) {
    return "decision";
  }
  
  // 인간관계
  if (/(관계|친구|동료|가족|사람|인간관계|갈등|소통)/.test(question)) {
    return "relationship";
  }
  
  return "general";
}

/**
 * 시간 지향 감지
 */
function detectTimeOrientation(question: string): TimeOrientation {
  const hasPast = /(과거|했던|했나|보냈|이전|예전|전에)/.test(question);
  const hasPresent = /(현재|지금|요즘|최근|오늘|이번)/.test(question);
  const hasFuture = /(미래|앞으로|다음|곧|예정|계획|될|할|갈|올)/.test(question);
  
  const count = [hasPast, hasPresent, hasFuture].filter(Boolean).length;
  
  if (count > 1) return "mixed";
  if (hasPast) return "past";
  if (hasPresent) return "present";
  if (hasFuture) return "future";
  
  // 기본값: 현재
  return "present";
}

/**
 * 핵심 의도 추출
 */
function extractCoreIntent(question: string, type: QuestionType): string {
  // 질문에서 핵심 동사나 명사구를 찾아 의도를 요약
  const cleaned = question.replace(/[?!.,;]/g, "").trim();
  
  switch (type) {
    case "yes-no":
      return `가능성과 잠재력 확인: ${cleaned}`;
    case "choice":
      return `최선의 선택지 탐색: ${cleaned}`;
    case "timing":
      return `적절한 시기 파악: ${cleaned}`;
    case "how":
      return `구체적인 실천 방법 모색: ${cleaned}`;
    case "why":
      return `근본 원인과 이유 이해: ${cleaned}`;
    case "what-if":
      return `가능한 시나리오 탐색: ${cleaned}`;
    case "advice":
      return `실질적인 조언과 방향 요청: ${cleaned}`;
    default:
      return `현재 상황과 흐름 이해: ${cleaned}`;
  }
}

/**
 * 키워드 추출
 */
function extractKeywords(question: string): string[] {
  const keywords: string[] = [];
  
  // 주요 명사 패턴 매칭
  const nounPatterns = [
    /연애|사랑|관계|이별|재회/g,
    /직장|회사|일|커리어|사업/g,
    /돈|재정|수입|투자/g,
    /건강|몸|병/g,
    /성장|발전|변화/g,
    /선택|결정|고민/g,
    /친구|가족|동료/g,
  ];
  
  for (const pattern of nounPatterns) {
    const matches = question.match(pattern);
    if (matches) {
      keywords.push(...matches);
    }
  }
  
  // 중복 제거 및 최대 5개
  return [...new Set(keywords)].slice(0, 5);
}

/**
 * 감정 톤 감지
 */
function detectEmotionalTone(question: string): EmotionalTone {
  // 불안/걱정
  if (/(불안|걱정|두렵|무섭|염려|우려|겁)/.test(question)) {
    return "anxious";
  }
  
  // 좌절/답답함
  if (/(답답|막막|힘들|어렵|지쳤|포기|실패)/.test(question)) {
    return "frustrated";
  }
  
  // 혼란스러움
  if (/(혼란|헷갈|모르겠|확신|망설|갈피)/.test(question)) {
    return "confused";
  }
  
  // 희망적
  if (/(희망|기대|바람|원해|되고 싶|이루|성공)/.test(question)) {
    return "hopeful";
  }
  
  // 호기심
  if (/(궁금|알고 싶|어떤|어때|누구)/.test(question)) {
    return "curious";
  }
  
  return "neutral";
}

/**
 * 구체성 수준 측정 (1-5)
 */
function measureSpecificity(question: string): number {
  let score = 1;
  
  // 구체적인 시간 표현
  if (/(올해|이번 달|다음 주|내년|~월|~일)/.test(question)) score += 1;
  
  // 구체적인 대상
  if (/(그|그녀|그 사람|그 회사|~와|~과|~에게)/.test(question)) score += 1;
  
  // 구체적인 상황 설명
  if (question.length > 30) score += 1;
  
  // 숫자나 측정 단위
  if (/\d+|년|개월|주|일|년도/.test(question)) score += 1;
  
  return Math.min(score, 5);
}

/**
 * 질문 분석 결과를 읽기 쉬운 텍스트로 변환
 */
export function formatAnalysis(analysis: QuestionAnalysis): string {
  const typeLabels: Record<QuestionType, string> = {
    "yes-no": "가능성 질문",
    "choice": "선택 질문",
    "timing": "시기 질문",
    "how": "방법 질문",
    "why": "이유 질문",
    "what-if": "가정 질문",
    "general": "일반 질문",
    "advice": "조언 요청",
  };
  
  const domainLabels: Record<QuestionDomain, string> = {
    "love": "연애/관계",
    "career": "직업/커리어",
    "money": "재정/금전",
    "health": "건강",
    "self-growth": "자기계발",
    "decision": "의사결정",
    "relationship": "인간관계",
    "general": "일반",
  };
  
  return `
질문 유형: ${typeLabels[analysis.type]}
질문 영역: ${domainLabels[analysis.domain]}
시간 지향: ${analysis.timeOrientation}
감정 톤: ${analysis.emotionalTone}
구체성: ${analysis.specificityLevel}/5
핵심 의도: ${analysis.coreIntent}
키워드: ${analysis.keywords.join(", ") || "없음"}
  `.trim();
}

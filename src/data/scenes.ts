import { TextLineType } from '../types/game'

export interface ScriptLine {
  type: TextLineType
  text: string
  // ghost_takeover 타입에서 일반 텍스트와 귀신 텍스트를 분리
  ghostWord?: string  // 이 단어만 귀신 스타일로 렌더링
}

export const SCENES: Record<string, ScriptLine[]> = {
  SCENE_01: [
    { type: 'narration', text: '회사가 격리해 둔 Qterw-D-718 확정 진입 건물.' },
    { type: 'narration', text: '낡은 임대 아파트. 수도는 끊겼으나 전력은 공급 중.' },
    { type: 'inner', text: '가자.' },
    { type: 'narration', text: '그늘진 복도 끝, 홀로 운행 중인 기기.' },
    { type: 'system', text: '[5F]' },
  ],
  SCENE_02: [
    { type: 'narration', text: '-수리 중-' },
    { type: 'narration', text: '빠르게 고치겠습니다. 행복나라아파트 경비실' },
    { type: 'inner', text: '바로 이거다.' },
    { type: 'narration', text: '떨리는 손으로 엘리베이터를 호출했다.' },
    { type: 'system', text: '[땡]' },
    { type: 'narration', text: '열리는 문 사이로 녹슬고 어둑한 내부. 바닥은 그을음으로 더럽다.' },
    { type: 'narration', text: '오른쪽과 왼쪽에 나란히 붙어 있는 것— 손자국이 난 더러운 거울.' },
    { type: 'inner', text: '…후.' },
    { type: 'system', text: '[문이 닫힙니다.]' },
  ],
  SCENE_03: [
    { type: 'system', text: '[올라갑니다.] 띵.' },
    { type: 'narration', text: '버튼을 누르지 않았는데도 엘리베이터가 움직인다.' },
    { type: 'system', text: '※ 엘리베이터가 혼자 움직이기 시작했다면 의식 진입 성공.' },
    { type: 'system', text: '1. 이제부터 최고층에 도착할 때까지 거울 속의 나와 가위바위보를 한다.' },
    { type: 'system', text: '※ 의식 도중 3초 이상 손이 사라지지 않게 하십시오.' },
  ],
  PHASE_2_ENTRY: [
    { type: 'system', text: '[덜컹.]' },
    { type: 'narration', text: '모든 버튼의 붉은 불이 꺼진다.' },
    { type: 'system', text: '1930819F' },
    { type: 'inner', text: '미친…….' },
    { type: 'narration', text: '귀신이 내 옆에 서 있다.' },
    { type: 'system', text: '6. 이제부턴 거울 속의 존재가 의식을 진행한다.' },
    { type: 'system', text: '※ 거울 속 나와의 가위바위보를 응하지 않을 시, 판정승을 넘긴다. 명복을 빈다.' },
  ],
  INSIGHT: [
    { type: 'inner', text: '……잠깐.' },
    { type: 'inner', text: '여태 귀신이 가위를 낸 적이 있던가?' },
    { type: 'inner', text: '가위, 바위, 보. 가위, 바위, 보…….' },
    { type: 'inner', text: '한 번도 없었다.' },
  ],
  PHASE2_ROUND2_TIE: [
    { type: 'inner', text: '역시.' },
    { type: 'inner', text: '귀신은 가위를 못 낸다.' },
  ],
  PHASE2_ROUND3_SETUP: [
    { type: 'inner', text: '……거울 속의 귀신이 가위를 못 낸다면.' },
    { type: 'inner', text: '내가 손가락을 구속하면—' },
    { type: 'narration', text: '주머니에서 펜과 고무줄을 꺼냈다.' },
    { type: 'narration', text: '검지와 엄지에 하나씩, 구부릴 수 없도록 고정.' },
    { type: 'inner', text: '빨리.' },
  ],
  WIN: [
    { type: 'narration', text: '이겼다.' },
    { type: 'system', text: '쾅!' },
    { type: 'narration', text: '귀신이 거울에 머리를 처박았다. 쾅쾅쾅쾅쾅쾅!' },
    { type: 'narration', text: '거울이 금이 가고 깨져 나갔다.' },
    { type: 'narration', text: '거울 속에서 고개를 든 것은 도저히 사람이 할 수 없는 이상한 표정으로 나를 노려보다가—' },
    { type: 'narration', text: '깔깔깔깔!! 미친 듯이 웃으며 뛰쳐나갔다.' },
  ],
  BAD_ENDING_TEXT: [
    { type: 'narration', text: '엘리베이터가 멈췄다.' },
    { type: 'system', text: '99. 3번의 대답 이후로 여기까지 스크롤을 내릴 정도의 시간이라면—' },
    { type: 'ghost_takeover', text: '나는 지금', ghostWord: '아주 행복하다.' },
    { type: 'ghost_takeover', text: '빨리 집에', ghostWord: '가지 않아도 된다.' },
    { type: 'ghost_takeover', text: '엘리베이터 밖으로', ghostWord: '나가고 싶지 않다.' },
    { type: 'ghost_takeover', text: '나는', ghostWord: '거울 속이 좋다.' },
    { type: 'system', text: '아마 지금쯤 당신은 처음 이 의식서를 읽기 시작한 그 사람이 아닐 것이다.\n거울 밖에서 행복하게 사시길 바라요! 전 찾아오지 마세요 제발.' },
  ],
  ESCAPE_FROST: [
    { type: 'system', text: '[내려갑니다.]' },
    { type: 'narration', text: '층수 표시등이 정상으로 돌아온다.' },
    { type: 'system', text: '3. 최고층에서 내려서 가까운 유리창을 찾아라.' },
    { type: 'narration', text: '유리창이 서리로 덮여 있다.' },
  ],
  ESCAPE_HOLD: [
    { type: 'system', text: '11. 반드시 열림 버튼을 누르고 있어야 한다. 절대로 버튼에서 손을 떼지 말 것.' },
    { type: 'narration', text: '왼쪽 거울 속, 고개를 푹 숙인 귀신이 점점 가까워진다.' },
    { type: 'ghost', text: '나가고싶어나가고싶어나가고싶어나가고싶어…' },
  ],
  SCENE_10: [
    { type: 'system', text: '유리창에 원하는 질문을 적으면, 어떤 질문이든 거울 속에 있던 존재가 답변해 준다. 이 답변은 반드시 진실이다.' },
  ],
  TRUE_ENDING: [
    { type: 'inner', text: '하자. 할 수 있다.' },
  ],
}

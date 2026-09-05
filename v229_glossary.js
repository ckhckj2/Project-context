(()=>{
'use strict';
const VERSION='2.1.29';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const previousRunSearch=window.runSearch;
const CUE=/(뭐야|뭔데|무엇|뜻|정의|뭐하는|어떤\s*(?:프로그램|사이트|기관|시스템|문서)|설명|처음|다운|설치|어디서\s*(?:받|다운)|홈페이지|공식\s*사이트|왜\s*써)/i;

const TERMS=[
{id:'seumteo',name:'세움터',kind:'사이트 · 건축행정시스템',re:/세움터/i,summary:'국토교통부의 건축행정시스템이에요. 건축 관련 민원과 행정업무를 전자적으로 처리하는 곳입니다.',work:'건축허가·신고, 착공, 사용승인, 주택인허가, 건축물대장, 건축위원회심의 등 건축행정 업무에서 접하게 됩니다.',start:'신입이라면 먼저 “세움터 = 건축행정 업무를 처리하는 시스템”이라고 이해하고, 지금 프로젝트가 어떤 인허가 경로인지 확인한 뒤 필요한 메뉴를 찾으면 됩니다.',caution:'모든 프로젝트가 똑같은 메뉴·서류를 쓰는 것은 아닙니다. 원래 승인·허가 경로부터 확인하세요.',links:[['세움터 공식 사이트','https://www.eais.go.kr/main']],action:['세움터 실무 가이드 보기','세움터 어떻게 써요?'],related:[['건축허가','건축허가가 뭐야?'],['사용승인','사용승인이 뭐야?'],['건축물대장','건축물대장이 뭐야?']]},
{id:'qgis',name:'QGIS',kind:'프로그램 · GIS',re:/\bqgis\b|큐지아이에스/i,summary:'지도와 위치정보를 다루는 무료 오픈소스 GIS 프로그램이에요.',work:'건축설계에서는 지적·필지, 용도지역, 도시계획, 주변 시설, 지형 같은 공간데이터를 레이어로 겹쳐 대지와 주변 조건을 분석할 때 많이 씁니다.',start:'처음이라면 “프로그램 설치 → 공간데이터 불러오기 → 좌표계 확인 → 필요한 레이어 겹치기” 정도의 흐름부터 익히면 됩니다.',caution:'QGIS 화면은 분석 도구입니다. 법적 경계나 최종 적용 여부는 최신 공적 자료와 측량성과로 다시 확인합니다.',links:[['QGIS 공식 다운로드','https://qgis.org/download/']],action:['QGIS 확인 업무 시작하기','QGIS에서 지적 필지 경계 확인해달래'],related:[['좌표계','좌표계가 뭐야?'],['지적도','지적도가 뭐야?'],['토지이음','토지이음이 뭐야?']]},
{id:'pps',name:'조달청',kind:'기관 · 공공조달',re:/조달청/i,summary:'국가·공공기관의 물품·공사·용역 조달을 지원하고 수행하는 중앙행정기관이에요.',work:'건축설계에서는 공공 설계용역, 설계공모, 입찰, 시설공사 계약 등에서 접할 수 있습니다.',start:'먼저 “이 사업을 발주기관이 직접 발주하는지, 조달청에 조달을 요청한 사업인지”를 구분하면 됩니다.',caution:'공공건축이라고 해서 조달청이 모든 설계용역을 직접 발주하는 것은 아닙니다.',links:[['조달청 공식 사이트','https://www.pps.go.kr/']],action:['공공건축 발주 흐름 보기','공공건축 발주 흐름이 어떻게 돼?'],related:[['나라장터','나라장터가 뭐야?'],['설계공모','설계공모가 뭐야?'],['과업지시서','과업지시서가 뭐야?']]},
{id:'g2b',name:'나라장터',kind:'사이트 · 전자조달',re:/나라장터|\bg2b\b/i,summary:'공공기관의 공고·입찰·계약·대금지급 등 조달과정을 온라인으로 처리하는 국가종합전자조달시스템이에요.',work:'설계공모나 설계용역 입찰 공고를 찾고, 공고문·과업지시서·설계지침서·변경공고 등을 확인할 때 사용합니다.',start:'공고 제목만 보지 말고 공고번호·발주기관·마감일을 확인한 뒤 첨부문서와 변경공고를 함께 보는 습관이 중요합니다.',caution:'실제 참가·제출 기준은 해당 공고의 최신 첨부문서가 우선입니다.',links:[['나라장터 공식 사이트','https://www.g2b.go.kr/']],action:['나라장터에서 무엇을 봐야 해?','나라장터에서 공공건축 공고를 볼 때 무엇부터 확인해?'],related:[['조달청','조달청은 뭐하는 곳이야?'],['설계공모','설계공모가 뭐야?'],['입찰','입찰이 뭐야?']]},
{id:'land',name:'토지이음',kind:'사이트 · 토지이용정보',re:/토지이음/i,summary:'토지의 용도지역·지구·구역과 도시계획 관련 정보를 확인하는 국토교통부 서비스예요.',work:'프로젝트 초기에 대상 지번을 넣고 토지이용계획, 도시계획 조건, 관련 규제의 출발점을 확인할 때 자주 사용합니다.',start:'지번을 정확히 확인한 뒤 토지이용계획을 보고, 중요한 조건은 최신 고시·결정도서와 법령으로 다시 확인하세요.',caution:'토지이음 화면만으로 세부 지구단위계획 내용이나 최신 행정해석까지 끝내지 않습니다.',links:[['토지이음 공식 사이트','https://www.eum.go.kr/']],action:['토지이음 실무 가이드 보기','토지이음에서 뭘 봐요?'],related:[['지구단위계획','지구단위계획이 뭐야?'],['용도지역','용도지역이 뭐야?'],['지번','지번이 뭐야?']]},
{id:'lawcenter',name:'국가법령정보센터',kind:'사이트 · 법령검색',re:/국가법령정보센터|법령정보센터/i,summary:'현행 법령·시행령·시행규칙·행정규칙·자치법규 등을 검색하고 원문을 확인하는 공식 법령정보 서비스예요.',work:'법규검토에서 조문 원문, 별표, 개정 이력, 관련 시행령·시행규칙을 확인할 때 기본 도구로 사용합니다.',start:'검색 결과 요약만 보지 말고 시행일·현행 여부·조문·별표까지 확인하고, 지자체 기준은 자치법규와 고시도 함께 보세요.',caution:'법령 원문 확인과 실제 프로젝트 적용 판단은 다른 단계입니다.',links:[['국가법령정보센터','https://www.law.go.kr/']],action:['법규검토 시작하기','법규검토 업무를 요청받았어요. 무엇부터 보면 될까요?'],related:[['법제처','법제처가 뭐하는 곳이야?'],['시행령','시행령이 뭐야?'],['조례','조례가 뭐야?']]},
{id:'moleg',name:'법제처',kind:'기관 · 법제행정',re:/법제처/i,summary:'정부의 법제업무를 담당하는 중앙행정기관이에요.',work:'건축 실무에서는 법령 자체를 검색할 때 법제처가 운영하는 국가법령정보센터를 자주 접하게 됩니다.',start:'“법제처 = 기관”, “국가법령정보센터 = 법령을 찾아보는 서비스”로 구분해두면 이해가 쉽습니다.',caution:'개별 프로젝트의 허가 여부를 법제처가 대신 판단해주는 구조는 아닙니다.',links:[['법제처','https://www.moleg.go.kr/'],['국가법령정보센터','https://www.law.go.kr/']],related:[['국가법령정보센터','국가법령정보센터가 뭐야?'],['법규검토','법규검토가 뭐야?']]},
{id:'district',name:'지구단위계획',kind:'도시계획 · 규제/계획기준',re:/지구단위계획|지구단위/i,summary:'특정 구역의 토지이용과 건축물의 배치·높이·용도·형태 등을 보다 구체적으로 정하는 도시관리계획이에요.',work:'대지의 건폐율·용적률·높이·벽면선·공개공지·차량출입 등 설계에 직접 영향을 주는 기준이 들어갈 수 있습니다.',start:'토지이음에서 해당 여부를 보고, 지자체의 최신 결정도서·고시 원문까지 찾아 확인하세요.',caution:'요약 화면보다 최신 결정도서가 중요합니다.',action:['지구단위계획 확인 업무 시작하기','지구단위계획 조사 업무를 요청받았어요. 무엇부터 확인해?'],related:[['토지이음','토지이음이 뭐야?'],['결정도서','결정도서가 뭐야?']]},
{id:'publicreview',name:'공공건축심의',kind:'절차 · 공공건축',re:/공공건축심의/i,summary:'공공건축 사업의 건축기획 내용 등을 설계 발주 전에 검토하는 절차예요.',work:'사업 목표, 규모, 예산, 발주방식, 과업내용 같은 앞단의 계획이 적절한지 검토하고 이후 설계 발주와 연결됩니다.',start:'우리 사업이 심의 대상인지 먼저 확인하고, 사전검토 대상이면 그 절차와 순서를 함께 봅니다.',caution:'일반적인 “설계안 디자인 심의”와 같은 개념으로 보면 안 됩니다.',action:['공공건축 발주 흐름에서 보기','공공건축심의 언제 해?'],related:[['건축기획','건축기획이 뭐야?'],['설계공모','설계공모가 뭐야?'],['조달청','조달청은 뭐하는 곳이야?']]},
{id:'buildingreview',name:'건축심의',kind:'절차 · 건축위원회',re:/건축심의|건축위원회\s*심의/i,summary:'법령·조례 등에 따라 건축위원회가 건축계획의 특정 사항을 검토하는 절차를 실무에서 흔히 부르는 말이에요.',work:'대상 규모·용도·지역에 따라 심의 대상과 제출자료가 달라지고, 심의 의견을 설계에 반영하게 됩니다.',start:'먼저 관할 지자체의 심의 대상 기준과 심의 체크리스트·제출요건을 확인하세요.',caution:'모든 건축물이 건축심의를 받는 것은 아니며 다른 심의와 통합되는 경우도 있습니다.',related:[['경관심의','경관심의가 뭐야?'],['인허가','인허가가 뭐야?']]},
{id:'landscape',name:'경관심의',kind:'절차 · 경관',re:/경관심의/i,summary:'경관 관련 법령·조례에 따라 건축물이나 개발사업이 주변 경관과 조화를 이루는지 검토하는 절차예요.',work:'배치·높이·스카이라인·입면·색채·야간경관·주변 맥락 등이 주요 검토 대상이 될 수 있습니다.',start:'관할 지자체 기준에서 대상 여부와 제출도서·심의 시점을 먼저 확인하세요.',caution:'대상 여부와 심의 범위는 지역·사업 조건에 따라 달라집니다.',related:[['건축심의','건축심의가 뭐야?'],['입면','입면 검토가 뭐야?']]},
{id:'bf',name:'BF',kind:'인증 · 접근성',re:/\bbf\b|장애물\s*없는\s*생활환경|장애물없는생활환경/i,summary:'Barrier Free의 약자로, 국내에서는 “장애물 없는 생활환경” 인증을 뜻할 때 많이 써요.',work:'장애인·노인·임산부 등 다양한 이용자가 시설을 편리하고 안전하게 이용할 수 있도록 접근·이동·이용환경을 검토합니다.',start:'프로젝트가 인증 의무·대상인지 먼저 확인하고, 출입구·주차·보행·화장실·수직동선 등 관련 계획을 초기부터 반영합니다.',caution:'단순히 장애인 화장실만 맞추는 업무가 아닙니다.',related:[['장애인 편의시설','장애인 편의시설 검토가 뭐야?'],['인증','인증 업무가 뭐야?']]},
{id:'zeb',name:'ZEB',kind:'인증 · 에너지',re:/\bzeb\b|제로에너지건축물|제로에너지/i,summary:'Zero Energy Building의 약자로, 건축물의 에너지 성능과 신재생에너지 등을 종합해 평가하는 제로에너지건축물 제도를 말해요.',work:'에너지 요구량·소요량, 단열·창호·설비, 신재생에너지 계획 등이 건축과 설비 설계에 연결됩니다.',start:'프로젝트의 적용 대상과 목표 수준을 먼저 확인하고 에너지 담당과 초기부터 계획을 맞추세요.',caution:'설계 막판에 인증 서류만 준비하는 업무로 보면 수정량이 커질 수 있습니다.',related:[['에너지절약계획서','에너지절약계획서가 뭐야?'],['친환경','친환경 인증이 뭐야?']]},
{id:'rfp',name:'RFP',kind:'문서 · 발주',re:/\brfp\b|제안요청서/i,summary:'Request for Proposal, 즉 제안요청서예요. 발주자가 원하는 업무·조건·제안 내용을 정리한 문서입니다.',work:'프로젝트 목표, 범위, 일정, 평가기준, 요구 성과물 등을 파악하는 출발점이 됩니다.',start:'처음 받으면 업무범위·필수 제출물·일정·평가기준·질의 절차부터 표시하세요.',caution:'RFP의 요구조건과 계약 후 실제 과업범위가 동일한지 계약문서도 함께 확인해야 합니다.',related:[['과업지시서','과업지시서가 뭐야?'],['설계공모','설계공모가 뭐야?']]},
{id:'brief',name:'과업지시서',kind:'문서 · 설계용역',re:/과업지시서|과업내용서/i,summary:'발주자가 이번 용역에서 설계자가 수행해야 할 업무 범위와 조건을 정리한 문서예요.',work:'설계 범위, 단계별 성과품, 보고·협의, 일정, 조사·검토사항, 각종 요구조건을 확인하는 기준이 됩니다.',start:'“무엇을 해야 하는지 / 무엇을 제출하는지 / 언제까지인지 / 누구와 협의하는지” 네 항목부터 표시하세요.',caution:'모호한 문구는 혼자 해석하지 말고 착수 단계에서 PM과 발주처 질의로 기준을 고정하는 게 좋습니다.',action:['공공발주에서 과업지시서 보기','과업지시서에서 무엇부터 봐야 해?'],related:[['RFP','RFP가 뭐야?'],['설계지침서','설계지침서가 뭐야?']]},
{id:'pm',name:'PM',kind:'역할 · 프로젝트관리',re:/\bpm\b|프로젝트\s*매니저|프로젝트\s*관리자/i,summary:'Project Manager의 약자로, 프로젝트의 의사결정과 일정·업무·협업을 종합적으로 조율하는 역할을 말해요.',work:'설계사무소에서는 프로젝트의 방향, 발주처 협의, 업무분배, 일정, 주요 의사결정 등을 조정하는 역할로 쓰입니다.',start:'회사마다 직급과 PM의 권한이 다르니 “우리 프로젝트에서 누가 최종 조율자이고 어떤 결정을 맡는지”를 먼저 파악하세요.',caution:'PM은 법정 자격명이 아니라 회사·프로젝트 운영상 역할로 쓰이는 경우가 많습니다.',related:[['책임','책임 역할이 뭐야?'],['발주처','발주처가 뭐야?']]},
{id:'supervision',name:'감리',kind:'업무 · 공사단계',re:/감리/i,summary:'설계도서와 관련 기준에 맞게 공사가 이루어지는지 확인하고 필요한 기술적 검토·보고를 수행하는 업무예요.',work:'설계단계가 끝난 뒤 현장에서 도면·시공상태·변경사항 등을 검토하는 과정과 연결됩니다.',start:'신입이라면 “설계자가 그리는 일”과 “공사가 설계·기준에 맞는지 확인하는 일”을 구분해 이해하면 됩니다.',caution:'감리의 법적 범위와 책임은 프로젝트 유형과 관련 법령에 따라 달라질 수 있습니다.',related:[['샵드로잉','샵드로잉이 뭐야?'],['설계변경','설계변경이 뭐야?']]},
{id:'detaildesign',name:'실시설계',kind:'설계단계',re:/실시설계/i,summary:'실제로 공사와 발주에 사용할 수 있도록 설계 내용을 구체화하고 도서화하는 단계예요.',work:'평면·단면·입면·상세·재료·구조·설비 협의 등 계획을 실제 시공 가능한 수준으로 정리합니다.',start:'계획설계보다 훨씬 많은 협력업체 정보와 상세 조건이 연결된다는 점을 먼저 이해하면 됩니다.',caution:'회사·계약마다 단계명과 요구 성과품 범위는 다를 수 있습니다.',related:[['계획설계','계획설계가 뭐야?'],['중간설계','중간설계가 뭐야?'],['설계도서','설계도서가 뭐야?']]},
{id:'ve',name:'VE',kind:'검토 · 가치공학',re:/\bve\b|가치공학/i,summary:'Value Engineering의 약자로, 필요한 성능과 품질을 유지하면서 비용·시공성·효율을 함께 개선하는 검토를 말해요.',work:'재료, 공법, 구조, 설비, 공간구성 등을 대안 비교해 비용과 성능을 같이 보는 과정에서 등장합니다.',start:'“싸게 만드는 것”보다 요구 성능을 유지하면서 더 나은 대안을 찾는 검토라고 이해하세요.',caution:'비용 절감만 강조하면 설계 의도·성능·운영성이 훼손될 수 있습니다.',related:[['대안검토','대안검토가 뭐야?'],['공사비','공사비 검토가 뭐야?']]},
{id:'shop',name:'샵드로잉',kind:'도면 · 시공상세',re:/샵\s*드로잉|shop\s*drawing/i,summary:'시공자가 실제 제작·설치·시공을 위해 작성하는 상세도면을 실무에서 샵드로잉이라고 불러요.',work:'외장, 철골, 창호, 가구, 설비 등 제작·설치가 필요한 분야에서 설계도서를 바탕으로 더 구체적인 치수와 접합·시공방법을 정리합니다.',start:'설계도와 샵드로잉의 내용이 다르면 왜 달라졌는지와 설계 의도·다른 공종 영향부터 확인하세요.',caution:'샵드로잉이 설계자의 설계도서를 자동으로 대체하는 것은 아닙니다.',related:[['상세도','상세도가 뭐야?'],['감리','감리가 뭐야?']]},
{id:'redline',name:'레드라인',kind:'표시 · 도면수정',re:/레드\s*라인|redline/i,summary:'도면에서 수정·검토할 부분을 표시한 주석이나 마크업을 실무에서 흔히 레드라인이라고 불러요.',work:'선임·발주처·협력업체가 도면에 수정 지시나 검토 의견을 표시하고, 설계자가 이를 반영할 때 사용합니다.',start:'표시된 한 장만 고치지 말고 같은 변경이 영향을 주는 평면·단면·입면·면적표·모델까지 확인하세요.',caution:'수정 반영 후에도 누가 언제 어떤 코멘트를 반영했는지 버전을 추적할 수 있어야 합니다.',action:['도면 수정 업무 시작하기','레드라인 코멘트 반영하래'],related:[['리비전','리비전이 뭐야?'],['도면수정','도면 수정은 어떻게 시작해?']]},
{id:'competition',name:'설계공모',kind:'발주방식 · 공공/민간',re:/설계공모|제안공모/i,summary:'설계안을 제안받아 심사를 통해 설계자를 선정하는 방식이에요.',work:'공고문과 설계지침서에 따라 참가자격·일정·제출물·심사기준을 확인하고 설계안을 제출합니다.',start:'공고문 → 지침서 → 과업내용 → 질의응답/변경공고 순으로 기준문서를 정리하세요.',caution:'모든 공공건축이 설계공모로 발주되는 것은 아닙니다.',action:['설계공모 실무 흐름 보기','설계공모는 어떻게 진행돼?'],related:[['나라장터','나라장터가 뭐야?'],['과업지시서','과업지시서가 뭐야?']]},
{id:'permit',name:'인허가',kind:'업무 · 행정절차',re:/인허가/i,summary:'설계·사업을 진행하기 위해 관계 법령에 따라 허가·인가·승인·신고·심의 등을 거치는 행정절차를 실무에서 묶어 부르는 말이에요.',work:'건축허가뿐 아니라 사업계획승인, 각종 심의·협의, 특별법상 승인 등 프로젝트마다 다른 절차가 포함될 수 있습니다.',start:'먼저 “이 프로젝트가 원래 어떤 법과 사업방식으로 진행되는지”부터 확인하세요.',caution:'인허가를 건축허가 하나와 같은 말로 보면 특별법·사업절차를 놓칠 수 있습니다.',related:[['건축허가','건축허가가 뭐야?'],['사용승인','사용승인이 뭐야?'],['사업계획승인','사업계획승인이 뭐야?']]},
{id:'commence',name:'착공신고',kind:'절차 · 공사시작',re:/착공신고/i,summary:'허가·신고된 건축공사를 실제로 시작하기 전에 관련 서류를 갖춰 착공 사실을 신고하는 절차예요.',work:'설계도서, 관계자, 감리, 시공 등 공사 시작에 필요한 조건과 서류를 정리하는 단계와 연결됩니다.',start:'기존 허가·승인 경로와 관할 절차를 먼저 확인하고 필요한 제출자료를 준비하세요.',caution:'프로젝트 종류에 따라 건축법 외 다른 사업절차가 함께 적용될 수 있습니다.',related:[['세움터','세움터가 뭐야?'],['감리','감리가 뭐야?']]},
{id:'useapproval',name:'사용승인',kind:'절차 · 준공',re:/사용승인/i,summary:'건축공사를 마친 뒤 허가·신고 내용과 관련 기준에 맞게 완료되었는지 확인받고 건축물을 사용할 수 있도록 하는 절차예요.',work:'준공도서, 검사·확인, 각 분야 협의자료 등을 정리하고 행정절차를 마무리하는 단계입니다.',start:'원래 프로젝트의 승인 경로가 건축법상 사용승인인지, 다른 법에 따른 사용검사·준공확인인지 먼저 확인하세요.',caution:'공동주택·특별법 사업 등은 “사용승인”이 아닌 다른 완료 절차가 적용될 수 있습니다.',related:[['사용검사','사용검사가 뭐야?'],['세움터','세움터가 뭐야?'],['준공','준공이 뭐야?']]}
];

function normalize(s){return String(s||'').trim().toLowerCase().replace(/[?!.,]/g,'').replace(/\s+/g,' ')}
function isShortExact(q,t){const n=normalize(q);return n===normalize(t.name)||n===normalize(t.name+'가')||n===normalize(t.name+'은')||n===normalize(t.name+'는')}
function findTerm(q){
  const text=String(q||'').trim();if(!text)return null;
  const candidates=TERMS.filter(t=>t.re.test(text));if(!candidates.length)return null;
  const specific=candidates.sort((a,b)=>b.name.length-a.name.length)[0];
  if(CUE.test(text)||isShortExact(text,specific)||text.length<=specific.name.length+5)return specific;
  return null;
}
function linkHtml(links){return (links||[]).map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span>↗</span></a>`).join('')}
function go(q){const input=$('searchInput');if(!input)return;if(typeof showView==='function')showView('search');input.value=q;window.runSearch();}
function render(term){
  const out=$('searchResult');if(!out)return;
  out.innerHTML=`<div class="result-card cc229-term"><div class="cc229-head"><div><small>LV.1 · 실무 용어</small><h3>${esc(term.name)}</h3><span>${esc(term.kind)}</span></div></div>
  <div class="cc229-summary">${esc(term.summary)}</div>
  <div class="cc229-grid"><div><small>실무에서는</small><p>${esc(term.work)}</p></div><div><small>처음이면</small><p>${esc(term.start)}</p></div></div>
  ${(term.links?.length||term.action)?`<div class="cc229-actions">${linkHtml(term.links)}${term.action?`<button type="button" data-cc229-go="${esc(term.action[1])}">${esc(term.action[0])} →</button>`:''}</div>`:''}
  <details class="cc229-more"><summary>조금 더 알아보기</summary><div class="cc229-caution"><b>주의</b><span>${esc(term.caution||'프로젝트 조건에 따라 실제 적용 방식은 달라질 수 있습니다.')}</span></div>${term.related?.length?`<div class="cc229-related"><small>같이 보면 좋은 용어</small>${term.related.map(([label,q])=>`<button type="button" data-cc229-go="${esc(q)}">${esc(label)}</button>`).join('')}</div>`:''}</details></div>`;
  out.querySelectorAll('[data-cc229-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.cc229Go)));
}
function runGlossarySearch(){
  const q=$('searchInput')?.value.trim()||'';
  const term=findTerm(q);
  if(term){render(term);return;}
  if(typeof previousRunSearch==='function')previousRunSearch();
}
function intercept(e){
  const target=e.target;
  if(e.type==='click'&&target.closest('#searchGo')){
    const term=findTerm($('searchInput')?.value||'');if(term){e.preventDefault();e.stopImmediatePropagation();render(term);return;}
  }
  if(e.type==='click'&&target.closest('#homeSearchBtn')){
    const q=$('homeSearch')?.value||'';const term=findTerm(q);if(term){e.preventDefault();e.stopImmediatePropagation();if(typeof showView==='function')showView('search');if($('searchInput'))$('searchInput').value=q;render(term);return;}
  }
  if(e.type==='keydown'&&e.key==='Enter'&&(target.id==='searchInput'||target.id==='homeSearch')){
    const q=target.value||'';const term=findTerm(q);if(term){e.preventDefault();e.stopImmediatePropagation();if(target.id==='homeSearch'&&typeof showView==='function')showView('search');if($('searchInput'))$('searchInput').value=q;render(term);}
  }
}
function installExamples(){
  const box=document.querySelector('#view-search .examples');if(!box||box.querySelector('[data-cc229-example]'))return;
  [['세움터가 뭐야?','세움터가 뭐예요?'],['QGIS가 뭐고 어디서 다운받아?','QGIS가 뭐예요?'],['조달청은 뭐하는 곳이야?','조달청이 뭐예요?']].forEach(([q,label])=>{const b=document.createElement('button');b.type='button';b.dataset.cc229Example='1';b.textContent=label;b.addEventListener('click',()=>{if($('searchInput'))$('searchInput').value=q;const t=findTerm(q);if(t)render(t)});box.appendChild(b)});
  const termCard=[...document.querySelectorAll('.cc-help-card')].find(x=>/용어 찾기/.test(x.textContent));if(termCard)termCard.dataset.example='QGIS가 뭐고 어떤 프로그램이고 어디서 다운받아요?';
}
function installStyle(){
  if(document.getElementById('cc229Style'))return;const s=document.createElement('style');s.id='cc229Style';s.textContent=`.cc229-term{padding:20px}.cc229-head small{font-size:10px;font-weight:950;color:#5069ff;letter-spacing:.08em}.cc229-head h3{margin:5px 0 3px;font-size:25px;line-height:1.2;color:#10264b}.cc229-head span{font-size:11px;font-weight:850;color:#72809a}.cc229-summary{margin-top:14px;padding:15px 16px;border-radius:14px;background:#f2f6ff;font-size:15px;font-weight:900;line-height:1.55;color:#17355d}.cc229-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.cc229-grid>div{padding:13px 14px;border:1px solid #e3e9f5;border-radius:13px;background:#fff}.cc229-grid small,.cc229-related small{display:block;margin-bottom:5px;font-size:9px;font-weight:950;color:#748199;letter-spacing:.04em}.cc229-grid p{margin:0;font-size:12px;line-height:1.62;color:#344a69}.cc229-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}.cc229-actions a,.cc229-actions button,.cc229-related button{border:1px solid #dbe4f3;border-radius:999px;background:#fff;padding:9px 12px;font-size:10px;font-weight:900;color:#31527c;text-decoration:none;cursor:pointer}.cc229-actions a:first-child{background:#edf3ff;border-color:#cad9ff;color:#315ae8}.cc229-more{margin-top:10px;border-top:1px solid #edf0f6;padding-top:9px}.cc229-more summary{cursor:pointer;font-size:10px;font-weight:900;color:#65758d}.cc229-caution{display:grid;grid-template-columns:auto 1fr;gap:7px;margin-top:10px;padding:11px 12px;border-radius:11px;background:#fff8e8;font-size:11px;line-height:1.55;color:#66502a}.cc229-caution b{color:#a26a00}.cc229-related{margin-top:10px}.cc229-related button{margin:0 5px 5px 0;padding:7px 10px}.cc229-term a:focus-visible,.cc229-term button:focus-visible{outline:2px solid #5069ff;outline-offset:2px}@media(max-width:700px){.cc229-term{padding:16px}.cc229-head h3{font-size:22px}.cc229-summary{font-size:14px}.cc229-grid{grid-template-columns:1fr}.cc229-grid p{font-size:12px}.cc229-actions a,.cc229-actions button{width:100%;text-align:center}}`;document.head.appendChild(s);
}
function install(){window.runSearch=runGlossarySearch;document.addEventListener('click',intercept,true);document.addEventListener('keydown',intercept,true);installExamples();installStyle();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

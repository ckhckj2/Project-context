(()=>{
const VERSION="1.4.1";
const MASTER_KEY="나는야 건축 마스터";
const STORAGE_KEY="pc_quiz_engine_v141";
const QUESTION_COUNT=5;
const LEVEL_META={
  1:{name:"신입사원",next:"선임",difficulty:"VERY EASY",regularLive:true,desc:"건축사무소 신입이 바로 맞힐 수 있는 가장 기본적인 분류·용어·앱 사용법만 묻습니다."},
  2:{name:"선임",next:"책임",difficulty:"EASY",regularLive:false,desc:"WHY / WHERE 수준. 현재는 마스터 테스트 모드에서 문제은행만 미리 볼 수 있습니다."},
  3:{name:"책임",next:"수석",difficulty:"MEDIUM",regularLive:false,desc:"HOW 수준. 현재는 마스터 테스트 모드에서 문제은행만 미리 볼 수 있습니다."},
  4:{name:"수석",next:"건축 마스터",difficulty:"HARD",regularLive:false,desc:"JUDGEMENT 수준. 현재는 마스터 테스트 모드에서 문제은행만 미리 볼 수 있습니다."},
  5:{name:"건축 마스터",next:null,difficulty:"MASTER",regularLive:false,desc:"모든 콘텐츠와 테스트 레벨을 확인할 수 있습니다."}
};
const BANKS={"1":[{"domain":"기본","q":"PROJECT CONTEXT의 첫 레벨은?","a":["신입사원","신입","신입 사원","lv1","lv.1"],"ok":"신입사원"},{"domain":"기본","q":"프로젝트의 전체 흐름 속에서 지금 내 위치를 보는 탭은?","a":["프로젝트 맥락","프로젝트맥락","맥락"],"ok":"프로젝트 맥락"},{"domain":"기본","q":"모르는 건축 용어를 찾아보는 탭은?","a":["이 용어는 뭐야","이용어는뭐야","용어","용어 설명"],"ok":"이 용어는 뭐야?"},{"domain":"기본","q":"어떤 사람이나 기관에 물어봐야 할지 찾는 탭은?","a":["누구에게 물어볼까","누구에게물어볼까","문의","물어볼까"],"ok":"누구에게 물어볼까"},{"domain":"기본","q":"현재 설계 단계를 모르면 선택할 수 있는 항목은?","a":["잘 모르겠습니다","잘모르겠습니다","모르겠습니다","잘 모르겠어요","모르겠어요"],"ok":"잘 모르겠습니다"},{"domain":"주거","q":"아파트가 들어가는 가장 기본적인 분류는?","a":["공동주택","공동 주택"],"ok":"공동주택"},{"domain":"주거","q":"여러 세대가 사는 아파트·연립·다세대를 묶어 부르는 말은?","a":["공동주택","공동 주택"],"ok":"공동주택"},{"domain":"주거","q":"학생이나 직원이 공동으로 생활하는 숙소 유형은?","a":["기숙사"],"ok":"기숙사"},{"domain":"주거","q":"업무시설로 분류되는 대표적인 주거유사 시설은?","a":["오피스텔"],"ok":"오피스텔"},{"domain":"주거","q":"일상적으로 '고시원'이라고 부르는 시설을 앱에서는 어떤 이름으로 표시하나요?","a":["다중생활시설","다중 생활 시설","다중생활시설 고시원","고시원"],"ok":"다중생활시설"},{"domain":"일반건축","q":"병원은 어떤 시설 분류에 들어가나요?","a":["의료시설","의료 시설"],"ok":"의료시설"},{"domain":"일반건축","q":"호텔은 어떤 시설 분류에 들어가나요?","a":["숙박시설","숙박 시설"],"ok":"숙박시설"},{"domain":"일반건축","q":"학교나 연구소는 어떤 시설 분류에 들어가나요?","a":["교육연구시설","교육 연구 시설","교육연구 시설"],"ok":"교육연구시설"},{"domain":"일반건축","q":"역사나 여객터미널 같은 시설은 어떤 분류로 볼 수 있나요?","a":["운수시설","운수 시설"],"ok":"운수시설"},{"domain":"일반건축","q":"체육관 같은 시설은 어떤 분류에 들어가나요?","a":["운동시설","운동 시설"],"ok":"운동시설"},{"domain":"산업","q":"반도체 생산라인을 가진 시설을 프로젝트에서 흔히 뭐라고 부르나요?","a":["fab","팹","공장","공장 fab","fab 공장"],"ok":"FAB / 공장"},{"domain":"산업","q":"서버를 대규모로 운영하는 시설은?","a":["데이터센터","데이터 센터"],"ok":"데이터센터"},{"domain":"산업","q":"상품을 보관·출고하는 대형 창고 프로젝트는?","a":["물류센터","물류 센터","창고","창고시설","창고 시설"],"ok":"창고 / 물류센터"},{"domain":"산업","q":"여러 기업의 제조·업무 공간이 모인 산업시설 유형은?","a":["지식산업센터","지식 산업 센터"],"ok":"지식산업센터"},{"domain":"산업","q":"위험물을 저장하거나 취급하는 프로젝트는 앱의 어떤 분류에 있나요?","a":["위험물 특수시설","위험물·특수시설","위험물특수시설","위험물 시설","위험물"],"ok":"위험물·특수시설"},{"domain":"특수","q":"비행기를 보관·정비하는 큰 건물은?","a":["격납고","공항시설","공항 시설","공항시설 격납고","격납고 공항시설"],"ok":"공항시설 / 격납고"},{"domain":"특수","q":"백화점이나 대형 매장은 어떤 시설 분류에 들어가나요?","a":["판매시설","판매 시설"],"ok":"판매시설"},{"domain":"특수","q":"사무실 중심 건물은 어떤 시설 분류에 들어가나요?","a":["업무시설","업무 시설"],"ok":"업무시설"},{"domain":"특수","q":"교회·성당·사찰 같은 시설은?","a":["종교시설","종교 시설"],"ok":"종교시설"},{"domain":"특수","q":"공연장이나 집회장은 어떤 시설 분류에 들어가나요?","a":["문화및집회시설","문화 및 집회시설","문화 및 집회 시설","문화집회시설"],"ok":"문화 및 집회시설"},{"domain":"맥락","q":"두 가지 이상의 용도가 한 건물에 섞이면 앱에서는 어떤 프로젝트로 보나요?","a":["복합시설","복합 시설","복합용도","복합 용도"],"ok":"복합시설"},{"domain":"맥락","q":"대지의 용도지역·지구·구역을 확인하는 대표 서비스는?","a":["토지이음","토지 이음"],"ok":"토지이음"},{"domain":"맥락","q":"건축 인허가 전자민원을 처리할 때 많이 쓰는 시스템은?","a":["세움터","세움 터"],"ok":"세움터"},{"domain":"맥락","q":"건축공사를 시작하기 전에 하는 대표 신고는?","a":["착공신고","착공 신고"],"ok":"착공신고"},{"domain":"맥락","q":"건축공사가 끝난 뒤 건축물을 사용하기 전에 받는 대표 절차는?","a":["사용승인","사용 승인","건축물 사용승인","건축물사용승인"],"ok":"사용승인"}],"2":[{"domain":"기본","q":"법령 원문을 공식적으로 확인하는 대표 사이트는?","a":["국가법령정보센터","국가 법령 정보 센터","법제처 국가법령정보센터","법령정보센터"],"ok":"국가법령정보센터"},{"domain":"기본","q":"용도지역·지구·구역 등 토지이용규제를 먼저 확인하는 대표 서비스는?","a":["토지이음","토지 이음"],"ok":"토지이음"},{"domain":"기본","q":"건축허가·신고 등 전자 인허가 업무에 쓰는 대표 시스템은?","a":["세움터","세움 터"],"ok":"세움터"},{"domain":"기본","q":"계획설계 다음에 이어지는 대표 설계 단계는?","a":["중간설계","중간 설계"],"ok":"중간설계"},{"domain":"기본","q":"중간설계 다음에 이어지는 대표 설계 단계는?","a":["실시설계","실시 설계"],"ok":"실시설계"},{"domain":"주거","q":"주택법상 사업계획승인을 받아 진행한 주택사업이 끝난 뒤 받는 대표 절차는?","a":["사용검사","사용 검사"],"ok":"사용검사"},{"domain":"주거","q":"주택건설사업의 계획을 승인받는 절차를 보통 뭐라고 부르나요?","a":["사업계획승인","사업계획 승인","사업승인","사업 승인"],"ok":"사업계획승인"},{"domain":"주거","q":"오피스텔은 건축법상 어떤 큰 용도로 분류되나요?","a":["업무시설","업무 시설"],"ok":"업무시설"},{"domain":"주거","q":"기숙사는 건축법상 어떤 큰 용도 계열에 들어가나요?","a":["공동주택","공동 주택"],"ok":"공동주택"},{"domain":"주거","q":"재개발·재건축처럼 일반 신축과 다른 사업방식을 묶어 부르는 말은?","a":["정비사업","정비 사업"],"ok":"정비사업"},{"domain":"일반건축","q":"일반적인 건축허가 경로에서 공사를 시작하기 전에 하는 신고는?","a":["착공신고","착공 신고"],"ok":"착공신고"},{"domain":"일반건축","q":"일반 건축허가 경로에서 공사 완료 후 대표적으로 받는 절차는?","a":["사용승인","사용 승인"],"ok":"사용승인"},{"domain":"일반건축","q":"판매시설에서 초기 계획부터 특히 중요하게 보는 차량 관련 계획은?","a":["주차","주차계획","주차 계획"],"ok":"주차"},{"domain":"일반건축","q":"의료시설 계획에서 건축 외에 반드시 함께 봐야 하는 핵심은 의료 무엇인가요?","a":["운영","의료운영","운영계획","운영 계획"],"ok":"의료 운영"},{"domain":"일반건축","q":"운수시설에서 건축설계와 함께 중요한 외부 협의 대상은?","a":["관계기관","관계 기관","교통 관계기관","관할기관","관할 기관"],"ok":"관계기관"},{"domain":"산업","q":"FAB 계획에서 생산공정과 함께 건축에 큰 영향을 주는 설비 체계를 흔히 뭐라고 하나요?","a":["유틸리티","utility","utilities"],"ok":"유틸리티"},{"domain":"산업","q":"데이터센터 초기 계획에서 서버 배치와 함께 핵심이 되는 두 요소 중 하나는?","a":["전력","냉각","전력계획","냉각계획","전력 계획","냉각 계획"],"ok":"전력 / 냉각"},{"domain":"산업","q":"일반 창고인지 물류터미널인지 먼저 구분할 때 가장 먼저 확인할 것은?","a":["사업성격","사업 성격","사업방식","사업 방식"],"ok":"사업성격"},{"domain":"산업","q":"지식산업센터는 일반 업무시설처럼 건축허가만 보면 놓칠 수 있는 어떤 절차가 있나요?","a":["설립승인","설립 승인","지식산업센터 설립승인"],"ok":"설립승인"},{"domain":"산업","q":"위험물·특수시설에서 이름보다 먼저 확인해야 하는 실제 조건은?","a":["취급물질","취급 물질","저장물질","저장 물질","물질","취급물질과수량","물질과수량"],"ok":"취급 물질"},{"domain":"특수","q":"공항 안의 건물이라고 모두 같은 절차라고 단정하면 될까요?","a":["아니오","아니요","아니다","안된다","안 돼","no"],"ok":"아니오"},{"domain":"특수","q":"물류터미널 프로젝트는 일반 창고와 달리 어떤 법 체계를 추가로 확인해야 하나요?","a":["물류시설법","물류 시설법","물류시설의 개발 및 운영에 관한 법률"],"ok":"물류시설법"},{"domain":"특수","q":"복합시설에서 가장 먼저 따로 나눠서 봐야 하는 것은 각각의 무엇인가요?","a":["용도","각 용도","구성용도","구성 용도"],"ok":"각 용도"},{"domain":"특수","q":"FAB나 데이터센터처럼 프로젝트 명칭과 법적 용도가 다를 수 있을 때 확인해야 하는 것은?","a":["법적용도","법적 용도","건축법상용도","건축법상 용도"],"ok":"법적 용도"},{"domain":"특수","q":"공항개발사업에 해당하는지 판단하려면 시설 이름 외에 무엇을 확인해야 하나요?","a":["사업방식","사업 방식","사업시행방식","시행방식","사업성격"],"ok":"사업방식"},{"domain":"협업","q":"소방 설계의 기술적인 내용을 먼저 물어볼 곳은?","a":["소방협력업체","소방 협력업체","소방업체","소방 업체","소방설계업체"],"ok":"소방 협력업체"},{"domain":"협업","q":"소방 인허가 적용 여부나 행정 절차를 공식적으로 확인할 곳은?","a":["관할소방서","관할 소방서","소방서","관할기관"],"ok":"관할 소방서"},{"domain":"협업","q":"구조 계산이나 구조 시스템의 기술적인 내용을 먼저 물어볼 곳은?","a":["구조협력업체","구조 협력업체","구조업체","구조 업체","구조설계업체"],"ok":"구조 협력업체"},{"domain":"협업","q":"발주처와의 설계 방향 결정은 기술 협력업체보다 누가 먼저 정리해야 하나요?","a":["pm","피엠","프로젝트매니저","프로젝트 매니저","사내pm","사내 pm"],"ok":"PM"},{"domain":"협업","q":"법 적용 여부가 애매할 때 최종 확인을 위해 문의해야 하는 쪽은?","a":["관할기관","관할 기관","관계기관","관계 기관","행정기관"],"ok":"관할기관"}],"3":[{"domain":"기본","q":"변경업무를 받았을 때 가장 먼저 확인해야 하는 것은 기존의 무엇인가요?","a":["원인허가경로","원 인허가 경로","기존인허가경로","기존 인허가 경로","원허가경로","기존 허가 경로"],"ok":"기존 인허가 경로"},{"domain":"기본","q":"지구단위계획이 적용되는 대지라면 최신 결정도서를 확인할 최종 주체는?","a":["관할지자체","관할 지자체","지자체","시청","구청","관할기관"],"ok":"관할 지자체"},{"domain":"기본","q":"법령과 지자체 기준이 충돌해 보일 때 임의 해석보다 우선할 행동은?","a":["관할기관질의","관할 기관 질의","공식질의","공식 질의","기관질의"],"ok":"관할기관 질의"},{"domain":"기본","q":"기존 프로젝트의 승인조건을 확인할 때 가장 직접적인 자료는?","a":["승인도서","승인 도서","허가도서","허가 도서","인허가도서"],"ok":"승인·허가 도서"},{"domain":"기본","q":"프로젝트 절차를 단정하기 전에 용도와 함께 반드시 확인할 사업 관련 정보는?","a":["사업방식","사업 방식","사업유형","사업 유형"],"ok":"사업방식"},{"domain":"주거","q":"공동주택이라고 모두 주택법 사업계획승인이라고 단정하면 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"주거","q":"오피스텔을 주거용으로 계획하더라도 건축법상 기본 용도는?","a":["업무시설","업무 시설"],"ok":"업무시설"},{"domain":"주거","q":"기숙사를 일반 아파트와 동일 절차로 보기 전에 확인해야 하는 것은?","a":["사업방식","사업 방식","운영조건","운영 조건","사업조건"],"ok":"사업방식 / 운영조건"},{"domain":"주거","q":"재개발·재건축 프로젝트에서 일반 건축허가보다 먼저 확인할 핵심 인허가 계획은?","a":["사업시행계획인가","사업 시행 계획 인가","사업시행인가","사업 시행 인가"],"ok":"사업시행계획인가"},{"domain":"주거","q":"주택법상 사업계획승인 경로와 일반 건축법 경로를 준공 때 구분하는 대표 용어는?","a":["사용검사와사용승인","사용검사 사용승인","사용검사/사용승인","사용검사와 사용승인"],"ok":"사용검사 / 사용승인"},{"domain":"일반건축","q":"대형 업무시설에서 건축허가 외 추가 심의가 붙는지 확인하려면 무엇을 봐야 하나요?","a":["규모와지역","규모 지역","규모·지역","프로젝트규모와지역","규모와 입지"],"ok":"규모와 지역"},{"domain":"일반건축","q":"판매시설에서 평면 계획 초기부터 소방과 함께 검토해야 할 핵심 동선은?","a":["피난동선","피난 동선","피난","대피동선"],"ok":"피난 동선"},{"domain":"일반건축","q":"의료시설에서 환자·의료진·물류가 섞이지 않도록 먼저 검토하는 것은?","a":["동선","동선계획","동선 계획","운영동선"],"ok":"동선 계획"},{"domain":"일반건축","q":"운수시설에서 승객과 차량의 충돌을 줄이기 위해 핵심적으로 조정하는 것은?","a":["승객차량동선","승객·차량동선","승객 차량 동선","동선계획"],"ok":"승객·차량 동선"},{"domain":"일반건축","q":"문화 및 집회시설에서 수용인원이 커질수록 특히 중요해지는 계획은?","a":["피난","피난계획","피난 계획"],"ok":"피난 계획"},{"domain":"산업","q":"FAB에서 건축 배치를 확정하기 전에 공정팀과 먼저 맞춰야 할 대표 항목은?","a":["공정과유틸리티","공정 유틸리티","공정·유틸리티","유틸리티","공정"],"ok":"공정·유틸리티"},{"domain":"산업","q":"데이터센터 부지검토에서 건축면적보다 먼저 사업성에 영향을 줄 수 있는 인프라는?","a":["전력","전력공급","전력 공급"],"ok":"전력"},{"domain":"산업","q":"일반 창고와 물류터미널의 인허가 경로를 가르는 첫 질문은?","a":["사업성격","사업 성격","물류사업여부","사업방식"],"ok":"사업성격"},{"domain":"산업","q":"지식산업센터 사용승인 뒤 이어질 수 있는 산업집적법상 절차는?","a":["설립완료신고","설립 완료 신고","완료신고"],"ok":"설립완료신고"},{"domain":"산업","q":"위험물 시설에서 소방 협의 전에 반드시 정리해야 할 자료는?","a":["물질과수량","물질 수량","취급물질과수량","저장물질과수량"],"ok":"물질과 수량"},{"domain":"특수","q":"공항 격납고가 공항시설법상 개발사업인지 판단할 때 핵심으로 볼 것은?","a":["사업시행방식","사업 시행 방식","사업방식","사업시행자","시행자"],"ok":"사업시행 방식 / 시행자"},{"domain":"특수","q":"국토부 외 사업시행자가 공항개발사업을 시행할 때 먼저 검토할 절차는?","a":["시행허가","시행 허가","개발사업시행허가","개발사업 시행허가"],"ok":"개발사업 시행허가"},{"domain":"특수","q":"물류터미널의 구조·설비 공사계획과 연결되는 물류시설법상 대표 절차는?","a":["공사시행인가","공사 시행 인가"],"ok":"공사시행인가"},{"domain":"특수","q":"물류단지 개발에서 시행자가 수립해 승인받는 계획은?","a":["물류단지개발실시계획","물류단지 개발 실시계획","개발실시계획","실시계획"],"ok":"물류단지개발실시계획"},{"domain":"특수","q":"복합시설에서 한 용도의 기준만으로 전체를 판단하지 않기 위해 먼저 만드는 것은?","a":["용도구성","용도 구성","용도조합","용도 조합","용도목록"],"ok":"용도 구성"},{"domain":"협업","q":"소방 성능설계의 기술적 적정성 검토는 우선 누구와 조정하나요?","a":["소방협력업체","소방 협력업체","소방설계업체","소방 업체"],"ok":"소방 협력업체"},{"domain":"협업","q":"관할 소방서에 질의한 중요한 해석은 구두 답변만 믿기보다 어떻게 남기는 게 좋나요?","a":["서면확인","서면 확인","문서화","문서 확인","공문"],"ok":"서면 확인"},{"domain":"협업","q":"구조·기계·전기 간 간섭이 반복될 때 건축 담당자가 해야 할 핵심 역할은?","a":["조정","협의조정","협력업체조정","코디네이션","coordination"],"ok":"협력업체 조정"},{"domain":"협업","q":"발주처 요구가 법규나 기술조건과 충돌할 때 먼저 해야 할 것은?","a":["조건정리","조건 정리","충돌조건정리","쟁점정리","이슈정리"],"ok":"쟁점 정리"},{"domain":"협업","q":"관계기관 문의 전에 내부에서 먼저 준비하면 좋은 것은 질문과 무엇인가요?","a":["근거자료","근거 자료","관련자료","검토자료"],"ok":"근거자료"}],"4":[{"domain":"판단","q":"프로젝트 명칭이 '데이터센터'라고 해서 그것만으로 건축법상 용도를 확정할 수 있나요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"판단","q":"프로젝트 명칭이 'FAB'라고 해서 그것만으로 건축법상 용도를 확정할 수 있나요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"판단","q":"복합시설을 하나의 독립된 건축법상 용도라고 보면 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"판단","q":"변경허가·변경신고 판단 전에 가장 먼저 특정해야 하는 것은?","a":["원인허가경로","원 인허가 경로","기존인허가경로","기존 인허가 경로"],"ok":"원 인허가 경로"},{"domain":"판단","q":"특별법 프로젝트의 변경업무를 건축법 변경절차만으로 판단해도 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"주거","q":"오피스텔은 건축법상 업무시설이면서 주택법상 어떤 범주로 다뤄질 수 있나요?","a":["준주택","준 주택"],"ok":"준주택"},{"domain":"주거","q":"기숙사는 주택법상 어떤 범주로 다뤄질 수 있나요?","a":["준주택","준 주택"],"ok":"준주택"},{"domain":"주거","q":"주택법상 사업계획승인을 받은 주택사업의 완료 절차는?","a":["사용검사","사용 검사"],"ok":"사용검사"},{"domain":"주거","q":"재개발·재건축에서 시행 단계의 핵심 인가를 뭐라고 하나요?","a":["사업시행계획인가","사업 시행 계획 인가","사업시행인가"],"ok":"사업시행계획인가"},{"domain":"주거","q":"정비사업 공사가 완료된 뒤 정비법상 대표 완료 인가는?","a":["준공인가","준공 인가"],"ok":"준공인가"},{"domain":"일반건축","q":"건축허가를 받은 건축물의 공사를 시작하려 할 때 하는 신고는?","a":["착공신고","착공 신고"],"ok":"착공신고"},{"domain":"일반건축","q":"건축허가 경로에서 공사를 완료한 뒤 건축물을 사용하기 위해 받는 것은?","a":["사용승인","사용 승인"],"ok":"사용승인"},{"domain":"일반건축","q":"심의가 모든 일반 건축물에 무조건 적용된다고 단정해도 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"일반건축","q":"지구단위계획 적용 여부와 세부 내용은 최종적으로 최신 무엇을 확인해야 하나요?","a":["결정도서","결정 도서","지구단위계획결정도서","최신결정도서"],"ok":"최신 결정도서"},{"domain":"일반건축","q":"법령상 기준과 지구단위계획 기준을 함께 검토할 때 더 구체적인 해당 대지 기준을 놓치지 않기 위해 확인할 것은?","a":["지구단위계획","지구 단위 계획","지구단위 계획"],"ok":"지구단위계획"},{"domain":"산업","q":"지식산업센터는 사용승인 후 어떤 신고가 이어지나요?","a":["설립완료신고","설립 완료 신고","완료신고"],"ok":"설립완료신고"},{"domain":"산업","q":"일반 공장 프로젝트에서 공장설립 절차가 적용되는지 판단하려면 어떤 법 체계를 확인하나요?","a":["산업집적법","산업 집적법","산업집적활성화 및 공장설립에 관한 법률"],"ok":"산업집적법"},{"domain":"산업","q":"데이터센터 설계에서 전력 인입 가능성을 확인하지 않고 건축배치부터 확정하는 게 적절할까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"산업","q":"FAB에서 공정·유틸리티 조건을 후반에만 확인해도 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"산업","q":"위험물 시설의 적용 법령을 시설 이름만으로 판단하기보다 확인해야 하는 핵심 두 가지는?","a":["물질과수량","물질 수량","취급물질과수량","저장물질과수량"],"ok":"물질과 수량"},{"domain":"특수","q":"국토교통부장관 외의 자가 공항개발사업을 시행하려면 원칙적으로 무엇을 받아야 하나요?","a":["허가","시행허가","개발사업시행허가","개발사업 시행허가"],"ok":"개발사업 시행허가"},{"domain":"특수","q":"공항개발사업 시행자는 개발사업 시작 전에 무엇을 수립해야 하나요?","a":["실시계획","실시 계획","공항개발사업실시계획"],"ok":"실시계획"},{"domain":"특수","q":"국토교통부장관 외 사업시행자가 공항개발사업 실시계획을 수립하면 누구의 승인을 받아야 하나요?","a":["국토교통부장관","국토부장관","국토부 장관","국토교통부 장관"],"ok":"국토교통부장관"},{"domain":"특수","q":"복합물류터미널의 공사계획에 대해 받는 대표 인가는?","a":["공사시행인가","공사 시행 인가"],"ok":"공사시행인가"},{"domain":"특수","q":"물류단지 개발시행자가 수립해 물류단지지정권자의 승인을 받는 것은?","a":["물류단지개발실시계획","물류단지 개발 실시계획","개발실시계획","실시계획"],"ok":"물류단지개발실시계획"},{"domain":"협업","q":"행정기관의 구두 답변이 프로젝트 핵심 판단 근거라면 이후 분쟁 방지를 위해 무엇을 확보하는 게 좋은가요?","a":["서면확인","서면 확인","문서","공문","문서화"],"ok":"서면 확인"},{"domain":"협업","q":"특별법 적용 여부가 애매한데 협력업체 의견만으로 최종 확정해도 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"협업","q":"복합시설의 인허가 검토에서 주용도만 보고 부속·추가 용도를 무시해도 될까요?","a":["아니오","아니요","아니다","안된다","no"],"ok":"아니오"},{"domain":"협업","q":"발주처 요구가 법적 기준과 충돌하면 설계자가 먼저 해야 할 것은 요구 수용보다 무엇인가요?","a":["법규검토","법규 검토","기준확인","법적기준확인","쟁점정리"],"ok":"법규 검토"},{"domain":"협업","q":"협력업체 답변과 관할기관 해석이 다를 때 최종 행정 적용을 확인할 곳은?","a":["관할기관","관할 기관","행정기관","허가권자"],"ok":"관할기관"}]};

function norm(v){
  return String(v||"").trim().toLowerCase()
    .replace(/[·ㆍ,./()[\]{}"'`~!@#$%^&*_=+?:;-]/g,"")
    .replace(/\s+/g,"")
    .replace(/^(정답은|답은|정답|답)/,"")
    .replace(/(입니다|이에요|예요|이요|라고생각합니다|라고생각해요|같습니다|같아요|라고봅니다|라고봐요|입니다만|요)$/,"");
}
function lev(a,b){
  const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)dp[i][0]=i;
  for(let j=0;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(
    dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1)
  );
  return dp[m][n];
}
function accepted(raw,arr){
  const n=norm(raw); if(!n)return false;
  const variants=(arr||[]).map(norm).filter(Boolean);
  if(variants.includes(n))return true;
  return variants.some(v=>v.length>=5 && Math.abs(v.length-n.length)<=1 && lev(v,n)<=1);
}
function readAll(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}catch(e){return {}}
}
function saveAll(v){localStorage.setItem(STORAGE_KEY,JSON.stringify(v))}
function getSession(level){
  const all=readAll();
  return all[level]||{selected:[],index:0,correct:0,active:false,passed:false,attempt:0};
}
function setSession(level,sess){
  const all=readAll(); all[level]=sess; saveAll(all);
}
function certified(){return localStorage.getItem("pc_master_certified")==="1" || localStorage.getItem("pc_master_unlocked")==="1" || Number(localStorage.getItem("pc_level")||1)===5}
function level(){return Math.max(1,Math.min(5,Number(localStorage.getItem("pc_level")||1)))}
function genuineLevel(){
  let g=Number(localStorage.getItem("pc_progress_level")||0);
  if(g>=1&&g<=5)return g;
  g=certified()?1:level(); localStorage.setItem("pc_progress_level",String(g)); return g;
}
function setGenuineLevel(v){
  localStorage.setItem("pc_progress_level",String(v));
  if(!certified()){
    localStorage.setItem("pc_level",String(v));
    localStorage.setItem("pc_master_unlocked",v===5?"1":"0");
  }
}
function shuffle(a){
  const x=[...a];
  for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}
  return x;
}
function selectFive(level){
  const bank=BANKS[level]||[];
  const groups={};
  bank.forEach((q,i)=>(groups[q.domain]||(groups[q.domain]=[])).push(i));
  const domains=shuffle(Object.keys(groups));
  const chosen=[];
  domains.slice(0,QUESTION_COUNT).forEach(d=>chosen.push(shuffle(groups[d])[0]));
  if(chosen.length<QUESTION_COUNT){
    const rest=shuffle(bank.map((_,i)=>i).filter(i=>!chosen.includes(i)));
    chosen.push(...rest.slice(0,QUESTION_COUNT-chosen.length));
  }
  return shuffle(chosen);
}
function freshSession(lv){
  const old=getSession(lv);
  return {selected:selectFive(lv),index:0,correct:0,active:true,passed:false,attempt:(old.attempt||0)+1};
}
function currentQuestion(lv,sess){
  const idx=sess.selected[sess.index];
  return Number.isInteger(idx)?BANKS[lv][idx]:null;
}

function style(d){
  if(d.getElementById("pc141style"))return;
  const st=d.createElement("style");st.id="pc141style";st.textContent=`
  .bank-info{margin-top:10px;padding:11px 12px;border:1px solid #DFE5F2;border-radius:13px;background:#F9FBFF;color:#68758E;font-size:10.5px;line-height:1.55}
  .bank-info b{color:#40506B}.bank-pill{display:inline-flex;margin-left:5px;padding:3px 7px;border-radius:999px;background:#EEF2FF;color:#4C64C9;font-size:8.5px;font-weight:950}
  .bank-domains{margin-top:7px;display:flex;gap:5px;flex-wrap:wrap}.bank-domain{padding:4px 7px;border:1px solid #E5E9F2;border-radius:999px;background:#fff;color:#7A8499;font-size:8.5px;font-weight:850}
  .pending-bank{background:#FFF9F0;border-color:#F0DFBE;color:#896522}
  .quiz-source{margin-top:8px;font-size:9px;color:#98A0B0}
  .random-tag{display:inline-flex;padding:3px 7px;border-radius:999px;background:#EAF8F3;color:#167A5A;font-size:8px;font-weight:950;letter-spacing:.04em}
  `;d.head.appendChild(st);
}

function clone(d,id){
  const old=d.getElementById(id);if(!old)return null;
  const neo=old.cloneNode(true);old.replaceWith(neo);return neo;
}
function syncOverview(d,lv){
  const m=LEVEL_META[lv];
  const rank=d.getElementById("quizRank"),desc=d.getElementById("quizDesc"),start=d.getElementById("startQuizBtn");
  if(rank)rank.textContent=m.name;
  if(desc)desc.textContent=m.desc;
  const diff=[...d.querySelectorAll(".qmeta span")].find(x=>x.textContent.includes("난이도"));
  if(diff)diff.textContent="난이도 · "+m.difficulty;
  const prog=d.getElementById("quizProgress"),sess=getSession(lv);
  if(prog)prog.style.width=(sess.active?Math.round(Math.min(sess.index,QUESTION_COUNT)/QUESTION_COUNT*100):0)+"%";
  const master=certified();
  if(start){
    const can=m.regularLive||master;
    start.disabled=!can; start.style.opacity=can?"":".55";
    if(lv===5)start.textContent="건축 마스터 · 전체 콘텐츠 확인";
    else if(!can)start.textContent="콘텐츠 업데이트 후 오픈";
    else if(sess.active&&sess.index<QUESTION_COUNT)start.textContent="이어서 풀기 →";
    else start.textContent="랜덤 5문제 시작 →";
  }
  const card=d.querySelector(".rank-card");
  if(card){
    card.querySelector(".bank-info")?.remove();
    const box=d.createElement("div");
    box.className="bank-info"+((!m.regularLive&&lv<5&&!master)?" pending-bank":"");
    if(lv===5){
      box.innerHTML="<b>ARCHITECTURE MASTER</b><span class='bank-pill'>ALL CLEAR</span><br>상단 MASTER TEST MODE에서 각 레벨 문제은행을 테스트할 수 있습니다.";
    }else{
      const domains=[...new Set((BANKS[lv]||[]).map(q=>q.domain))];
      box.innerHTML=`<b>문제은행 30문항</b><span class="bank-pill">RANDOM 5</span><br>매 시험마다 30문항 중 5문항을 새로 뽑습니다. 한 분야에 몰리지 않도록 서로 다른 분야를 우선 섞습니다.${(!m.regularLive&&!master)?"<br>정식 콘텐츠 오픈 전이라 일반 사용자는 아직 응시할 수 없습니다.":""}<div class="bank-domains">${domains.map(x=>`<span class="bank-domain">${x}</span>`).join("")}</div>`;
    }
    card.appendChild(box);
  }
}

function promotion(d,w,lv){
  const area=d.getElementById("quizArea");if(!area)return;
  const m=LEVEL_META[lv];
  area.classList.add("show");
  const isMaster=certified();
  area.innerHTML=`<div class="qbox promotion-box"><div class="promote-kicker">${isMaster?"MASTER TEST COMPLETE":"PROMOTION COMPLETE"}</div><div class="promote-title">${isMaster?m.name+" 문제은행 테스트 완료":m.next+" 승급"}</div><div class="promote-desc">30문항 문제은행에서 랜덤으로 나온 5문항을 모두 맞혔습니다.${isMaster?" 마스터 테스트 모드이므로 실제 승급 기록은 변경하지 않습니다.":" 다음 레벨이 열렸습니다."}</div><button class="btn primary full" id="continue141" style="margin-top:16px">계속하기 →</button></div>`;
  d.getElementById("continue141")?.addEventListener("click",()=>{
    if(!isMaster && lv<5){
      setGenuineLevel(lv+1);
      localStorage.setItem("pc_level",String(lv+1));
    }
    w.location.reload();
  });
}

function complete(d,w,lv){
  const sess=getSession(lv);sess.active=false;sess.passed=true;sess.correct=QUESTION_COUNT;sess.index=QUESTION_COUNT;setSession(lv,sess);
  if(!certified() && lv<5)setGenuineLevel(Math.max(genuineLevel(),lv+1));
  promotion(d,w,lv);
}

function renderQuestion(d,w,lv){
  const sess=getSession(lv),q=currentQuestion(lv,sess);
  if(!q || sess.index>=QUESTION_COUNT){complete(d,w,lv);return}
  const count=d.getElementById("qCount"),score=d.getElementById("qScore"),text=d.getElementById("qText"),input=d.getElementById("qInput"),fb=d.getElementById("qFeedback"),prog=d.getElementById("quizProgress");
  if(count)count.textContent=`QUESTION ${String(sess.index+1).padStart(2,"0")} / 05`;
  if(score)score.textContent=`${sess.correct} CORRECT`;
  if(text)text.textContent=q.q;
  if(input){input.value="";input.placeholder=lv===1?"한두 단어로 편하게 입력":"단답형으로 입력";setTimeout(()=>input.focus(),30)}
  if(fb){fb.className="feedback";fb.textContent=""}
  if(prog)prog.style.width=Math.round(sess.index/QUESTION_COUNT*100)+"%";
  const qbox=d.querySelector("#quizArea .qbox");
  if(qbox){
    qbox.querySelector(".quiz-source")?.remove();
    const n=d.createElement("div");n.className="quiz-source";
    n.innerHTML=`<span class="random-tag">RANDOM BANK</span> · ${q.domain} 분야 · 30문항 중 이번 세트에 선택됨`;
    qbox.appendChild(n);
  }
}

function activate(d,w,lv,forceNew=false){
  if(lv>=5)return;
  const meta=LEVEL_META[lv];
  if(!meta.regularLive&&!certified())return;
  let sess=getSession(lv);
  if(forceNew || !sess.active || sess.passed || !Array.isArray(sess.selected) || sess.selected.length!==QUESTION_COUNT) sess=freshSession(lv);
  else sess.active=true;
  setSession(lv,sess);
  d.getElementById("quizArea")?.classList.add("show");
  renderQuestion(d,w,lv);
}

function grade(d,w,lv){
  let sess=getSession(lv);const q=currentQuestion(lv,sess);if(!q)return;
  const input=d.getElementById("qInput"),fb=d.getElementById("qFeedback");const raw=input?.value||"";
  if(norm(raw)===norm(MASTER_KEY)){
    localStorage.setItem("pc_master_certified","1");localStorage.setItem("pc_master_unlocked","1");localStorage.setItem("pc_level","5");
    parent.location.reload();return;
  }
  if(accepted(raw,q.a)){
    sess.correct++;sess.index++;setSession(lv,sess);
    if(fb){fb.className="feedback show ok";fb.innerHTML=`정답 · <b>${q.ok}</b>`}
    setTimeout(()=>{if(sess.index>=QUESTION_COUNT)complete(d,w,lv);else renderQuestion(d,w,lv)},420);
  }else{
    if(fb){
      fb.className="feedback show no";
      fb.textContent=lv===1
        ?"신입 문제는 아주 기본적인 단어만 묻습니다. 화면에서 본 분류명이나 용어를 그대로 입력해보세요. 띄어쓰기·통상 표현은 유연하게 인정합니다."
        :"표현 차이는 유연하게 인정하지만 서로 다른 개념은 같은 정답으로 처리하지 않습니다. 관련 콘텐츠의 핵심 용어를 다시 떠올려보세요.";
    }
  }
}

function install(){
  const frame=document.getElementById("app"),d=frame?.contentDocument,w=frame?.contentWindow;if(!d||!w)return;
  style(d);
  const chip=[...d.querySelectorAll(".topchip")].find(x=>/^v1\./.test(x.textContent.trim()));
  if(chip)chip.textContent="v1.4.1 · 4A-a";
  const lv=level();
  syncOverview(d,lv);
  const start=clone(d,"startQuizBtn"),submit=clone(d,"qSubmit"),input=clone(d,"qInput");
  if(start)start.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();activate(d,w,lv,false)},true);
  if(submit)submit.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();grade(d,w,lv)},true);
  if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();grade(d,w,lv)}},true);
  const sess=getSession(lv);
  if(lv<5 && sess.active && sess.index<QUESTION_COUNT && (LEVEL_META[lv].regularLive||certified())){
    d.getElementById("quizArea")?.classList.add("show");renderQuestion(d,w,lv);
  }
}

const frame=document.getElementById("app");
if(frame){
  frame.addEventListener("load",()=>setTimeout(install,220));
  if(frame.contentDocument?.readyState==="complete")setTimeout(install,220);
}
})();
# WeFin 프론트엔드 API 연결 현황

> 디자인 개편 시 API 연결 누락 방지를 위한 문서
> 작성일: 2026-04-20

---

## 1. 인증 (auth-dialog)

| 엔드포인트                          | 메서드 | 훅                             | 사용 화면                       |
| ----------------------------------- | ------ | ------------------------------ | ------------------------------- |
| `/auth/login`                       | POST   | `useLoginMutation`             | 로그인 모달 (auth-dialog.tsx)   |
| `/auth/signup`                      | POST   | `useSignupMutation`            | 회원가입 모달 (auth-dialog.tsx) |
| `/auth/email-verifications`         | POST   | `useEmailVerificationMutation` | 회원가입 이메일 인증            |
| `/auth/email-verifications/confirm` | POST   | `useEmailVerificationMutation` | 이메일 인증 코드 확인           |
| `/auth/refresh`                     | POST   | (base-api 자동)                | 401 시 자동 토큰 갱신           |

**UI 위치:** 헤더 로그인 버튼 → AuthDialog 모달

---

## 2. 계좌 & 자산 (account)

| 엔드포인트               | 메서드 | 훅                           | 사용 화면                       |
| ------------------------ | ------ | ---------------------------- | ------------------------------- |
| `/account`               | GET    | `useAccountQuery`            | 계좌 페이지 상단 잔고/수익 표시 |
| `/account/buying-power`  | GET    | `useBuyingPowerQuery(price)` | 주문폼 최대 매수 가능 수량      |
| `/account/asset-history` | GET    | `useAssetHistoryQuery`       | 계좌 > 자산 탭 차트             |

**UI 위치:** `/account` 페이지 (account-page.tsx → asset-tab.tsx)

---

## 3. 포트폴리오 (portfolio)

| 엔드포인트   | 메서드 | 훅                  | 사용 화면                                            |
| ------------ | ------ | ------------------- | ---------------------------------------------------- |
| `/portfolio` | GET    | `usePortfolioQuery` | 보유종목 패널 (종목명, 수량, 평단가, 현재가, 수익률) |

**UI 위치:**

- 실투 사이드바 보유종목 (holdings-panel.tsx)
- 계좌 페이지 자산 탭

---

## 4. 주문 (order)

### 조회

| 엔드포인트       | 메서드 | 훅                      | 사용 화면                     |
| ---------------- | ------ | ----------------------- | ----------------------------- |
| `/order/pending` | GET    | `usePendingOrdersQuery` | 미체결 주문 목록              |
| `/order/today`   | GET    | `useTodayOrdersQuery`   | 오늘 주문 내역                |
| `/order/history` | GET    | `useOrderHistoryQuery`  | 주문 이력 (커서 페이지네이션) |

### 주문 실행

| 엔드포인트          | 메서드 | 훅                       | 사용 화면   |
| ------------------- | ------ | ------------------------ | ----------- |
| `/order/buy`        | POST   | `useBuyMutation`         | 시장가 매수 |
| `/order/sell`       | POST   | `useSellMutation`        | 시장가 매도 |
| `/order/limit/buy`  | POST   | `useLimitBuyMutation`    | 지정가 매수 |
| `/order/limit/sell` | POST   | `useLimitSellMutation`   | 지정가 매도 |
| `/order/{orderNo}`  | PUT    | `useModifyOrderMutation` | 주문 정정   |
| `/order/{orderNo}`  | DELETE | `useCancelOrderMutation` | 주문 취소   |

**UI 위치:** 종목 상세 > 주문폼 (order-form.tsx), 계좌 > 주문내역 탭 (order-history-tab.tsx)
**Side Effects:** 주문 후 orders, trades, portfolio, account, ranking, quests 캐시 무효화

---

## 5. 체결 이력 (trade)

| 엔드포인트       | 메서드 | 훅                     | 사용 화면                     |
| ---------------- | ------ | ---------------------- | ----------------------------- |
| `/trade/history` | GET    | `useTradeHistoryQuery` | 체결 내역 (커서 페이지네이션) |

**UI 위치:** 계좌 > 체결내역 탭 (trade-history-tab.tsx)

---

## 6. 종목 검색 (stock-search)

| 엔드포인트       | 메서드 | 훅                    | 사용 화면      |
| ---------------- | ------ | --------------------- | -------------- |
| `/stocks/search` | GET    | `useStockSearchQuery` | 종목 검색 모달 |

**UI 위치:** 헤더 검색 아이콘 → StockSearchModal (stock-search-modal.tsx)

---

## 7. 종목 랭킹 (stock-ranking)

| 엔드포인트        | 메서드 | 훅                                 | 사용 화면                      |
| ----------------- | ------ | ---------------------------------- | ------------------------------ |
| `/stocks/ranking` | GET    | `useStockRankingQuery(tab, limit)` | 거래량/거래대금/상승/하락 랭킹 |

**UI 위치:** 종목 페이지 (stocks-page.tsx → stock-ranking-table.tsx)
**탭:** VOLUME, AMOUNT, RISING, FALLING

---

## 8. 종목 상세 (stock-detail)

### REST API

| 엔드포인트                      | 메서드 | 훅                         | staleTime | 사용 화면                 |
| ------------------------------- | ------ | -------------------------- | --------- | ------------------------- |
| `/stocks/search` (keyword=code) | GET    | `useStockInfoQuery`        | 300s      | 종목명/마켓 기본정보      |
| `/stocks/{code}/price`          | GET    | `useStockPriceQuery`       | 5s        | 현재가/변동률/거래량 헤더 |
| `/stocks/{code}/orderbook`      | GET    | `useOrderbookQuery`        | 5s        | 호가창 (매수/매도 10호가) |
| `/stocks/{code}/candles`        | GET    | `useCandlesQuery`          | 60s       | 캔들차트 (일/주/월봉)     |
| `/stocks/{code}/trades/recent`  | GET    | `useRecentTradesQuery`     | 5s        | 체결 내역 테이블          |
| `/stocks/{code}/info`           | GET    | `useStockInfoDetailQuery`  | 10min     | 기업정보/재무/배당        |
| `/stocks/{code}/news`           | GET    | `useStockNewsQuery`        | 5min      | 종목 관련 뉴스            |
| `/stocks/{code}/disclosures`    | GET    | `useStockDisclosuresQuery` | 15min     | 공시 목록                 |
| `/stocks/{code}/investor-trend` | GET    | `useInvestorTrendQuery`    | 10min     | 투자자 매매동향           |

### WebSocket

| 토픽                   | 메시지 타입 | 사용                   |
| ---------------------- | ----------- | ---------------------- |
| `/topic/stocks/{code}` | TRADE       | 실시간 체결가 업데이트 |
| `/topic/stocks/{code}` | ORDERBOOK   | 실시간 호가 업데이트   |
| `/topic/stocks/{code}` | CANDLE      | 실시간 캔들 업데이트   |

**UI 위치:** `/stocks/{code}` 종목 상세 페이지 (stock-detail-page.tsx)
**폴백:** WS 10초 미수신 시 5초 polling

---

## 9. 관심종목 (watchlist)

| 엔드포인트          | 메서드 | 훅                   | 사용 화면          |
| ------------------- | ------ | -------------------- | ------------------ |
| `/watchlist`        | GET    | `useWatchlistQuery`  | 관심종목 패널 목록 |
| `/watchlist/{code}` | POST   | `useAddWatchlist`    | 관심종목 추가      |
| `/watchlist/{code}` | DELETE | `useDeleteWatchlist` | 관심종목 삭제      |

**UI 위치:** 실투 사이드바 관심종목 (watchlist-panel.tsx), 종목 상세 페이지 하트 버튼
**특징:** 낙관적 업데이트 (optimistic update)

---

## 10. 뉴스 피드 (news-feed)

| 엔드포인트                     | 메서드 | 훅                           | 사용 화면                   |
| ------------------------------ | ------ | ---------------------------- | --------------------------- |
| `/news/clusters`               | GET    | `useNewsFeedQuery`           | 뉴스 카드 피드 (무한스크롤) |
| `/news/clusters` (필터)        | GET    | `useFilteredFeedQuery`       | 필터링된 뉴스 목록          |
| `/news/clusters/{id}`          | GET    | `useClusterDetailQuery`      | 뉴스 클러스터 상세          |
| `/news/clusters/{id}/read`     | POST   | `useMarkClusterRead`         | 읽음 처리                   |
| `/news/clusters/{id}/feedback` | POST   | `useClusterFeedbackMutation` | 유용함/아님 피드백          |
| `/news/tags/popular`           | GET    | `usePopularTagsQuery`        | 인기 태그 (섹터/종목)       |
| `/chat/group/news-share`       | POST   | `useShareClusterNews`        | 그룹 채팅에 뉴스 공유       |

**UI 위치:**

- 홈 > 뉴스 피드 섹션 (news-feed-section.tsx, news-card.tsx)
- 뉴스 상세 페이지 (cluster-detail-page.tsx)
- 뉴스 목록 페이지 (news-list-section.tsx)

---

## 11. 마켓 트렌드 (market-trends)

| 엔드포인트                    | 메서드 | 훅                                 | 타임아웃 | 사용 화면               |
| ----------------------------- | ------ | ---------------------------------- | -------- | ----------------------- |
| `/market-trends/overview`     | GET    | `useMarketTrendsOverviewQuery`     | 5s       | 시장 트렌드 요약        |
| `/market-trends/personalized` | GET    | `usePersonalizedMarketTrendsQuery` | 60s      | AI 맞춤 트렌드          |
| `/market/indices`             | GET    | `useMarketIndicesQuery`            | -        | 지수 (코스피/코스닥 등) |

**UI 위치:** 홈 > 마켓 트렌드 섹션 (market-trends-section.tsx, market-snapshot-strip.tsx)

---

## 12. 추천 뉴스 (recommended-news)

| 엔드포인트                  | 메서드 | 훅                        | 타임아웃 | 사용 화면         |
| --------------------------- | ------ | ------------------------- | -------- | ----------------- |
| `/news/recommended`         | GET    | `useRecommendedNewsQuery` | 60s      | AI 추천 뉴스 카드 |
| `/news/recommended/refresh` | POST   | `useRecommendedNewsQuery` | 60s      | 추천 새로고침     |

**UI 위치:** 홈 > 추천 뉴스 섹션

---

## 13. 섹터 관심사 (sector-interest)

| 엔드포인트                  | 메서드 | 훅                         | 사용 화면      |
| --------------------------- | ------ | -------------------------- | -------------- |
| `/interests/sectors`        | GET    | `useSectorInterestQueries` | 관심 섹터 목록 |
| `/interests/sectors/{code}` | POST   | `useSectorInterestQueries` | 관심 섹터 추가 |
| `/interests/sectors/{code}` | DELETE | `useSectorInterestQueries` | 관심 섹터 삭제 |

**UI 위치:** 설정 또는 온보딩 화면

---

## 14. 채팅 (chat)

### REST API

| 엔드포인트              | 메서드 | 훅                           | 사용 화면                 |
| ----------------------- | ------ | ---------------------------- | ------------------------- |
| `/chat/global/messages` | GET    | `useGlobalChatMessagesQuery` | 전체 채팅 메시지 (30개씩) |
| `/chat/group/messages`  | GET    | `useGroupChatMessagesQuery`  | 그룹 채팅 메시지 (30개씩) |
| `/chat/group/me`        | GET    | `useGroupChatMeta`           | 내 그룹 정보              |

### WebSocket

| 토픽                          | 사용                  |
| ----------------------------- | --------------------- |
| `/topic/chat/global`          | 전체 채팅 실시간 수신 |
| `/topic/chat/group/{groupId}` | 그룹 채팅 실시간 수신 |

### AI 채팅

| 엔드포인트          | 메서드 | 훅                       | 타임아웃 | 사용 화면    |
| ------------------- | ------ | ------------------------ | -------- | ------------ |
| `/chat/ai/messages` | GET    | `useAiChatMessagesQuery` | 5s       | AI 채팅 이력 |
| `/chat/ai/messages` | POST   | `sendAiChatMessage`      | 60s      | AI에게 질문  |

**UI 위치:**

- 홈 사이드바 채팅 탭 (global-chat-room.tsx)
- 과거모투 플레이 채팅 (group-chat-room.tsx)
- 위피니 AI 채팅 위젯 (wefini-chat-widget.tsx)

---

## 15. 일일 퀘스트 (quest)

| 엔드포인트                 | 메서드 | 훅                       | 사용 화면          |
| -------------------------- | ------ | ------------------------ | ------------------ |
| `/quests/today`            | GET    | `useTodayQuests(userId)` | 오늘의 퀘스트 목록 |
| `/quests/{questId}/reward` | POST   | `useClaimQuestReward`    | 보상 수령          |

**UI 위치:** 홈 사이드바 퀘스트 패널 (daily-quest-panel.tsx)
**특징:** 60초 간격 자동 갱신

---

## 16. 과거 모투 - 게임방 (game-room)

### 방 관리

| 엔드포인트              | 메서드 | 훅                          | 사용 화면               |
| ----------------------- | ------ | --------------------------- | ----------------------- |
| `/rooms`                | GET    | `useGameRoomsQuery`         | 활성 방 목록 (5초 갱신) |
| `/rooms`                | POST   | `useCreateGameRoomMutation` | 방 생성                 |
| `/rooms/{roomId}`       | GET    | `useGameRoomDetailQuery`    | 방 상세 (참여자, 설정)  |
| `/rooms/{roomId}/join`  | POST   | `useJoinGameRoomMutation`   | 방 참여                 |
| `/rooms/{roomId}/leave` | DELETE | `useLeaveGameRoomMutation`  | 방 나가기               |
| `/rooms/{roomId}/start` | POST   | `useStartGameRoomMutation`  | 게임 시작 (방장)        |
| `/rooms/history`        | GET    | `useGameHistoryQuery`       | 지난 게임 이력          |

### 게임 플레이

| 엔드포인트                      | 메서드 | 훅                          | 사용 화면                   |
| ------------------------------- | ------ | --------------------------- | --------------------------- |
| `/rooms/{roomId}/turns/current` | GET    | `useCurrentTurnQuery`       | 현재 턴 정보 (날짜, 턴번호) |
| `/rooms/{roomId}/turns/next`    | POST   | `useTurnAdvanceMutation`    | 다음 턴 전환                |
| `/rooms/{roomId}/portfolio`     | GET    | `usePortfolioQuery(roomId)` | 게임 포트폴리오             |
| `/rooms/{roomId}/holdings`      | GET    | (portfolio 훅 내)           | 보유 종목                   |
| `/rooms/{roomId}/rankings`      | GET    | `useRankingsQuery`          | 참여자 랭킹                 |
| `/rooms/{roomId}/orders`        | POST   | `useOrderMutation`          | 종목 매수/매도              |
| `/rooms/{roomId}/end`           | POST   | `useEndGameMutation`        | 게임 종료 (방장)            |
| `/rooms/{roomId}/briefing`      | GET    | `useBriefingQuery`          | 시장 브리핑 (60s 타임아웃)  |

### 종목 조회 (게임 내)

| 엔드포인트                      | 메서드 | 훅               | 사용 화면         |
| ------------------------------- | ------ | ---------------- | ----------------- |
| `/rooms/{roomId}/stocks/search` | GET    | `useStockSearch` | 게임 내 종목 검색 |
| `/stocks/{symbol}/chart`        | GET    | `useStockChart`  | 게임 내 차트      |

### 게임 결과

| 엔드포인트                  | 메서드 | 훅                       | 사용 화면                |
| --------------------------- | ------ | ------------------------ | ------------------------ |
| `/rooms/{roomId}/result`    | GET    | `useGameResultQuery`     | 최종 결과 (순위, 수익률) |
| `/rooms/{roomId}/snapshots` | GET    | (result 내)              | 턴별 자산 스냅샷         |
| `/rooms/{roomId}/orders`    | GET    | (result 내)              | 게임 내 전체 주문 이력   |
| `/rooms/{roomId}/report`    | GET    | `useAnalysisReportQuery` | AI 분석 리포트 (90s)     |

### 투표 (턴 전환)

| 엔드포인트              | 메서드 | 훅                | 사용 화면    |
| ----------------------- | ------ | ----------------- | ------------ |
| `/rooms/{roomId}/votes` | POST   | `useVoteMutation` | 턴 전환 투표 |

### WebSocket

| 토픽                           | 사용              |
| ------------------------------ | ----------------- |
| `/topic/rooms/{roomId}/turns`  | 턴 변경 알림      |
| `/topic/rooms/{roomId}/trades` | 게임 내 거래 알림 |

**UI 위치:**

- 로비: game-lobby.tsx (방 목록 + 생성 + 이력)
- 대기실: game-waiting-room.tsx (참여자 + 채팅)
- 플레이: play-page.tsx (차트 + 주문 + 보유 + 채팅 + 랭킹 + 브리핑)
- 결과: result-page.tsx (순위 + 차트 + 리포트)

---

## 17. 유저 랭킹 (user-ranking)

| 엔드포인트       | 메서드 | 훅                      | 사용 화면                |
| ---------------- | ------ | ----------------------- | ------------------------ |
| `/ranking/daily` | GET    | `useUserRankingQueries` | 일일 수익 랭킹 + 내 순위 |

**UI 위치:** 홈 사이드바 랭킹 (user-ranking-table.tsx, my-rank-badge.tsx)

---

## 18. 투표 (vote)

| 엔드포인트                | 메서드 | 훅                      | 사용 화면 |
| ------------------------- | ------ | ----------------------- | --------- |
| `/votes/{voteId}`         | GET    | `useVoteDetailQuery`    | 투표 상세 |
| `/votes`                  | POST   | `useCreateVoteMutation` | 투표 생성 |
| `/votes/{voteId}/answers` | POST   | `useSubmitVoteMutation` | 투표 참여 |
| `/votes/{voteId}/result`  | GET    | `useVoteResultQuery`    | 투표 결과 |

**UI 위치:** 그룹 채팅 내 투표 기능

---

## 19. 그룹 & 설정 (settings)

| 엔드포인트                              | 메서드 | 훅                                 | 사용 화면       |
| --------------------------------------- | ------ | ---------------------------------- | --------------- |
| `/users/me/group`                       | GET    | `useMyGroupQuery`                  | 내 그룹 정보    |
| `/groups`                               | POST   | `useCreateGroupMutation`           | 그룹 생성       |
| `/groups/join`                          | POST   | `useJoinGroupMutation`             | 초대코드로 참여 |
| `/groups/{groupId}/members/me`          | DELETE | `useLeaveGroupMutation`            | 그룹 탈퇴       |
| `/groups/{groupId}/invite-codes/latest` | GET    | `useGroupInviteCodeQuery`          | 초대코드 조회   |
| `/groups/{groupId}/invite-codes`        | POST   | `useCreateGroupInviteCodeMutation` | 초대코드 생성   |

**UI 위치:** 설정 페이지 (settings-view.tsx → settings-group-section.tsx)

---

## 20. 관리자 (admin)

| 엔드포인트                | 메서드 | 훅                         | 사용 화면        |
| ------------------------- | ------ | -------------------------- | ---------------- |
| `/admin/market/snapshots` | GET    | `useMarketSnapshotsQuery`  | 시장 스냅샷 조회 |
| `/admin/market/collect`   | POST   | `useCollectMarketMutation` | 시장 데이터 수집 |
| `/admin/news/collect`     | POST   | `useCollectNewsMutation`   | 뉴스 수집        |
| `/admin/news/crawl`       | POST   | -                          | 뉴스 크롤링      |

**UI 위치:** 관리자 전용 페이지

---

## 화면별 API 매핑 요약

| 페이지                                         | 사용 API                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| **홈** (`/`)                                   | 뉴스피드, 마켓트렌드, 추천뉴스, 지수, 관심종목, 보유종목, 랭킹, 퀘스트, 채팅         |
| **종목 목록** (`/stocks`)                      | 종목랭킹 (4탭)                                                                       |
| **종목 상세** (`/stocks/:code`)                | 시세, 호가, 캔들, 체결, 기업정보, 뉴스, 공시, 투자자동향, 주문, 관심종목 + WebSocket |
| **계좌** (`/account`)                          | 계좌정보, 자산이력, 포트폴리오, 주문이력, 체결이력                                   |
| **뉴스 상세** (`/news/:id`)                    | 클러스터상세, 읽음처리, 피드백, 뉴스공유                                             |
| **설정** (`/settings`)                         | 그룹(CRUD), 초대코드, 프로필색상(localStorage)                                       |
| **과거모투 로비** (`/history`)                 | 방목록, 방생성, 방참여, 게임이력                                                     |
| **과거모투 대기** (`/history/room/:id`)        | 방상세, 시작, 나가기, 채팅                                                           |
| **과거모투 플레이** (`/history/room/:id/play`) | 턴, 브리핑, 포트폴리오, 랭킹, 주문, 차트, 투표, 채팅 + WebSocket                     |
| **과거모투 결과** (`/history/room/:id/result`) | 게임결과, 스냅샷, 주문이력, AI리포트                                                 |
| **채팅** (`/chat`)                             | 전체채팅, 그룹채팅 메시지 + WebSocket                                                |

---

## 인프라 참고

- **Base URL:** `VITE_API_BASE_URL` (기본 `/api`)
- **WS URL:** `VITE_WS_URL` (base에서 `/api` → `/ws` 치환)
- **인증:** Bearer 토큰 (localStorage), 자동 refresh
- **에러 형식:** `{ status, code, message, data }`
- **Formspree:** `https://formspree.io/f/mykljlzz` (피드백 전용, 백엔드 무관)

import { useState } from 'react'

import FeedbackModal from '@/widgets/footer/ui/feedback-modal'

export default function PrivacyPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl py-10">
      <div className="rounded-2xl bg-white p-8">
        <h1 className="text-2xl font-bold text-wefin-text">개인정보처리방침</h1>
        <p className="mt-2 text-xs text-wefin-subtle">최종 수정일: 2026년 4월 19일</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-wefin-text/80">
          <section>
            <h2 className="text-base font-bold text-wefin-text">1. 수집하는 개인정보 항목</h2>
            <p className="mt-2">WeFin은 서비스 제공을 위해 아래 최소한의 정보를 수집합니다.</p>
            <table className="mt-3 w-full text-xs">
              <thead>
                <tr className="border-b border-wefin-line text-left">
                  <th className="py-2 pr-4 font-semibold text-wefin-text">구분</th>
                  <th className="py-2 pr-4 font-semibold text-wefin-text">수집 항목</th>
                  <th className="py-2 font-semibold text-wefin-text">수집 시점</th>
                </tr>
              </thead>
              <tbody className="text-wefin-text/70">
                <tr className="border-b border-wefin-line/50">
                  <td className="py-2 pr-4">필수</td>
                  <td className="py-2 pr-4">이메일, 비밀번호(암호화), 닉네임</td>
                  <td className="py-2">회원가입 시</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">선택</td>
                  <td className="py-2 pr-4">초대코드</td>
                  <td className="py-2">회원가입 시</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>회원 식별 및 인증</li>
              <li>모의투자 서비스 제공 (포트폴리오, 주문, 랭킹 등)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">3. 개인정보의 보유 및 이용 기간</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>
                이메일 문의를 통해 <strong>회원 탈퇴 및 개인정보 삭제를 요청</strong>할 수 있으며,
                요청 접수 후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간
                동안 보관합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">4. 개인정보의 제3자 제공</h2>
            <p className="mt-2">
              WeFin은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는
              경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">5. 개인정보의 안전성 확보 조치</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>비밀번호는 단방향 암호화하여 저장합니다.</li>
              <li>개인정보에 대한 접근 권한을 최소한으로 제한합니다.</li>
              <li>SSL/TLS를 통한 데이터 전송 암호화를 적용합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">6. 이용자의 권리</h2>
            <p className="mt-2">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>개인정보 열람, 수정, 삭제 요청</li>
              <li>이메일 문의를 통한 회원 탈퇴 및 개인정보 처리 정지 요청</li>
              <li>
                위 요청은 설정 페이지 또는{' '}
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="font-medium text-wefin-mint-deep hover:underline"
                >
                  의견 보내기
                </button>
                으로 문의해 주세요.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">7. 개인정보 보호책임자</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5">
              <li>팀명: SOLV</li>
              <li>이메일: solv.developers@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">8. 방침 변경</h2>
            <p className="mt-2">
              본 방침이 변경되는 경우 시행일 7일 전부터 서비스 내 공지를 통해 안내하며, 변경된
              내용은 이 페이지에 게시합니다.
            </p>
          </section>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}

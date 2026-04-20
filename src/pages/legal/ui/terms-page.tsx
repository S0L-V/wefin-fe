export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="rounded-2xl bg-white p-8">
        <h1 className="text-2xl font-bold text-wefin-text">이용약관</h1>
        <p className="mt-2 text-xs text-wefin-subtle">최종 수정일: 2026년 4월 19일</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-wefin-text/80">
          <section>
            <h2 className="text-base font-bold text-wefin-text">제1조 (목적)</h2>
            <p className="mt-2">
              본 약관은 SOLV(이하 "SOLV")이 운영하는 WeFin 서비스(이하 "서비스")의 이용과 관련하여
              SOLV와 이용자 간의 권리, 의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제2조 (서비스의 성격)</h2>
            <ol className="mt-2 list-inside list-decimal space-y-1.5">
              <li>
                본 서비스는 한국투자증권 Open API를 기반으로 한 <strong>모의투자 시뮬레이션</strong>
                이며, 실제 금융 거래를 제공하지 않습니다.
              </li>
              <li>서비스 내 모든 자산, 잔고, 수익은 가상이며 실제 금전적 가치가 없습니다.</li>
              <li>
                실시간 시세 데이터는 참고 목적으로 제공되며, 데이터의 정확성이나 실시간성을 보장하지
                않습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제3조 (회원 가입 및 계정)</h2>
            <ol className="mt-2 list-inside list-decimal space-y-1.5">
              <li>서비스 이용을 위해 이메일 인증을 통한 회원 가입이 필요합니다.</li>
              <li>회원은 정확한 정보를 제공해야 하며, 타인의 정보를 도용해서는 안 됩니다.</li>
              <li>계정은 본인만 사용할 수 있으며, 타인에게 양도하거나 공유할 수 없습니다.</li>
              <li>
                SOLV는 다음에 해당하는 경우 회원의 서비스 이용을 제한할 수 있습니다.
                <ul className="ml-4 mt-1 list-inside list-disc space-y-1">
                  <li>비정상적인 방법으로 서비스를 이용하는 경우</li>
                  <li>다른 이용자의 서비스 이용을 방해하는 경우</li>
                  <li>서비스의 안정적 운영을 저해하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제4조 (서비스 이용)</h2>
            <ol className="mt-2 list-inside list-decimal space-y-1.5">
              <li>
                서비스는 무료로 제공됩니다. 구독 결제 기능은 현재 Toss Payments 테스트 모드로
                운영되며, 실제 결제가 발생하지 않습니다.
              </li>
              <li>
                SOLV는 서비스의 개선, 시스템 점검 등의 사유로 사전 공지 후 서비스를 일시적으로
                중단할 수 있습니다.
              </li>
              <li>
                서비스 내 채팅 기능 이용 시 욕설, 비방, 도배 등 다른 이용자를 불쾌하게 하는 행위를
                해서는 안 됩니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제5조 (면책사항)</h2>
            <ol className="mt-2 list-inside list-decimal space-y-1.5">
              <li>
                본 서비스의 시세 정보 및 AI 분석은 투자 권유가 아니며, 이를 바탕으로 한 실제 투자에
                대해 SOLV는 책임을 지지 않습니다.
              </li>
              <li>
                천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 SOLV는 책임을 지지
                않습니다.
              </li>
              <li>회원이 서비스 내에 게시한 정보에 대한 책임은 해당 회원에게 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제6조 (지적재산권)</h2>
            <p className="mt-2">
              서비스에 포함된 콘텐츠, 디자인, 소프트웨어 등 일체의 지적재산권은 SOLV에 귀속되며,
              이를 무단으로 복제, 배포, 수정할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-wefin-text">제7조 (약관의 변경)</h2>
            <p className="mt-2">
              SOLV는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 효력이
              발생합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

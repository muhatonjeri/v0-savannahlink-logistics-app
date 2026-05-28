import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Rental Terms & Conditions — Moventra Safaris & Logistics",
  description: "Full hire/lease agreement terms and conditions for Moventra Safaris & Logistics Ltd car rental services.",
};

export default function CarRentalTermsPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Segoe UI', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ background:"#050A14", borderBottom:"3px solid #F97316", padding:"20px 32px" }}>
        <div style={{ maxWidth:780, margin:"0 auto", display:"flex", alignItems:"center", gap:16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Moventra" style={{ width:56, height:56, borderRadius:12, objectFit:"cover", border:"2px solid rgba(249,115,22,.4)" }} />
          <div>
            <h1 style={{ color:"white", fontSize:20, fontWeight:800, margin:0, letterSpacing:"-.01em" }}>MOVENTRA</h1>
            <p style={{ color:"#F97316", fontSize:10, margin:0, textTransform:"uppercase", letterSpacing:".15em" }}>Safaris & Logistics Ltd</p>
            <p style={{ color:"#64748B", fontSize:11, margin:"2px 0 0" }}>Muthaiga Square, off Thika Rd · +254 727 247 032</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#050A14,#0F1929)", padding:"28px 32px", borderBottom:"1px solid #E2E8F0" }}>
        <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center" }}>
          <div style={{ display:"inline-block", background:"rgba(249,115,22,.12)", border:"1px solid rgba(249,115,22,.3)", borderRadius:12, padding:"4px 14px", marginBottom:12 }}>
            <span style={{ color:"#F97316", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>🚗 Car Rental — Hire/Lease Agreement</span>
          </div>
          <h2 style={{ color:"white", fontSize:26, fontWeight:700, margin:"0 0 8px" }}>Terms & Conditions</h2>
          <p style={{ color:"#94A3B8", fontSize:14, margin:0 }}>
            Please read these terms carefully before signing your hire agreement.
            By accepting a vehicle from Moventra Safaris & Logistics Ltd, you agree to all conditions below.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:780, margin:"0 auto", padding:"32px 24px" }}>

        {/* Key rules highlight */}
        <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:14, padding:"20px 24px", marginBottom:28 }}>
          <h3 style={{ color:"#C2410C", margin:"0 0 14px", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
            ⚠ Key Obligations at a Glance
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 24px" }}>
            {[
              "Valid driving licence (min 2 years) required",
              "Vehicle returned full-to-full on fuel",
              "Security deposit required at collection",
              "Late returns charged at daily rate pro-rata",
              "Report accidents within 24 hours",
              "Cross-border travel requires prior approval",
              "No sub-letting or unauthorised drivers",
              "Hirer pays all fines & penalties incurred",
            ].map((rule, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#7C3AED" }}>
                <span style={{ color:"#F97316", fontWeight:700, flexShrink:0 }}>✓</span>{rule}
              </div>
            ))}
          </div>
        </div>

        {/* Full terms */}
        <div style={{ background:"white", border:"1px solid #E2E8F0", borderRadius:14, padding:"24px 28px" }}>
          <h3 style={{ color:"#0F172A", margin:"0 0 20px", fontSize:16, fontWeight:700, paddingBottom:12, borderBottom:"2px solid #F97316" }}>
            Further Terms and Conditions
          </h3>
          <ol style={{ paddingLeft:20, margin:0, display:"flex", flexDirection:"column", gap:14 }}>
            {[
              "The vehicle is and remains the property of the owner and the hirer shall return it in the order and condition as when received, exception ordinary wear and tear, to the place the owner will communicate or such other place and at such other time as the owner was direct.",
              "The hirer will not affect any major services notice and consent of the agent. The hirer is however still fully liable and responsible for the car.",
              "The vehicle should NEVER be used: (a) By any person without a valid driving licence recognised in this country. (b) For any illegal or immoral purpose. (c) To propel or tow a vehicle or trailer. (d) Transport or carry NARCOTICS or other forbidden substances. (e) If the vehicle does not have a valid insurance. (f) In a rally speed or contest.",
              "The hirer is the authorized person to use the car and the specified period. If the period is exceeded, immediate contact or owner or other written agreement is needed, else the vehicle will be considered stolen and or in unlawful use of motor vehicle and may report to the police.",
              "The owner shall insure the vehicle so as to comply with the laws of the land.",
              "The agent/owner shall not be liable to meet any claims in respect of death or of bodily harm to persons being carried in or getting on or alighting the vehicle.",
              "The hirer shall meet all the expenses which may result as a result of loss of minor parts at any one time during the period of the contract. This will include daily rates as agreed on the contract during repair period in case of an accident involving the client as well as the cost of repairing the damage.",
              "The hirer must pay KES 100,000 on top of what insurance will add and it will start for those days the car will be at the garage. The hirer will pay the excess fee for the insurance company when a claim is made as a result of an incident/accident while hirer was using the car.",
              "The hirer is solely responsible for all fines, penalties and for features imposed by reason of bleach by persons in control of vehicle of any law or by-law or other regulations of any competent authority. The hirer shall on completion of the hire, hand over to the agent/owner all demands, summon and notifications arising out of any offence in relation to the use of the vehicle as well as notification of any penalty and charges incurred during the period of hire.",
              "The hirer shall not during the hiring or thereafter sell or otherwise part with the possession or ownership of the vehicle otherwise than to the company.",
              "The owner may vary the vehicle hired provided the hirer has been given reasonable notice as to the intention by the owner.",
              "The hirer can terminate the contract by giving a 30-day notice or paying one month's equivalent — pay on immediate cancellation of the contract before agreed time. (*If contract longer than a month).",
              "The hirer will pay on demand all charges in accordance with this agreement.",
              "In the event of the hirer breaching any terms of the agreement set out herein, the owner has the right to terminate the contract and take possession of the vehicle without recourse to court and the hirer shall be liable for all costs of such repossession.",
              "No waiver or variation of the terms hereof shall be binding to the owner unless authorized and signed by the owner.",
              "It is understood and agreed that any dispute under this contract shall be subject to the jurisdiction of the court of Kenya.",
            ].map((term, i) => (
              <li key={i} style={{ fontSize:13, color:"#374151", lineHeight:1.7 }}>
                <span>{term}</span>
              </li>
            ))}
          </ol>

          {/* I agree section */}
          <div style={{ marginTop:28, paddingTop:20, borderTop:"1px solid #E2E8F0" }}>
            <p style={{ fontSize:13, color:"#374151", fontStyle:"italic", marginBottom:16 }}>
              I hereby agree to all items on this page and overleaf.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {[["Hirer Name",""],["Signature",""],["Date","/ /20"]].map(([label, hint]) => (
                <div key={label}>
                  <p style={{ fontSize:11, color:"#6B7280", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>{label}</p>
                  <div style={{ borderBottom:"1px solid #374151", height:28, display:"flex", alignItems:"flex-end", paddingBottom:4 }}>
                    <span style={{ fontSize:12, color:"#9CA3AF" }}>{hint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:24, padding:"16px 0", borderTop:"1px solid #E2E8F0" }}>
          <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 4px" }}>Moventra Safaris & Logistics Ltd</p>
          <p style={{ fontSize:11, color:"#CBD5E1", margin:0 }}>
            Muthaiga Square, off Thika Road, Nairobi ·{" "}
            <a href="mailto:info@savannalink.com" style={{ color:"#F97316", textDecoration:"none" }}>info@savannalink.com</a> ·{" "}
            <a href="http://www.savannalink.com" style={{ color:"#F97316", textDecoration:"none" }}>www.savannalink.com</a> ·{" "}
            +254 727 247 032
          </p>
        </div>
      </div>
    </div>
  );
}

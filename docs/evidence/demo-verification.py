"""Reproduces the Demo A~E and six-language checks against a deployed SSAFIN instance.

    python3 docs/evidence/demo-verification.py [BASE_URL]

Creates throwaway temporary profiles, which expire on their own after 24 hours.
"""

import os
import sys
import json, urllib.request, ssl

D = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SSAFIN_URL", "https://34-64-228-103.sslip.io")).rstrip("/")
ctx = ssl.create_default_context()

def call(path, body=None, method=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(D + path, data=data, method=method or ("POST" if data else "GET"),
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=150, context=ctx) as r:
        return json.loads(r.read().decode("utf-8"))

products = {p["productCode"]: p for p in call("/api/products")}
base = {"nationality": "VN", "visaType": "E-9", "visaExpiry": "2027-10-30",
        "residencyStartDate": "2024-08-30", "financialPurpose": "SAVE_MONEY", "language": "ko",
        "residentStatus": "RESIDENT", "monthlyIncome": 2800000, "employmentDurationMonths": 10,
        "hasResidenceCard": True, "hasPassport": True, "hasDomesticPhone": True,
        "canDomesticPhoneVerify": True, "hasKoreanBankAccount": True, "hasKoreanCreditHistory": False,
        "hasExistingProductAccount": False, "desiredMonthlyAmount": 300000, "preferredChannel": "BRANCH"}

def profile(**over):
    return call("/api/profiles", {**base, **over})

results = []
def check(label, ok, detail):
    results.append((ok, label, detail))
    print(("PASS " if ok else "FAIL ") + label + " :: " + detail)

# Demo A - a general product must not ask for visa fields
a = products["KB-MY-SAVINGS"]
fields = a["requiredFields"]
check("Demo A general product asks no visa field", not ({"visaType", "visaExpiry"} & set(fields)), "requiredFields=%s" % fields)

# Demo B - both audiences recommended together for SAVE_MONEY
p = profile()
rec = call("/api/recommendations", {"profileSessionId": p["sessionId"]})
codes = [r["productName"] for r in rec["recommended"]]
auds = {r.get("productAudience") for r in rec["recommended"]}
check("Demo B mixes general and foreigner-specialised", len(auds) > 1, "audiences=%s count=%d" % (sorted(a for a in auds if a), len(codes)))

# Demo C - branch known, foreigner mobile unknown
c = products["HANA-SALARY-COMPOUND-SAVINGS"]
pre = call("/api/eligibility/pre-check", {"profileSessionId": p["sessionId"], "productId": c["id"]})
acc = pre["accessAssessment"]
check("Demo C separates branch from online", acc["branch"] == "AVAILABLE" and acc["online"] == "UNKNOWN",
      "branch=%s online=%s status=%s" % (acc["branch"], acc["online"], acc["status"]))

# Demo D - loan surfaces the bank-confirmation condition
d = products["HANA-EZ-LOAN"]
pl = profile(financialPurpose="GET_LOAN")
pred = call("/api/eligibility/pre-check", {"profileSessionId": pl["sessionId"], "productId": d["id"]})
keys = [r["key"] for r in pred["externalChecks"] + pred["unknownRules"]]
check("Demo D raises the external bank check", "FX_BANK_AND_E9_ENTRY_CHECK" in keys,
      "status=%s keys=%s" % (pred["status"], keys))

# Demo E - missing official material is not hidden
e = products["SHINHAN-SOL-GLOBAL-JEONSE"]
pree = call("/api/eligibility/pre-check", {"profileSessionId": pl["sessionId"], "productId": e["id"]})
check("Demo E admits insufficient official material",
      e["diagnosisStatus"] == "NOT_READY" and pree["accessAssessment"]["status"] == "ACCESS_UNKNOWN",
      "diagnosis=%s access=%s" % (e["diagnosisStatus"], pree["accessAssessment"]["status"]))

print()
print("=== languages ===")
for lang in ["en", "vi", "zh", "ja", "th"]:
    pv = profile(language=lang, financialPurpose="GET_LOAN")
    call("/api/eligibility/pre-check", {"profileSessionId": pv["sessionId"], "productId": d["id"]})
    ex = call("/api/ai/explanation", {"profileSessionId": pv["sessionId"], "productId": d["id"]})
    text = ex["explanation"]
    hangul = any("가" <= ch <= "힣" for ch in text)
    check("%s explanation is not Korean" % lang, not hangul, text[:90].replace("\n", " "))

print()
failed = [r for r in results if not r[0]]
print("%d checks, %d failed" % (len(results), len(failed)))
sys.exit(1 if failed else 0)

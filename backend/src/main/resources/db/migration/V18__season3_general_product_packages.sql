-- Season 3 general-product packages.
-- Official excerpts were re-checked on 2026-08-24 and this import was explicitly
-- authorized by the workspace owner. Product-level online availability never
-- implies foreign-resident online availability unless the same evidence says so.

SET @reviewer = 'workspace-owner-authorized-2026-08-24';

-- Shared foreign-customer identity evidence. These documents prove an identity
-- method only; they do not create FOREIGNER_ALLOWED eligibility rules.
SET @kb_cdd = 'KB국민은행 고객확인의무 안내: 외국인 개인 고객의 실명확인증표로 외국인등록증 또는 여권 등을 확인하며, 거래 목적에 따라 추가 서류를 요청할 수 있다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
 retrieved_at, information_base_date, valid_from, valid_to, language, review_status, last_verified_at,
 reviewed_by, created_at, updated_at)
SELECT 'KB국민은행','PUBLIC_GUIDE','KB국민은행 고객확인의무 안내','https://obank.kbstar.com/quics?page=C029250',
 @kb_cdd,SHA2(@kb_cdd,256),CURRENT_TIMESTAMP(6),'2026-08-24',NULL,NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_cdd,256));
SET @kb_cdd_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_cdd,256));

SET @hana_identity = '하나은행 외국인 고객 실명확인 안내: 영업점 실명확인 시 여권, 외국인등록증 등 공식 실명확인증표를 사용한다. 외국인 비대면 계좌개설은 별도 지원 범위가 적용되므로 개별 상품의 모바일 가입 가능 여부를 뜻하지 않는다.';
INSERT INTO source_document (institution, source_type, title, source_url, snapshot_text, content_hash,
 retrieved_at, information_base_date, valid_from, valid_to, language, review_status, last_verified_at,
 reviewed_by, created_at, updated_at)
SELECT '하나은행','PUBLIC_GUIDE','하나은행 외국인 고객 실명확인 안내','https://image.kebhana.com/cont/download/documents/provide/0000000220407_20251218.pdf',
 @hana_identity,SHA2(@hana_identity,256),CURRENT_TIMESTAMP(6),'2026-08-24','2025-12-18',NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM source_document WHERE content_hash=SHA2(@hana_identity,256));
SET @hana_identity_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@hana_identity,256));

-- 1. Shinhan Livelihood Account
SET @shinhan_page = '신한은행 예금상품 공식 안내. 신한 생계비계좌는 1개월간 생계유지에 필요한 예금에 대한 압류를 금지하는 저축예금이다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT '신한은행','PRODUCT_PAGE','신한은행 예금상품 공식 안내 - 신한 생계비계좌','https://bank.shinhan.com/index.jsp#020101010000',@shinhan_page,SHA2(@shinhan_page,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-02-02','2027-02-02','ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@shinhan_page,256));
SET @shinhan_page_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@shinhan_page,256));
SET @shinhan_desc = '가입대상: 실명의 개인 및 개인사업자(전 금융기관 1인 1계좌). 외국인의 실명확인증표는 외국인등록증, 국내거소신고증, 영주증을 보유한 경우로 한정. 가입방법: 영업점, 신한SOL뱅크. 운영시간은 월~토 07:00~21:30.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT '신한은행','PRODUCT_DESCRIPTION','신한 생계비계좌 상품설명서','https://img.shinhan.com/sbank2016/seol/20260120000000320001LC000030.PDF?1769959526658=',@shinhan_desc,SHA2(@shinhan_desc,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-02-02','2027-02-02','ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@shinhan_desc,256));
SET @shinhan_desc_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@shinhan_desc,256));

-- 2. KB Livelihood Account
SET @kb_life_page = 'KB생계비계좌: 실명의 개인, 전 금융기관 1인 1계좌. 실명확인증표를 제출한 외국인도 가입 가능하며 외국인등록증, 국내거소신고증, 영주증을 사용한다. 가입 채널은 지점과 KB스타뱅킹이다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','PRODUCT_PAGE','신상품 KB생계비계좌 출시','https://obank.kbstar.com/quics?articleClass=2&articleId=142978&bbsMode=view&boardId=669&compId=b058336&page=C020722',@kb_life_page,SHA2(@kb_life_page,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-02-02','2027-12-31','ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_life_page,256));
SET @kb_life_page_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_life_page,256));
SET @kb_life_desc = 'KB국민은행 상품공시실은 KB생계비계좌 상품설명서와 특약을 현재 공시한다. 상품 가입 전 상품설명서와 약관을 확인해야 한다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','PRODUCT_DESCRIPTION','KB생계비계좌 공식 공시자료','https://obank.kbstar.com/quics?cc=b054061%3Ab054061&page=C022190',@kb_life_desc,SHA2(@kb_life_desc,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-02-02',NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_life_desc,256));
SET @kb_life_desc_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_life_desc,256));

-- 3. KB My Savings
SET @kb_my_page = 'KB나만의 적금. 가입대상은 실명의 개인(1인 2계좌 제한), 계약기간 3개월 이상 12개월 이하, 월 저축금액 1만원 이상 100만원 이하. 가입방법은 KB스타뱅킹과 영업점이다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','PRODUCT_PAGE','KB나만의 적금 공식 상품페이지','https://obank.kbstar.com/quics?cc=b061761%3Ab061770&isNew=N&page=C020702&prcode=DP01001632',@kb_my_page,SHA2(@kb_my_page,256),CURRENT_TIMESTAMP(6),'2026-08-24',NULL,NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_my_page,256));
SET @kb_my_page_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_my_page,256));
SET @kb_my_desc = 'KB나만의 적금 거래조건: 실명의 개인, 월 1만원 이상 100만원 이하, 3개월 이상 12개월 이하, KB스타뱅킹 및 영업점 신규.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','PRODUCT_DESCRIPTION','KB나만의 적금 공식 상품정보','https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP01001632',@kb_my_desc,SHA2(@kb_my_desc,256),CURRENT_TIMESTAMP(6),'2026-08-24',NULL,NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_my_desc,256));
SET @kb_my_desc_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_my_desc,256));

-- 4. Hana Salary Compound Savings
SET @hana_salary_page = '급여하나 월복리 적금. 가입대상은 실명의 개인 또는 개인사업자(1인 1계좌). 가입금액은 1만원 이상 300만원 이하. 신규 채널은 영업점, 인터넷뱅킹, 스마트폰뱅킹이다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT '하나은행','PRODUCT_PAGE','급여하나 월복리 적금 공식 상품페이지','https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1455929_115157.jsp',@hana_salary_page,SHA2(@hana_salary_page,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-07-31',NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@hana_salary_page,256));
SET @hana_salary_page_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@hana_salary_page,256));
SET @hana_salary_desc = '급여하나 월복리 적금 상품설명서: 실명의 개인 또는 개인사업자(1인 1계좌), 신규 영업점·인터넷뱅킹·스마트폰뱅킹, 가입금액 1만원 이상 300만원 이하.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT '하나은행','PRODUCT_DESCRIPTION','급여하나 월복리 적금 상품설명서','https://image.kebhana.com/cont/download/documents/manual/0100272000101_20260731_m.pdf',@hana_salary_desc,SHA2(@hana_salary_desc,256),CURRENT_TIMESTAMP(6),'2026-08-24','2026-07-31',NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@hana_salary_desc,256));
SET @hana_salary_desc_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@hana_salary_desc,256));

-- 5. KB Star Time Deposit
SET @kb_star_page = 'KB Star 정기예금. 개인 및 개인사업자 대상 디지털 정기예금. 가입기간 1개월 이상 36개월 이하, 가입금액 100만원 이상. 인터넷뱅킹과 KB스타뱅킹에서 신규한다.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','PRODUCT_PAGE','KB Star 정기예금 공식 상품페이지','https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP000938',@kb_star_page,SHA2(@kb_star_page,256),CURRENT_TIMESTAMP(6),'2026-08-24',NULL,NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_star_page,256));
SET @kb_star_page_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_star_page,256));
SET @kb_star_desc = 'KB Star 정기예금 특약 및 상품정보: 가입대상 개인 및 개인사업자, 가입금액 100만원 이상, 인터넷뱅킹 또는 KB스타뱅킹을 통한 신규.';
INSERT INTO source_document (institution,source_type,title,source_url,snapshot_text,content_hash,retrieved_at,information_base_date,valid_from,valid_to,language,review_status,last_verified_at,reviewed_by,created_at,updated_at)
SELECT 'KB국민은행','TERMS','KB Star 정기예금 특약','https://img2.kbstar.com/obj/ocommon/221114_kbstar_terms2.pdf',@kb_star_desc,SHA2(@kb_star_desc,256),CURRENT_TIMESTAMP(6),'2026-08-24',NULL,NULL,'ko','APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS(SELECT 1 FROM source_document WHERE content_hash=SHA2(@kb_star_desc,256));
SET @kb_star_desc_id=(SELECT id FROM source_document WHERE content_hash=SHA2(@kb_star_desc,256));

-- Products. GENERAL means audience positioning, not a claim that all foreigners are eligible.
INSERT INTO financial_product (product_code,institution,product_name,product_type,financial_purpose,product_audience,product_category,description,target_summary,source_document_id,active,foreigner_target,information_base_date,public_conditions,additional_conditions,required_documents,application_method,created_at,updated_at) VALUES
('SHINHAN-LIVELIHOOD-ACCOUNT','신한은행','신한 생계비계좌','CHECKING_ACCOUNT','ACCOUNT','GENERAL','DEMAND_DEPOSIT','월 생계유지 자금을 보호하는 압류방지 저축예금','외국인 실명확인증표 보유 고객을 포함한 실명의 개인·개인사업자',@shinhan_page_id,TRUE,FALSE,'2026-08-24','전 금융기관 1인 1계좌','외국인 모바일 신규 가능 여부는 은행 확인 필요','외국인등록증·국내거소신고증·영주증 중 해당 증표','영업점 또는 신한SOL뱅크(외국인 모바일 가능 여부 별도 확인)',CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
('KB-LIVELIHOOD-ACCOUNT','KB국민은행','KB생계비계좌','CHECKING_ACCOUNT','ACCOUNT','GENERAL','DEMAND_DEPOSIT','최대 250만원까지 생계자금을 보호하는 압류방지 통장','실명확인증표를 제출한 외국인을 포함한 실명의 개인',@kb_life_page_id,TRUE,FALSE,'2026-08-24','전 금융기관 1인 1계좌','모바일 신규 시 실제 본인확인 가능 여부 추가 확인','외국인등록증·국내거소신고증·영주증 중 해당 증표','지점 또는 KB스타뱅킹',CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
('KB-MY-SAVINGS','KB국민은행','KB나만의 적금','SAVINGS','SAVINGS','GENERAL','SAVINGS','조건을 조합해 만드는 자유적립식 적금','월 납입 희망액 1만원 이상 100만원 이하 고객',@kb_my_page_id,TRUE,FALSE,'2026-08-24','월 1만원 이상 100만원 이하','외국인 KB스타뱅킹 신규 가능 여부 확인 필요','외국인 실명확인증표 및 은행 요청 추가서류','KB스타뱅킹 또는 영업점',CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
('HANA-SALARY-COMPOUND-SAVINGS','하나은행','급여하나 월복리 적금','SAVINGS','SAVINGS','GENERAL','SAVINGS','급여 실적에 우대금리를 제공하는 월복리 적금','1인 1계좌 및 월 납입 한도에 맞는 고객',@hana_salary_page_id,TRUE,FALSE,'2026-08-24','1인 1계좌, 1만원 이상 300만원 이하','외국인 인터넷·스마트폰 신규 가능 여부 확인 필요','여권 또는 외국인등록증 등 공식 실명확인증표','영업점·인터넷뱅킹·스마트폰뱅킹',CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
('KB-STAR-TIME-DEPOSIT','KB국민은행','KB Star 정기예금','SAVINGS','SAVINGS','GENERAL','TIME_DEPOSIT','인터넷과 KB스타뱅킹에서 가입하는 디지털 정기예금','예치 희망액 100만원 이상 고객',@kb_star_page_id,TRUE,FALSE,'2026-08-24','가입금액 100만원 이상','외국인 온라인 신규 가능 여부 확인 필요','외국인 실명확인증표 및 은행 요청 추가서류','인터넷뱅킹 또는 KB스타뱅킹',CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6));

SET @p_shinhan=(SELECT id FROM financial_product WHERE product_code='SHINHAN-LIVELIHOOD-ACCOUNT');
SET @p_kblife=(SELECT id FROM financial_product WHERE product_code='KB-LIVELIHOOD-ACCOUNT');
SET @p_kbmy=(SELECT id FROM financial_product WHERE product_code='KB-MY-SAVINGS');
SET @p_hanasalary=(SELECT id FROM financial_product WHERE product_code='HANA-SALARY-COMPOUND-SAVINGS');
SET @p_kbstar=(SELECT id FROM financial_product WHERE product_code='KB-STAR-TIME-DEPOSIT');

-- Eligibility rules: only explicit, user-comparable conditions.
INSERT INTO rule_candidate (source_document_id,product_code,rule_key,operator,rule_value,rule_level,rule_nature,mandatory,source_excerpt,source_locator,page_number,section_name,valid_from,valid_to,description,confidence,review_status,last_verified_at,reviewed_by,created_at,updated_at) VALUES
(@shinhan_desc_id,'SHINHAN-LIVELIHOOD-ACCOUNT','HAS_EXISTING_PRODUCT_ACCOUNT','EQ','false','HARD','HARD_ELIGIBILITY',TRUE,'전 금융기관 1인 1계좌','상품설명서 p.1 가입대상',1,'가입대상','2026-02-02','2027-02-02','다른 금융기관을 포함해 생계비계좌를 보유하지 않아야 함',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_life_page_id,'KB-LIVELIHOOD-ACCOUNT','HAS_EXISTING_PRODUCT_ACCOUNT','EQ','false','HARD','HARD_ELIGIBILITY',TRUE,'전 금융기관 1인 1계좌','신상품 안내 가입대상',NULL,'가입 대상','2026-02-02','2027-12-31','다른 금융기관을 포함해 생계비계좌를 보유하지 않아야 함',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_my_desc_id,'KB-MY-SAVINGS','DESIRED_MONTHLY_AMOUNT','GTE','10000','HARD','HARD_ELIGIBILITY',TRUE,'월 1만원 이상~100만원 이하','상품정보 저축금액',NULL,'저축금액',NULL,NULL,'월 최소 납입액',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_my_desc_id,'KB-MY-SAVINGS','DESIRED_MONTHLY_AMOUNT','LTE','1000000','HARD','HARD_ELIGIBILITY',TRUE,'월 1만원 이상~100만원 이하','상품정보 저축금액',NULL,'저축금액',NULL,NULL,'월 최대 납입액',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_salary_desc_id,'HANA-SALARY-COMPOUND-SAVINGS','HAS_EXISTING_PRODUCT_ACCOUNT','EQ','false','HARD','HARD_ELIGIBILITY',TRUE,'실명의 개인 또는 개인사업자(1인 1계좌)','상품설명서 가입대상',1,'가입대상','2026-07-31',NULL,'동일 상품 계좌를 보유하지 않아야 함',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_salary_desc_id,'HANA-SALARY-COMPOUND-SAVINGS','DESIRED_MONTHLY_AMOUNT','GTE','10000','HARD','HARD_ELIGIBILITY',TRUE,'가입금액 1만원 이상 300만원 이하','상품설명서 가입금액',1,'가입금액','2026-07-31',NULL,'월 최소 납입액',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_salary_desc_id,'HANA-SALARY-COMPOUND-SAVINGS','DESIRED_MONTHLY_AMOUNT','LTE','3000000','HARD','HARD_ELIGIBILITY',TRUE,'가입금액 1만원 이상 300만원 이하','상품설명서 가입금액',1,'가입금액','2026-07-31',NULL,'월 최대 납입액',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_star_desc_id,'KB-STAR-TIME-DEPOSIT','DESIRED_AMOUNT','GTE','1000000','HARD','HARD_ELIGIBILITY',TRUE,'가입금액 100만원 이상','공식 상품정보 가입금액',NULL,'가입금액',NULL,NULL,'최소 예치금액',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6));

-- Access evidence. Product channel candidates intentionally omit foreigner support,
-- so online remains UNKNOWN except where separately and explicitly proven.
INSERT INTO rule_candidate (source_document_id,product_code,rule_key,operator,rule_value,rule_level,rule_nature,mandatory,source_excerpt,source_locator,page_number,section_name,valid_from,valid_to,description,confidence,review_status,last_verified_at,reviewed_by,created_at,updated_at) VALUES
(@shinhan_desc_id,'SHINHAN-LIVELIHOOD-ACCOUNT','FOREIGNER_IDENTITY_METHOD','EXISTS','true','UNKNOWN','IDENTIFICATION_METHOD',FALSE,'외국인의 실명확인증표: 외국인등록증, 국내거소신고증, 영주증','상품설명서 p.1 가입대상',1,'가입대상','2026-02-02','2027-02-02','외국인 신분확인 방법',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@shinhan_desc_id,'SHINHAN-LIVELIHOOD-ACCOUNT','BRANCH_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입방법: 영업점','상품설명서 p.1 가입방법',1,'가입방법','2026-02-02','2027-02-02','BRANCH AVAILABLE',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@shinhan_desc_id,'SHINHAN-LIVELIHOOD-ACCOUNT','PRODUCT_MOBILE_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입방법: 신한SOL뱅크','상품설명서 p.1 가입방법',1,'가입방법','2026-02-02','2027-02-02','상품 수준 MOBILE APP AVAILABLE; 외국인 이용 가능 여부 UNKNOWN',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@shinhan_desc_id,'SHINHAN-LIVELIHOOD-ACCOUNT','RESIDENCE_CARD_DOCUMENT','EXISTS','true','UNKNOWN','REQUIRED_DOCUMENT',FALSE,'외국인등록증, 국내거소신고증, 영주증','상품설명서 p.1 가입대상',1,'가입대상','2026-02-02','2027-02-02','공식 신분확인증표',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_life_page_id,'KB-LIVELIHOOD-ACCOUNT','FOREIGNER_IDENTITY_METHOD','EXISTS','true','UNKNOWN','IDENTIFICATION_METHOD',FALSE,'실명확인증표 제출한 외국인 가입 가능: 외국인등록증, 국내거소신고증, 영주증','신상품 안내 가입대상',NULL,'가입 대상','2026-02-02','2027-12-31','외국인 신분확인 방법',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_life_page_id,'KB-LIVELIHOOD-ACCOUNT','BRANCH_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입: 지점','신상품 안내 거래방법',NULL,'거래 방법','2026-02-02','2027-12-31','BRANCH AVAILABLE',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_life_page_id,'KB-LIVELIHOOD-ACCOUNT','PRODUCT_MOBILE_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입: KB스타뱅킹','신상품 안내 거래방법',NULL,'거래 방법','2026-02-02','2027-12-31','상품 수준 MOBILE APP AVAILABLE; 외국인 이용 가능 여부 UNKNOWN',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_life_page_id,'KB-LIVELIHOOD-ACCOUNT','RESIDENCE_CARD_DOCUMENT','EXISTS','true','UNKNOWN','REQUIRED_DOCUMENT',FALSE,'외국인등록증, 국내거소신고증, 영주증','신상품 안내 가입대상',NULL,'가입 대상','2026-02-02','2027-12-31','공식 신분확인증표',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_cdd_id,'KB-MY-SAVINGS','FOREIGNER_IDENTITY_METHOD','EXISTS','true','UNKNOWN','IDENTIFICATION_METHOD',FALSE,'외국인 개인 고객의 실명확인증표를 확인','고객확인의무 개인 고객 안내',NULL,'외국인 개인 고객',NULL,NULL,'상품 가입 가능이 아닌 공통 신분확인 방법',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_my_page_id,'KB-MY-SAVINGS','BRANCH_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입방법: 영업점','상품정보 가입방법',NULL,'가입방법',NULL,NULL,'BRANCH AVAILABLE',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_my_page_id,'KB-MY-SAVINGS','PRODUCT_MOBILE_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'가입방법: KB스타뱅킹','상품정보 가입방법',NULL,'가입방법',NULL,NULL,'상품 수준 MOBILE APP AVAILABLE; 외국인 이용 가능 여부 UNKNOWN',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_cdd_id,'KB-MY-SAVINGS','FOREIGNER_ID_DOCUMENT','EXISTS','true','UNKNOWN','REQUIRED_DOCUMENT',FALSE,'외국인 개인 고객의 실명확인증표 및 거래목적별 추가서류','고객확인의무 개인 고객 안내',NULL,'필요서류',NULL,NULL,'은행이 추가서류를 요청할 수 있음',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_identity_id,'HANA-SALARY-COMPOUND-SAVINGS','FOREIGNER_IDENTITY_METHOD','EXISTS','true','UNKNOWN','IDENTIFICATION_METHOD',FALSE,'여권, 외국인등록증 등 공식 실명확인증표','외국인 고객 실명확인 안내',NULL,'실명확인증표','2025-12-18',NULL,'상품 가입 가능이 아닌 공통 신분확인 방법',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_salary_page_id,'HANA-SALARY-COMPOUND-SAVINGS','BRANCH_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'신규: 영업점','공식 상품페이지 거래방법',NULL,'거래방법','2026-07-31',NULL,'BRANCH AVAILABLE',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_salary_page_id,'HANA-SALARY-COMPOUND-SAVINGS','PRODUCT_ONLINE_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'신규: 인터넷뱅킹, 스마트폰뱅킹','공식 상품페이지 거래방법',NULL,'거래방법','2026-07-31',NULL,'상품 수준 ONLINE AVAILABLE; 외국인 이용 가능 여부 UNKNOWN',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@hana_identity_id,'HANA-SALARY-COMPOUND-SAVINGS','FOREIGNER_ID_DOCUMENT','EXISTS','true','UNKNOWN','REQUIRED_DOCUMENT',FALSE,'여권 또는 외국인등록증 등 공식 실명확인증표','외국인 고객 실명확인 안내',NULL,'실명확인증표','2025-12-18',NULL,'공식 신분확인증표',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_cdd_id,'KB-STAR-TIME-DEPOSIT','FOREIGNER_IDENTITY_METHOD','EXISTS','true','UNKNOWN','IDENTIFICATION_METHOD',FALSE,'외국인 개인 고객의 실명확인증표를 확인','고객확인의무 개인 고객 안내',NULL,'외국인 개인 고객',NULL,NULL,'상품 가입 가능이 아닌 공통 신분확인 방법',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_star_page_id,'KB-STAR-TIME-DEPOSIT','PRODUCT_ONLINE_CHANNEL','EXISTS','true','UNKNOWN','CHANNEL_REQUIREMENT',FALSE,'인터넷뱅킹, KB스타뱅킹을 통한 신규','공식 상품페이지 가입방법',NULL,'가입방법',NULL,NULL,'상품 수준 ONLINE AVAILABLE; 외국인 이용 가능 여부 UNKNOWN',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@kb_cdd_id,'KB-STAR-TIME-DEPOSIT','FOREIGNER_ID_DOCUMENT','EXISTS','true','UNKNOWN','REQUIRED_DOCUMENT',FALSE,'외국인 개인 고객의 실명확인증표 및 거래목적별 추가서류','고객확인의무 개인 고객 안내',NULL,'필요서류',NULL,NULL,'은행이 추가서류를 요청할 수 있음',1.0000,'APPROVED',CURRENT_TIMESTAMP(6),@reviewer,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6));

INSERT INTO product_rule (rule_candidate_id,product_id,source_document_id,rule_key,operator,rule_value,rule_level,rule_nature,mandatory,source_excerpt,source_locator,page_number,section_name,valid_from,valid_to,review_status,description,active,verified_at,reviewed_by,created_at,updated_at)
SELECT rc.id,fp.id,rc.source_document_id,rc.rule_key,rc.operator,rc.rule_value,rc.rule_level,rc.rule_nature,rc.mandatory,rc.source_excerpt,rc.source_locator,rc.page_number,rc.section_name,rc.valid_from,rc.valid_to,rc.review_status,rc.description,TRUE,rc.last_verified_at,rc.reviewed_by,rc.created_at,rc.updated_at
FROM rule_candidate rc JOIN financial_product fp ON fp.product_code=rc.product_code
WHERE rc.product_code IN('SHINHAN-LIVELIHOOD-ACCOUNT','KB-LIVELIHOOD-ACCOUNT','KB-MY-SAVINGS','HANA-SALARY-COMPOUND-SAVINGS','KB-STAR-TIME-DEPOSIT') AND rc.rule_nature='HARD_ELIGIBILITY';

INSERT INTO rule_change_history (rule_candidate_id,action,reviewer,before_status,after_operator,after_value,after_level,after_status,reviewed_at)
SELECT id,'APPROVE',@reviewer,'PENDING',operator,rule_value,rule_level,'APPROVED',last_verified_at FROM rule_candidate
WHERE product_code IN('SHINHAN-LIVELIHOOD-ACCOUNT','KB-LIVELIHOOD-ACCOUNT','KB-MY-SAVINGS','HANA-SALARY-COMPOUND-SAVINGS','KB-STAR-TIME-DEPOSIT');

INSERT INTO product_application_step (product_id,source_document_id,step_order,title,description,channel,source_locator,valid_from,valid_to,active,created_at,updated_at) VALUES
(@p_shinhan,@shinhan_desc_id,1,'신분증과 중복계좌 여부 확인','공식 가입대상과 사용할 실명확인증표를 확인합니다.','영업점 또는 신한SOL뱅크','상품설명서 가입대상·가입방법','2026-02-02','2027-02-02',TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@p_kblife,@kb_life_page_id,1,'신분증과 중복계좌 여부 확인','공식 가입대상과 사용할 실명확인증표를 확인합니다.','지점 또는 KB스타뱅킹','신상품 안내 가입대상·거래방법','2026-02-02','2027-12-31',TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@p_kbmy,@kb_my_page_id,1,'납입액과 가입채널 확인','월 납입 희망액과 영업점 또는 앱 채널을 확인합니다.','KB스타뱅킹 또는 영업점','상품정보 저축금액·가입방법',NULL,NULL,TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@p_hanasalary,@hana_salary_page_id,1,'계좌 보유와 납입액 확인','동일 상품 계좌 보유 여부와 월 납입 희망액을 확인합니다.','영업점·인터넷·스마트폰','상품페이지 가입대상·가입금액','2026-07-31',NULL,TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)),
(@p_kbstar,@kb_star_page_id,1,'예치액과 온라인 채널 확인','예치 희망액을 확인하고 외국인 온라인 신규 가능 여부는 은행에 문의합니다.','인터넷뱅킹 또는 KB스타뱅킹','상품페이지 가입금액·가입방법',NULL,NULL,TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6));

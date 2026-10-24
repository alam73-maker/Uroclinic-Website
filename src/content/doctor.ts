import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;
interface Item { title: L; detail?: L; years?: string }
interface Section { id: string; heading: L; items: Item[] }

export const profile = {
  name: { ar: 'أ.د. طارق عثمان', en: 'Prof. Dr. Tarek Osman' } as L,
  role: { ar: 'أستاذ ورئيس قسم جراحة المسالك البولية، كلية الطب، جامعة عين شمس', en: 'Professor and Head of the Urology Department, Faculty of Medicine, Ain Shams University' } as L,
  bio: {
    ar: 'أ.د. طارق عثمان أستاذ ورئيس قسم جراحة المسالك البولية بكلية الطب جامعة عين شمس، ويرأس وحدة أورام المسالك البولية والتناسلية بالقسم منذ عام 2017. يشغل منصب رئيس قسم الأورام بالجمعية المصرية لجراحة المسالك البولية، وهو جرّاح معتمد في جراحات المسالك البولية والأورام بالروبوت. يعمل في مجال المسالك البولية منذ تخرّجه في جامعة عين شمس عام 1990، وتلقّى تدريبًا متخصصًا في المملكة المتحدة والولايات المتحدة وفرنسا.',
    en: 'Prof. Dr. Tarek Osman is Professor and Head of the Urology Department at Ain Shams University’s Faculty of Medicine, where he has chaired the Genitourinary (GU) Oncology Unit since 2017. He is President of the Uro-Oncology Section of the Egyptian Urologic Association and a certified robotic urology and uro-oncology surgeon. He has worked in urology since graduating from Ain Shams University in 1990, with specialist training in the United Kingdom, the United States and France.',
  } as L,
  facts: [
    { value: '1990', label: { ar: 'تخرّج في طب عين شمس', en: 'Graduated in medicine, Ain Shams' } },
    { value: '2012', label: { ar: 'أستاذ المسالك البولية منذ', en: 'Professor of Urology since' } },
    { value: '24', label: { ar: 'بحثًا منشورًا في مجلات علمية', en: 'Peer-reviewed publications' } },
    { value: '5', label: { ar: 'مستشفيات يعمل بها استشاريًا', en: 'Hospitals as consultant' } },
  ],
};

export const sections: Section[] = [
  {
    id: 'positions',
    heading: { ar: 'المناصب الحالية', en: 'Current positions' },
    items: [
      { title: { ar: 'أستاذ ورئيس قسم جراحة المسالك البولية', en: 'Professor and Head, Urology Department' }, detail: { ar: 'جامعة عين شمس', en: 'Ain Shams University' }, years: '2024 –' },
      { title: { ar: 'رئيس وحدة أورام المسالك البولية والتناسلية', en: 'Chairman, GU Oncology Unit' }, detail: { ar: 'قسم المسالك البولية، جامعة عين شمس', en: 'Urology Department, Ain Shams University' }, years: '2017 –' },
      { title: { ar: 'أستاذ جراحة المسالك البولية', en: 'Professor of Urology' }, detail: { ar: 'كلية الطب، جامعة عين شمس', en: 'Faculty of Medicine, Ain Shams University' }, years: '2012 –' },
      { title: { ar: 'رئيس قسم الأورام', en: 'President, Uro-Oncology Section' }, detail: { ar: 'الجمعية المصرية لجراحة المسالك البولية', en: 'Egyptian Urologic Association' } },
      { title: { ar: 'رئيس المؤتمر الدولي لأورام الجهاز الهضمي والكبد والمسالك البولية (IGILUC)', en: 'President, IGILUC' }, detail: { ar: '', en: 'International Gastrointestinal, Liver & Uro-Oncology Congress' } },
    ],
  },
  {
    id: 'hospitals',
    heading: { ar: 'استشاري المسالك البولية في', en: 'Consultant urologist at' },
    items: [
      { title: { ar: 'مستشفيات جامعة عين شمس', en: 'Ain Shams University Hospitals' } },
      { title: { ar: 'مستشفى كليوباترا', en: 'Cleopatra Hospital' } },
      { title: { ar: 'مستشفى السلام الدولي', en: 'Alsalam International Hospital' } },
      { title: { ar: 'المستشفى السعودي الألماني', en: 'Saudi German Hospital' } },
      { title: { ar: 'مستشفى دار الشفاء', en: 'Dar El Shifa Hospital' } },
    ],
  },
  {
    id: 'interests',
    heading: { ar: 'مجالات الاهتمام', en: 'Clinical interests' },
    items: [
      { title: { ar: 'أورام المسالك البولية', en: 'Uro-oncology' }, detail: { ar: 'أورام البروستاتا والمثانة والكلى', en: 'Prostate, bladder and kidney cancer' } },
      { title: { ar: 'الجراحة بالروبوت والمنظار', en: 'Robotic and laparoscopic surgery' } },
      { title: { ar: 'اضطرابات التبول ومسالك السيدات', en: 'Voiding dysfunction and female urology' } },
      { title: { ar: 'جراحات إعادة بناء المسالك البولية', en: 'Reconstructive urology' } },
    ],
  },
  {
    id: 'qualifications',
    heading: { ar: 'المؤهلات العلمية', en: 'Qualifications' },
    items: [
      { title: { ar: 'دكتوراه جراحة المسالك البولية (M.D.)', en: 'Doctorate in Urology (M.D.)' }, detail: { ar: 'جامعة عين شمس · رسالة: تعليق عنق المثانة بطريقة بيرش بالمنظار لعلاج سلس البول الإجهادي عند السيدات', en: 'Ain Shams University · Thesis: laparoscopic Burch bladder neck suspension for female stress urinary incontinence' }, years: '2001' },
      { title: { ar: 'ماجستير جراحة المسالك البولية (M.Sc.)', en: 'Master’s in Urology (M.Sc.)' }, detail: { ar: 'جامعة عين شمس · رسالة: تطبيقات الليزر في المسالك البولية', en: 'Ain Shams University · Thesis: laser applications in urology' }, years: '1995' },
      { title: { ar: 'بكالوريوس الطب والجراحة (M.B.B.Ch.)', en: 'Bachelor of Medicine and Surgery (M.B.B.Ch.)' }, detail: { ar: 'جامعة عين شمس', en: 'Ain Shams University' }, years: '1990' },
    ],
  },
  {
    id: 'training',
    heading: { ar: 'التدريب المتخصص', en: 'Specialist training' },
    items: [
      { title: { ar: 'جرّاح معتمد في المسالك البولية والأورام بالروبوت', en: 'Certified robotic urology and uro-oncology surgeon' }, detail: { ar: 'CMR', en: 'CMR' } },
      { title: { ar: 'اضطرابات التبول', en: 'Voiding dysfunction' }, detail: { ar: 'مستشفى أدنبروك، كامبريدج، المملكة المتحدة', en: 'Addenbrooke’s Hospital, Cambridge, UK' } },
      { title: { ar: 'جراحة المسالك البولية بالمنظار', en: 'Laparoscopic urology' }, detail: { ar: 'جامعة واشنطن، الولايات المتحدة', en: 'Washington University, USA' } },
      { title: { ar: 'مسالك بولية السيدات', en: 'Female urology' }, detail: { ar: 'جامعة نيم، فرنسا', en: 'Nîmes University, France' } },
    ],
  },
  {
    id: 'memberships',
    heading: { ar: 'عضوية الجمعيات العلمية', en: 'Professional memberships' },
    items: [
      { title: { ar: 'الجمعية الأمريكية لجراحة المسالك البولية (AUA)', en: 'American Urological Association (AUA)' } },
      { title: { ar: 'الجمعية الأوروبية لجراحة المسالك البولية (EAU)', en: 'European Association of Urology (EAU)' } },
      { title: { ar: 'الجمعية الدولية لسلس البول (ICS)', en: 'International Continence Society (ICS)' } },
      { title: { ar: 'الجمعية المصرية لجراحة المسالك البولية (EUA)', en: 'Egyptian Urologic Association (EUA)' } },
    ],
  },
  {
    id: 'academic',
    heading: { ar: 'النشاط العلمي والأكاديمي', en: 'Academic and scientific roles' },
    items: [
      { title: { ar: 'محاضرات في المؤتمرات الدولية للمسالك البولية', en: 'Lectures at international urology meetings' }, detail: { ar: 'AUA و EAU و SIU و ICS', en: 'AUA, EAU, SIU and ICS' } },
      { title: { ar: 'محكّم في عدد من المجلات العلمية الدولية', en: 'Reviewer for international peer-reviewed journals' } },
      { title: { ar: 'رئيس اللجنة العلمية بقسم المسالك البولية، جامعة عين شمس', en: 'Chairman, Scientific Committee, Ain Shams Urology Department' }, years: '2010 –' },
      { title: { ar: 'سكرتير مؤتمر عين شمس السنوي للمسالك البولية', en: 'Secretary, annual Ain Shams Urology Conference' }, years: '2002 –' },
      { title: { ar: 'عضو لجنة أخلاقيات البحث العلمي، جامعة عين شمس', en: 'Member, Research Ethics Committee, Ain Shams University' }, years: '2020 –' },
      { title: { ar: 'سكرتير سابق لقسم المناظير بالجمعية المصرية لجراحة المسالك البولية', en: 'Past Secretary, Laparoscopy Section, Egyptian Urologic Association' } },
      { title: { ar: 'مدرّب في برنامج تنمية قدرات أعضاء هيئة التدريس (FLDPP)', en: 'Trainer, Faculty and Leadership Development Program (FLDPP)' }, detail: { ar: 'مناهج البحث الطبي وكتابة الأبحاث', en: 'Medical research methods and scientific writing' }, years: '2007 – 2010' },
    ],
  },
  {
    id: 'community',
    heading: { ar: 'العمل الخيري والمجتمعي', en: 'Charity and community work' },
    items: [
      { title: { ar: 'استشاري ورئيس مركز تفتيت الحصوات الخيري', en: 'Consultant and Head, charity shock-wave lithotripsy centre' }, detail: { ar: 'مركز المصطفى الطبي', en: 'Al-Mostafa Medical Center' }, years: '2014 –' },
      { title: { ar: 'قائد حملة جامعة عين شمس الصحية إلى حلايب وشلاتين', en: 'Leader, Ain Shams University health campaign to Halayeb and Shalateen' }, years: '2020' },
      { title: { ar: 'قائد فريق جراحات الناسور في دارفور، السودان', en: 'Leader, fistula surgery campaign in Darfur, Sudan' }, detail: { ar: 'برعاية نقابة الأطباء المصرية', en: 'Sponsored by the Egyptian Medical Syndicate' }, years: '2011' },
      { title: { ar: 'عضو فريق المسالك البولية لتحسين الرعاية الصحية في السودان', en: 'Urology team member, healthcare improvement mission to Sudan' }, detail: { ar: 'برعاية اتحاد الأطباء العرب', en: 'Sponsored by the Arab Doctors Union' }, years: '2009' },
      { title: { ar: 'رئيس الجمعية الخيرية لحضانات الأطفال والغسيل الكلوي', en: 'Head, charity society for neonatal intensive care and haemodialysis' }, detail: { ar: 'سنورس، الفيوم', en: 'Sennoris, Fayoum' } },
    ],
  },
];

export interface Publication { title: string; journal: string; year: number; url?: string }

export const publications: Publication[] = [
  { title: 'Oncologic outcomes of radical cystectomy versus trimodal therapy in management of localized muscle-invasive urothelial bladder cancer: a prospective randomized clinical trial', journal: 'Arab Journal of Urology', year: 2026, url: 'https://doi.org/10.1080/20905998.2026.2668979' },
  { title: 'High-risk biochemical recurrence in prostate cancer: identification and early intervention strategies', journal: 'Frontiers in Urology', year: 2026 },
  { title: 'Double versus standard dose of tamsulosin with solifenacin for management of ureteral stent-related symptoms', journal: 'Arab Journal of Urology', year: 2026 },
  { title: 'Evaluation of tamsulosin 0.4 mg versus 0.8 mg in management of lower urinary tract symptoms due to benign prostatic enlargement', journal: 'International Urology and Nephrology', year: 2024 },
  { title: 'Comparison between mini-percutaneous nephrolithotomy and standard percutaneous nephrolithotomy in management of large renal stones: a randomized, controlled clinical trial', journal: 'Journal of Endourology', year: 2023 },
  { title: 'Clinical and urodynamic findings before and after surgical repair of pelvic organ prolapse in women with lower urinary tract symptoms: a prospective observational study', journal: 'Urology', year: 2022 },
  { title: 'Intravesical aminophylline instillation as an alternative for balloon dilation prior to semi-rigid ureteroscopic management of distal ureteral stones', journal: 'World Journal of Urology', year: 2022 },
  { title: 'Short course of dutasteride in treatment of refractory category IIIB chronic prostatitis: a placebo-controlled study', journal: 'Prostate International', year: 2022 },
  { title: 'Clinical recommendations in the management of advanced prostate cancer: IGILUC 2019 experts', journal: 'World Journal of Urology', year: 2021 },
  { title: 'Rezum: a novel minimally invasive treatment for lower urinary tract symptoms secondary to benign prostatic hyperplasia. A review article', journal: 'International Urology and Nephrology', year: 2021 },
  { title: 'Risk factors for the development of flank hernias and bulges following surgical flank approaches to the kidney in adults', journal: 'Arab Journal of Urology', year: 2018 },
  { title: 'Evaluation of the risk factors associated with the development of post-transurethral resection of the prostate persistent bacteriuria', journal: 'Arab Journal of Urology', year: 2017 },
  { title: 'Ureterocalicostomy for the treatment of complex cases of ureteropelvic junction obstruction in adults', journal: 'Urology', year: 2011 },
  { title: 'Extracorporeal shock wave lithotripsy of lower ureteric stones: outcome and criteria for success', journal: 'Arab Journal of Urology', year: 2011 },
  { title: 'Insertion of double J stent as a therapeutic test in management of adults presenting with loin pain and equivocal ureteropelvic junction obstruction', journal: 'World Journal of Urology', year: 2010 },
  { title: 'One-stage repair of long bulbar urethral strictures using augmented Russell dorsal strip anastomosis: outcome of 234 cases', journal: 'European Urology', year: 2008 },
  { title: 'Adjuvant chemoradiation with gemcitabine/cisplatin versus adjuvant chemotherapy in high-risk patients with transitional cell carcinoma of the urinary bladder', journal: 'The Medical Journal of Cairo University', year: 2008 },
  { title: 'Treatment of type III stress incontinence by tension-free tapes: the transvaginal ascending versus the suprapubic descending approach', journal: 'Arab Journal of Urology', year: 2006 },
  { title: 'Long-term evaluation of the outlet after orthotopic urinary diversion: 15 years’ experience', journal: 'Egyptian Journal of Urology', year: 2006 },
  { title: 'High-energy extracorporeal shock wave lithotripsy for impacted large upper ureteric stones under sedoanalgesia and diuretic', journal: 'Arab Journal of Urology', year: 2005 },
  { title: 'Laparoscopic versus open retroperitoneal bilateral varix ligation for obese patients presenting with primary subfertility: a randomized comparative study', journal: 'African Journal of Urology', year: 2004 },
  { title: 'Congenital penile curvature with orthotopic meatus: a report on the management of 62 cases following a systematic approach', journal: 'African Journal of Urology', year: 2003 },
  { title: 'Stress incontinence surgery for patients presenting with mixed incontinence and a normal cystometrogram', journal: 'BJU International', year: 2003 },
  { title: 'Dynamic three-dimensional spiral computed tomographic cystourethrography: a novel technique for evaluating post-traumatic posterior urethral defects', journal: 'BJU International', year: 2003 },
];

export const meetings: { date: string; title: string }[] = [
  { date: '2026-04', title: 'Egyptian Bladder Cancer Group Meeting' },
  { date: '2026-01', title: 'IGILUC 12th Congress (Uro-Onco 9)' },
  { date: '2025-12', title: 'Uro-Oncology Section Meeting, EUA 2025' },
  { date: '2025-09', title: 'Update Your GU Cancer Knowledge (Uro-Onco 8)' },
  { date: '2025-05', title: 'Bladder Cancer Day, Alexandria (Uro-Onco 7)' },
  { date: '2025-01', title: 'Military Hospital Oncology Day' },
  { date: '2024-11', title: 'Prostate Cancer Day, Cairo (Uro-Onco 6)' },
  { date: '2024-11', title: 'Uro-Oncology Section Meeting, EUA 2024' },
  { date: '2024-10', title: 'EMEAC GU Scientific Symposium, Cairo' },
  { date: '2024-10', title: 'Urinary Diversion Course' },
  { date: '2024-09', title: 'EUA Zone Meeting: Kidney Cancer Update Symposium, Cairo' },
  { date: '2024-08', title: 'LUA Oncology Section Meeting' },
  { date: '2024-05', title: 'MIBC: To Preserve or Not to Preserve (Uro-Onco 5)' },
  { date: '2024-04', title: 'Genito-Urinary Pathology Course' },
  { date: '2024-04', title: 'Bladder Cancer Day, Tanta (Uro-Onco 4)' },
  { date: '2024-02', title: 'Uro-Oncology Workshop, Mansoura (Uro-Onco 3)' },
  { date: '2023-11', title: 'Assiut International Urologic Oncology Meeting' },
  { date: '2023-10', title: 'EUA Meeting, Uro-Oncology Section' },
  { date: '2023-09', title: 'Presidential Initiative for Prostate Cancer Screening' },
  { date: '2023-09', title: 'Prostate Cancer Day, Ain Shams (Uro-Onco 2)' },
  { date: '2023-06', title: 'Integrated Uro-Oncology Workshop, Ain Shams (Uro-Onco 1)' },
  { date: '2023-03', title: 'Uro-Oncology MDT Webinar' },
];

export const topicExpertise: Record<string, L> = {
  'prostate-health': {
    ar: 'تشمل أبحاث أ.د. طارق عثمان المنشورة دراسات حول علاج أعراض تضخم البروستاتا الحميد، منها تقنية ريزوم وجرعات التامسولوسين، وحول التهاب البروستاتا المزمن.',
    en: 'Prof. Tarek Osman’s published research includes studies on treating symptoms of benign prostatic enlargement, including Rezum and tamsulosin dosing, and on chronic prostatitis.',
  },
  'urological-cancer': {
    ar: 'يرأس أ.د. طارق عثمان وحدة أورام المسالك البولية والتناسلية بجامعة عين شمس، وقسم الأورام بالجمعية المصرية لجراحة المسالك البولية. تتناول أبحاثه سرطان البروستاتا المتقدم وسرطان المثانة الغازي للعضلات.',
    en: 'Prof. Tarek Osman chairs the GU Oncology Unit at Ain Shams University and is President of the Uro-Oncology Section of the Egyptian Urologic Association. His research covers advanced prostate cancer and muscle-invasive bladder cancer.',
  },
  'kidney-urinary-care': {
    ar: 'تتناول أبحاث أ.د. طارق عثمان علاج حصوات الكلى والحالب، ومنها التفتيت بالموجات التصادمية ومنظار الكلى المصغّر ومنظار الحالب، وعلاج انسداد الوصلة الحوضية الحالبية. ويرأس مركزًا خيريًا لتفتيت الحصوات.',
    en: 'Prof. Tarek Osman’s research covers kidney and ureteric stone treatment, including shock-wave lithotripsy, mini-PCNL and ureteroscopy, and ureteropelvic junction obstruction. He also heads a charity shock-wave lithotripsy centre.',
  },
  'second-opinion': {
    ar: 'بصفته رئيس قسم المسالك البولية بجامعة عين شمس ومحكّمًا في مجلات علمية دولية، يمكن لأ.د. طارق عثمان مراجعة تشخيصك أو خطة علاجك الحالية معك.',
    en: 'As Head of Urology at Ain Shams University and a reviewer for international journals, Prof. Tarek Osman can review an existing diagnosis or treatment plan with you.',
  },
};

export const physicianJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: 'Prof. Dr. Tarek Osman',
  alternateName: 'أ.د. طارق عثمان',
  url: 'https://www.osmanuroclinic.com/en/about/',
  image: 'https://www.osmanuroclinic.com/photos/doctor.jpg',
  medicalSpecialty: 'Urologic',
  jobTitle: 'Professor and Head of the Urology Department',
  affiliation: { '@type': 'CollegeOrUniversity', name: 'Ain Shams University' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Ain Shams University' },
  memberOf: ['American Urological Association', 'European Association of Urology', 'International Continence Society', 'Egyptian Urologic Association'].map((name) => ({ '@type': 'Organization', name })),
});

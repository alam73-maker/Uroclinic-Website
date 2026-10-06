import type { Lang } from '../i18n/ui';

export interface PageText { title: string; lead: string; body: string }
export interface ContentPage { slug: string; closing: boolean; legal?: boolean; ar: PageText; en: PageText }

export const topics = [
  { slug: 'prostate-health', ar: ['صحة البروستاتا', 'أسئلة عن البروستاتا والاستعداد لاستشارتك.'], en: ['Prostate health', 'Questions about the prostate and your consultation.'] },
  { slug: 'urological-cancer', ar: ['أورام المسالك البولية', 'الاستعداد لمناقشة تشخيص أو تقارير سابقة.'], en: ['Urological cancer', 'Preparing to discuss a diagnosis or existing reports.'] },
  { slug: 'kidney-urinary-care', ar: ['الكلى والمسالك البولية', 'معلومات الموعد لمشكلات الكلى والمسالك البولية.'], en: ['Kidney & urinary concerns', 'Appointment information for kidney and urinary concerns.'] },
  { slug: 'second-opinion', ar: ['الرأي الثاني', 'فرصة لمناقشة تقييمك الحالي مع الطبيب.'], en: ['Second opinions', 'An opportunity to discuss your existing assessment.'] },
] as const;

const topicBody: Record<Lang, string> = {
  ar: '<h2>الاستعداد للاستشارة</h2><p>اكتب أسئلتك واسأل العيادة عن التقارير التي يجب إحضارها. تأكد أن الموعد مناسب لحالتك قبل السفر.</p><h2>ناقش حالتك الفردية</h2><p>هذه الصفحة لا تقدم تشخيصًا ولا تعد بعلاج معين. المعلومات الطبية التفصيلية تحتاج إلى مراجعة الطبيب قبل نشرها.</p><h2>حافظ على خصوصية معلوماتك الطبية</h2><p>حجز الموعد لا يتطلب تشخيصك أو نتائج تحاليلك أو أي مستندات هوية. اسأل العيادة عن الطريقة المعتمدة لمشاركة التقارير.</p>',
  en: '<h2>Preparing for a consultation</h2><p>Write down your questions and ask the clinic which existing reports to bring. Confirm the appointment is appropriate for your concern before travelling.</p><h2>Discuss your individual circumstances</h2><p>This page does not establish a diagnosis or promise a particular treatment. Detailed clinical information requires the doctor’s review before publication.</p><h2>Keep your medical information private</h2><p>Booking does not need your diagnosis, test results or identity documents. Ask the clinic for its approved way to share records.</p>',
};

export const pages: ContentPage[] = [
  {
    slug: 'about',
    closing: true,
    ar: { title: 'د. طارق عثمان', lead: 'استشارات المسالك البولية.', body: '<h2>ملف مهني موثّق</h2><p>لم تُقدَّم بعد السيرة الذاتية المعتمدة للطبيب ومؤهلاته وبيانات تسجيله ومناصبه الحالية. ستُضاف بعد التحقق منها.</p><h2>قبل استشارتك</h2><p>جهّز الأسئلة التي تريد مناقشتها، واسأل الاستقبال عن التقارير التي يجب إحضارها. لا ترفع أو ترسل سجلات طبية عبر هذا الموقع.</p>' },
    en: { title: 'Dr. Tarek Osman', lead: 'Urology consultation information.', body: '<h2>A verified professional profile</h2><p>The doctor’s approved biography, qualifications, registration details and current clinical appointments have not yet been supplied. They will be added after verification.</p><h2>Before your consultation</h2><p>Prepare the questions you want to discuss and ask reception which existing reports to bring. Do not upload or send medical records through this website.</p>' },
  },
  {
    slug: 'international-patients',
    closing: true,
    ar: { title: 'خطّط للزيارة، ثم للرحلة.', lead: 'احصل على تأكيد العيادة قبل أي ترتيبات سفر.', body: '<h2>أكّد التفاصيل العملية</h2><ul><li>الموعد المتاح وعنوان الفرع.</li><li>رسوم الاستشارة وطرق الدفع وقواعد الإلغاء.</li><li>أي احتياجات لغوية أو احتياجات وصول خاصة.</li><li>الطريقة المعتمدة لمشاركة أي تقارير سابقة.</li></ul><h2>السفر والإقامة</h2><p>هذا الموقع لا يرتب السفر أو التأشيرات أو الإقامة أو باقات العلاج. اسأل العيادة عن المساعدة المتاحة، إن وُجدت، قبل الالتزام بأي ترتيبات.</p>' },
    en: { title: 'Plan the visit. Then plan the journey.', lead: 'Get confirmation from the clinic before making travel arrangements.', body: '<h2>Confirm the practical details</h2><ul><li>Appointment availability and the clinic address.</li><li>Consultation fees, payment options and cancellation rules.</li><li>Language or accessibility requirements.</li><li>The approved way to share any existing reports.</li></ul><h2>Travel and accommodation</h2><p>This website does not arrange travel, visas, accommodation or treatment packages. Ask the clinic what assistance, if any, is available before making commitments.</p>' },
  },
  {
    slug: 'research',
    closing: true,
    ar: { title: 'الأبحاث والمقالات.', lead: 'منشورات موثّقة ومعلومات للمرضى يراجعها الطبيب.', body: '<h2>مكتبة القراءة قيد الإعداد</h2><p>لم يُنسب أي بحث أو انتماء أكاديمي للطبيب دون تحقق. ستتضمن المراجع المعتمدة مصدرها وتاريخ نشرها.</p>' },
    en: { title: 'Research & reading.', lead: 'Verified publications and doctor-reviewed patient information.', body: '<h2>The reading collection is being prepared</h2><p>No publications or academic affiliations have been attributed to the doctor without verification. Approved references will include their source and publication date.</p>' },
  },
  {
    slug: 'videos',
    closing: true,
    ar: { title: 'توعية المرضى.', lead: 'معلومات واضحة تساعدك على تجهيز أسئلتك.', body: '<h2>الفيديوهات قيد الإعداد</h2><p>لا توجد مشغلات فيديو خارجية مضمّنة في هذا الموقع. يجب أن تُراجع الفيديوهات القادمة طبيًا وأن تتضمن ترجمة ونصًا بديلًا.</p>' },
    en: { title: 'Patient education.', lead: 'Clear information to help you prepare your questions.', body: '<h2>Videos are being prepared</h2><p>No third-party video players are embedded on this website. Future videos must be medically reviewed and include captions and a text alternative.</p>' },
  },
  {
    slug: 'patient-stories',
    closing: true,
    ar: { title: 'تجارب المرضى.', lead: 'الخصوصية ودقة المعلومات أولًا.', body: '<h2>لا توجد شهادات منشورة</h2><p>لا يحتوي هذا الموقع على تقييمات أو آراء مرضى أو صور قبل وبعد أو نسب نجاح.</p>' },
    en: { title: 'Patient experiences.', lead: 'Privacy and accurate information come first.', body: '<h2>No testimonials are published</h2><p>This website contains no patient reviews, ratings, before-and-after images or claimed success rates.</p>' },
  },
  {
    slug: 'treatments',
    closing: true,
    ar: { title: 'ابدأ بأسئلتك.', lead: 'تساعدك هذه الصفحات على الاستعداد للاستشارة. هي لا تشخّص حالة ولا توصي بعلاج.', body: '' },
    en: { title: 'Start with your questions.', lead: 'These pages help you prepare for a consultation. They do not diagnose a condition or recommend treatment.', body: '' },
  },
  ...topics.map((t) => ({
    slug: `treatments/${t.slug}`,
    closing: true,
    ar: { title: t.ar[0], lead: t.ar[1], body: topicBody.ar },
    en: { title: t.en[0], lead: t.en[1], body: topicBody.en },
  })),
  {
    slug: 'clinic',
    closing: true,
    ar: { title: 'بيانات العيادة.', lead: 'يجب التحقق من بيانات العيادة قبل فتح الموقع للجمهور.', body: '<dl><dt>الطبيب</dt><dd>د. طارق عثمان</dd><dt>الجهة القانونية والتسجيل</dt><dd>في انتظار تحقق العيادة.</dd><dt>الفروع ومواعيد العمل</dt><dd>تظهر الفروع والمواعيد المتاحة في <a href="/appointments/">صفحة الحجز</a>. العناوين النهائية في انتظار التأكيد.</dd><dt>الهاتف وواتساب</dt><dd>في انتظار التأكيد.</dd><dt>التواصل بخصوص الخصوصية</dt><dd>لم يُحدَّد بعد.</dd></dl>' },
    en: { title: 'Clinic information.', lead: 'Verified business details are required before this website opens to the public.', body: '<dl><dt>Doctor</dt><dd>Dr. Tarek Osman</dd><dt>Legal operator and registration</dt><dd>Awaiting verification by the clinic.</dd><dt>Locations and hours</dt><dd>Locations and available times appear on the <a href="/en/appointments/">booking page</a>. Final addresses are awaiting confirmation.</dd><dt>Telephone and WhatsApp</dt><dd>Awaiting confirmation.</dd><dt>Privacy contact</dt><dd>Not yet supplied.</dd></dl>' },
  },
  {
    slug: 'privacy',
    closing: false,
    legal: true,
    ar: { title: 'سياسة الخصوصية', lead: '', body: '<h2>المسؤول عن البيانات</h2><p>هذا الموقع خاص بعيادة د. طارق عثمان. لم يتم بعد التحقق من الجهة القانونية المشغّلة وعنوانها وجهة التواصل الخاصة بالخصوصية، وسيتم نشرها قبل الإطلاق للجمهور.</p><h2>البيانات التي نجمعها عند الحجز</h2><p>الاسم، رقم الموبايل، الفرع والموعد المختار، نوع الزيارة، وإجابتك الاختيارية عن كيف عرفت عن الطبيب. نسجّل أيضًا مصدر الزيارة التسويقي (مثل اسم الحملة الإعلانية في الرابط) والصفحة التي دخلت منها.</p><h2>لماذا نستخدمها</h2><p>للتواصل معك لتأكيد الموعد وإدارته، ولمعرفة أي القنوات توصل المرضى إلى العيادة. لا نستخدم بياناتك للتسويق دون موافقة منفصلة، ولا نطلب أي معلومات طبية عبر الموقع.</p><h2>أين تُحفظ</h2><p>تُحفظ الحجوزات في قاعدة بيانات مشفّرة لدى مزوّد الخدمة Supabase، ويُستضاف الموقع لدى Vercel. لا يطّلع على الحجوزات إلا موظفو العيادة المصرّح لهم. يجب أن تحدد العيادة مدة الاحتفاظ بالبيانات قبل الإطلاق.</p><h2>ملفات تعريف الارتباط والتتبع</h2><p>لا نستخدم إعلانات أو أدوات تحليل من أطراف خارجية. يحتفظ المتصفح مؤقتًا بمصدر زيارتك أثناء الجلسة فقط لربط الحجز بالقناة التي أوصلتك. راجع <a href="/cookies/">سياسة ملفات تعريف الارتباط</a>.</p><h2>حقوقك</h2><p>يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر جهة التواصل التي ستُنشر قبل الإطلاق.</p><h2>قبل أن تصبح هذه السياسة سارية</h2><p>يجب أن تعتمد العيادة أغراض المعالجة ومدد الاحتفاظ ومزودي الخدمة ومسؤوليات الأمان وجهة التواصل وأي نقل للبيانات خارج مصر، وفق القانون رقم 151 لسنة 2020.</p>' },
    en: { title: 'Privacy policy', lead: '', body: '<h2>Who is responsible</h2><p>This website belongs to Dr. Tarek Osman’s clinic. The legal operator, address and privacy contact have not yet been verified and will be published before public launch.</p><h2>What we collect when you book</h2><p>Your name, mobile number, chosen location and time, type of visit, and your optional answer about how you heard of the doctor. We also record the marketing source of your visit (such as a campaign name in the link) and the page you arrived on.</p><h2>Why we use it</h2><p>To contact you to confirm and manage the appointment, and to understand which channels bring patients to the clinic. We do not use your details for marketing without separate consent, and we never ask for medical information on this website.</p><h2>Where it is stored</h2><p>Bookings are stored in an encrypted database with our provider Supabase, and the website is hosted by Vercel. Only authorised clinic staff can see bookings. The clinic must set retention periods before launch.</p><h2>Cookies and tracking</h2><p>No third-party advertising or analytics tools are used. Your browser keeps the source of your visit for the current session only, to link a booking to the channel that brought you. See the <a href="/en/cookies/">cookie policy</a>.</p><h2>Your rights</h2><p>You can ask to access, correct or delete your details through the privacy contact that will be published before launch.</p><h2>Before this policy takes effect</h2><p>The clinic must approve its purposes, retention periods, service providers, security responsibilities, privacy contact and any transfers outside Egypt, in line with Law 151 of 2020.</p>' },
  },
  {
    slug: 'terms',
    closing: false,
    legal: true,
    ar: { title: 'الشروط والأحكام', lead: '', body: '<h2>حالة الموقع</h2><p>هذه نسخة مراجعة من موقع د. طارق عثمان. يجب التحقق من الجهة المشغّلة وبيانات التواصل قبل الاستخدام العام. راجع <a href="/clinic/">بيانات العيادة</a>.</p><h2>معلومات وليست استشارة طبية</h2><p>محتوى الموقع معلومات عامة للاستعداد للموعد. لا يشخّص حالة ولا يصف علاجًا ولا يضمن نتيجة ولا ينشئ علاقة طبيب ومريض.</p><h2>الحجز</h2><p>اختيار موعد عبر الموقع يحجزه لك مبدئيًا. يصبح الموعد مؤكدًا بعد تواصل العيادة معك. قد تعيد العيادة جدولة الموعد إذا تغيّر جدول الطبيب، وستتواصل معك في هذه الحالة.</p><h2>المدفوعات</h2><p>لا تُقبل أي مدفوعات أو بيانات بطاقات عبر هذا الموقع. راجع <a href="/refunds/">سياسة الإلغاء والاسترداد</a>.</p><h2>الاستخدام المسؤول</h2><p>لا تحجز باسم شخص آخر دون إذنه، ولا تحاول الوصول غير المصرّح به أو تعطيل الخدمة. الموقع ليس خدمة طوارئ.</p>' },
    en: { title: 'Terms & conditions', lead: '', body: '<h2>Website status</h2><p>This is a review version of Dr. Tarek Osman’s website. The operator and contact details must be verified before public use. See <a href="/en/clinic/">clinic information</a>.</p><h2>Information, not medical advice</h2><p>Website content is general information to help you prepare. It does not diagnose, prescribe, guarantee an outcome or create a doctor-patient relationship.</p><h2>Bookings</h2><p>Choosing a time on this website holds it for you. The appointment is confirmed once the clinic contacts you. The clinic may need to reschedule if the doctor’s schedule changes, and will contact you if so.</p><h2>Payments</h2><p>No payments or card details are accepted through this website. See the <a href="/en/refunds/">cancellation and refund policy</a>.</p><h2>Responsible use</h2><p>Do not book on behalf of someone without their permission, attempt unauthorised access or interfere with the service. The website is not an emergency service.</p>' },
  },
  {
    slug: 'cookies',
    closing: false,
    legal: true,
    ar: { title: 'سياسة ملفات تعريف الارتباط', lead: '', body: '<h2>الاستخدام الحالي</h2><p>لا يضع هذا الموقع ملفات تعريف ارتباط إعلانية أو تحليلية. يستخدم تخزين الجلسة في المتصفح فقط لتذكّر مصدر زيارتك (مثل رابط حملة) حتى تكمل الحجز، ويُحذف عند إغلاق المتصفح.</p><h2>لوحة العيادة</h2><p>يستخدم موظفو العيادة جلسة تسجيل دخول آمنة للوصول إلى لوحة الحجوزات. هذا لا يخص زوار الموقع.</p><h2>الخدمات الخارجية</h2><p>لا توجد فيديوهات أو خرائط أو أدوات دردشة مضمّنة. فتح رابط واتساب ينقلك إلى خدمة منفصلة لها سياستها الخاصة.</p><h2>آخر مراجعة</h2><p>6 أكتوبر 2026. يجب إعادة المراجعة قبل إضافة أي أدوات تحليل أو إعلانات.</p>' },
    en: { title: 'Cookie policy', lead: '', body: '<h2>Current use</h2><p>This website sets no advertising or analytics cookies. It uses your browser’s session storage only to remember the source of your visit (such as a campaign link) until you finish booking. It is cleared when you close the browser.</p><h2>Clinic dashboard</h2><p>Clinic staff use a secure sign-in session to access the bookings dashboard. This does not apply to visitors.</p><h2>External services</h2><p>No videos, maps or chat widgets are embedded. Opening a WhatsApp link takes you to a separate service with its own policy.</p><h2>Last reviewed</h2><p>6 October 2026. Review again before adding any analytics or advertising tools.</p>' },
  },
  {
    slug: 'refunds',
    closing: false,
    legal: true,
    ar: { title: 'الإلغاء والاسترداد', lead: '', body: '<h2>لا توجد مدفوعات إلكترونية</h2><p>لا يبيع هذا الموقع خدمات ولا يقبل مدفوعات أو عرابين. حجز موعد لا يترتب عليه أي التزام مالي.</p><h2>تغيير أو إلغاء الموعد</h2><p>تواصل مع العيادة برقم الحجز لتغيير الموعد أو إلغائه، حتى يُتاح الموعد لمريض آخر.</p><h2>الرسوم والاسترداد</h2><p>لم تحدد العيادة بعد قواعد الرسوم والإلغاء والاسترداد المعتمدة. لا نضع هنا أي مهلة أو رسوم إلغاء غير معتمدة.</p>' },
    en: { title: 'Cancellations & refunds', lead: '', body: '<h2>No online payments</h2><p>This website does not sell services or accept payments or deposits. Booking a time creates no payment obligation.</p><h2>Changing or cancelling</h2><p>Contact the clinic with your booking reference to change or cancel, so the time can be offered to another patient.</p><h2>Fees and refunds</h2><p>The clinic has not yet supplied its approved fee, cancellation or refund rules. No deadline or charge is invented here.</p>' },
  },
];

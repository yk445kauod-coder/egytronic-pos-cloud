export type Locale = 'ar' | 'en'

const en = {
  tagline: 'Run your whole business from one fast, bilingual POS',
  sub: 'Sales, inventory, VAT and reports. Cloud-synced across every device and branch.',
  openPos: 'Open the POS', features: 'Everything you need', pricing: 'Simple pricing',
  month: 'EGP / month', cur: 'EGP', note: 'Prices exclude VAT. 14-day free trial.',
  email: 'Email', sendLink: 'Send magic link', checkEmail: 'Check your email for the sign-in link.',
  createBiz: 'Create your business', bizName: 'Business name', create: 'Create',
  search: 'Search items...', cart: 'Order', empty: 'Cart is empty', subtotal: 'Subtotal', vat: 'VAT',
  total: 'Total', discount: 'Discount %', cash: 'Cash', card: 'Card', wallet: 'Wallet',
  dine: 'Dine-in', take: 'Takeaway', del: 'Delivery', paid: 'Payment recorded', error: 'Error',
  signOut: 'Sign out', addItem: 'Add item', nameEn: 'Name (EN)', nameAr: 'Name (AR)', price: 'Price', stock: 'Stock', save: 'Save',
  feats: [
    { t: 'Real-time sync', d: 'Stock updates instantly on every device through Supabase Realtime.' },
    { t: 'Atomic checkout', d: 'One database transaction per sale, so stock can never be oversold.' },
    { t: 'Multi-tenant security', d: 'Postgres Row Level Security isolates every business and role.' },
    { t: 'Arabic first', d: 'Full right-to-left interface with an English switch.' },
    { t: 'VAT built in', d: 'Configurable VAT per business, discounts and payment methods.' },
    { t: 'Any device', d: 'Responsive web app for phones, tablets and desktops.' },
  ],
  plans: [
    { n: 'Starter', p: '299', f: ['1 device', 'Up to 200 items', 'Daily sales report'] },
    { n: 'Business', p: '599', f: ['3 devices', 'Unlimited items', 'Roles and permissions'] },
    { n: 'Pro', p: '1,199', f: ['Unlimited devices', 'Multi-branch', 'Priority support'] },
  ],
}
export type Dict = typeof en

const ar: Dict = {
  tagline: 'أدِر نشاطك كله من نقطة بيع سريعة بالعربي والإنجليزي',
  sub: 'مبيعات ومخزون وضريبة وتقارير. متزامنة سحابياً على كل الأجهزة والفروع.',
  openPos: 'افتح نقطة البيع', features: 'كل ما تحتاجه', pricing: 'أسعار بسيطة',
  month: 'جنيه / شهر', cur: 'ج.م', note: 'الأسعار بدون الضريبة. تجربة مجانية 14 يوم.',
  email: 'البريد الإلكتروني', sendLink: 'أرسل رابط الدخول', checkEmail: 'افتح بريدك واضغط على رابط الدخول.',
  createBiz: 'أنشئ نشاطك', bizName: 'اسم النشاط', create: 'إنشاء',
  search: 'بحث...', cart: 'الطلب', empty: 'السلة فارغة', subtotal: 'المجموع', vat: 'الضريبة',
  total: 'الإجمالي', discount: 'خصم %', cash: 'كاش', card: 'بطاقة', wallet: 'محفظة',
  dine: 'داخل المطعم', take: 'سفري', del: 'توصيل', paid: 'تم تسجيل الدفع', error: 'خطأ',
  signOut: 'خروج', addItem: 'إضافة صنف', nameEn: 'الاسم (EN)', nameAr: 'الاسم (عربي)', price: 'السعر', stock: 'المخزون', save: 'حفظ',
  feats: [
    { t: 'مزامنة لحظية', d: 'المخزون يتحدث فوراً على كل الأجهزة عبر Supabase Realtime.' },
    { t: 'دفع ذري', d: 'كل عملية بيع في معاملة واحدة بقاعدة البيانات، فلا يُباع أكثر من المخزون.' },
    { t: 'أمان متعدد الأنشطة', d: 'Row Level Security في Postgres يعزل كل نشاط وكل صلاحية.' },
    { t: 'العربية أولاً', d: 'واجهة كاملة من اليمين لليسار مع تبديل للإنجليزية.' },
    { t: 'ضريبة مدمجة', d: 'نسبة ضريبة لكل نشاط، وخصومات وطرق دفع.' },
    { t: 'على أي جهاز', d: 'تطبيق ويب متجاوب للموبايل والتابلت والكمبيوتر.' },
  ],
  plans: [
    { n: 'ستارتر', p: '299', f: ['جهاز واحد', 'حتى 200 صنف', 'تقرير مبيعات يومي'] },
    { n: 'بيزنس', p: '599', f: ['3 أجهزة', 'أصناف غير محدودة', 'أدوار وصلاحيات'] },
    { n: 'برو', p: '1,199', f: ['أجهزة غير محدودة', 'فروع متعددة', 'دعم أولوية'] },
  ],
}

export const dict: Record<Locale, Dict> = { en, ar }

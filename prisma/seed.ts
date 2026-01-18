import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from 'src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const PRODUCTS_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500',
];

const PRODUCTS_DATA = [
  {
    enName: 'Wireless Headphones',
    arName: 'سماعات لاسلكية',
    ckbName: 'هێدفۆنی بێ وایەر',
    enDesc:
      'Premium wireless headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.',
    arDesc:
      'سماعات لاسلكية فاخرة مع إلغاء الضوضاء وجودة صوت فائقة. مثالية لعشاق الموسيقى والمحترفين.',
    ckbDesc:
      'هێدفۆنی بێ وایەری بەرز بە لابردنی دەنگی ناخۆش و کوالێتیی دەنگی باشتر. زۆر باشە بۆ حەزلێکەرانی مۆسیقا و پیشەییەکان.',
    price: 89.99,
  },
  {
    enName: 'Smart Watch Pro',
    arName: 'ساعة ذكية برو',
    ckbName: 'کاتژمێری زیرەک پرۆ',
    enDesc:
      'Advanced smartwatch with fitness tracking, heart rate monitor, and customizable watch faces. Stay connected on the go.',
    arDesc:
      'ساعة ذكية متقدمة مع تتبع اللياقة البدنية ومراقبة معدل ضربات القلب ووجوه ساعة قابلة للتخصيص. ابق على اتصال أثناء التنقل.',
    ckbDesc:
      'کاتژمێری زیرەکی پێشکەوتوو بە شوێنکەوتنی تەندروستی، چاودێری لێدانی دڵ و ڕوخساری کاتژمێری دڵخوازکراو. بەستراو بمێنەرەوە.',
    price: 199.99,
  },
  {
    enName: 'Professional Camera',
    arName: 'كاميرا احترافية',
    ckbName: 'کامێرای پیشەیی',
    enDesc:
      'High-resolution camera with 4K video recording, multiple lenses, and advanced image stabilization. Capture every moment perfectly.',
    arDesc:
      'كاميرا عالية الدقة مع تسجيل فيديو 4K وعدسات متعددة وتثبيت صورة متقدم. التقط كل لحظة بشكل مثالي.',
    ckbDesc:
      'کامێرای ڕێکوپێکی بەرز بە تۆمارکردنی ڤیدیۆی 4K، چەندین لێنز و جێگیرکردنی وێنەی پێشکەوتوو. هەموو ساتێک بە تەواوی بگرە.',
    price: 1299.99,
  },
  {
    enName: 'Gaming Laptop Elite',
    arName: 'لابتوب ألعاب نخبة',
    ckbName: 'لاپتۆپی یاری نەخبە',
    enDesc:
      'Powerful gaming laptop with RTX graphics, 16GB RAM, and high refresh rate display. Dominate your games with ultimate performance.',
    arDesc:
      'لابتوب ألعاب قوي مع رسومات RTX وذاكرة 16 جيجابايت وشاشة بمعدل تحديث عالي. سيطر على ألعابك بأداء فائق.',
    ckbDesc:
      'لاپتۆپی یاریی بەهێز بە گرافیکی RTX، 16GB RAM و پیشاندەری ڕێژەی نوێبوونەوەی بەرز. یارییەکانت بە کارایی کۆتایی دەست بەسەردابگرە.',
    price: 1799.99,
  },
  {
    enName: 'Wireless Earbuds',
    arName: 'سماعات أذن لاسلكية',
    ckbName: 'گوێگرەی بێ وایەر',
    enDesc:
      'True wireless earbuds with active noise cancellation, long battery life, and crystal clear audio. Compact and comfortable design.',
    arDesc:
      'سماعات أذن لاسلكية حقيقية مع إلغاء الضوضاء النشط وعمر بطارية طويل وصوت واضح تمامًا. تصميم مدمج ومريح.',
    ckbDesc:
      'گوێگرەی بێ وایەری ڕاستەقینە بە لابردنی دەنگی ناخۆشی چالاک، ژیانی باتریی درێژ و دەنگی زەلاڵ. دیزاینی پێکهاتە و ئاسوودە.',
    price: 149.99,
  },
  {
    enName: 'Bluetooth Speaker',
    arName: 'مكبر صوت بلوتوث',
    ckbName: 'بڵندگۆی بلوتووس',
    enDesc:
      'Portable Bluetooth speaker with 360-degree sound, waterproof design, and 12-hour battery. Perfect for outdoor adventures.',
    arDesc:
      'مكبر صوت بلوتوث محمول مع صوت بزاوية 360 درجة وتصميم مقاوم للماء وبطارية تدوم 12 ساعة. مثالي للمغامرات الخارجية.',
    ckbDesc:
      'بڵندگۆی بلوتووسی هەڵگری بە دەنگی 360 پلە، دیزاینی دژی ئاو و باتریی 12 کاتژمێر. زۆر باشە بۆ سەرگەرمییەکانی دەرەوە.',
    price: 79.99,
  },
  {
    enName: 'Mechanical Keyboard RGB',
    arName: 'لوحة مفاتيح ميكانيكية RGB',
    ckbName: 'تەختەکلیلی میکانیکی RGB',
    enDesc:
      'Premium mechanical keyboard with customizable RGB lighting, tactile switches, and programmable macros. Enhance your typing experience.',
    arDesc:
      'لوحة مفاتيح ميكانيكية فاخرة مع إضاءة RGB قابلة للتخصيص ومفاتيح لمسية وماكرو قابل للبرمجة. حسّن تجربة الكتابة الخاصة بك.',
    ckbDesc:
      'تەختەکلیلی میکانیکی بەرز بە ڕووناکی RGB دڵخوازکراو، سویچی پەنجەیی و ماکرۆی پرۆگرامکراو. ئەزموونی تایپکردنەکەت باشتر بکە.',
    price: 129.99,
  },
  {
    enName: 'USB-C Hub Adapter',
    arName: 'محول USB-C',
    ckbName: 'ئادابتەری هاب USB-C',
    enDesc:
      '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery. Expand your laptop connectivity effortlessly.',
    arDesc:
      'محول USB-C 7 في 1 مع HDMI ومنافذ USB 3.0 وقارئ بطاقة SD وتوصيل الطاقة. وسع اتصال الكمبيوتر المحمول الخاص بك بسهولة.',
    ckbDesc:
      'هابی USB-C ی 7-لە-1 بە HDMI، دەرگای USB 3.0، خوێنەرەوەی کارتی SD و گەیاندنی وزە. پەیوەندی لاپتۆپەکەت بە ئاسانی فراوان بکە.',
    price: 49.99,
  },
  {
    enName: 'Power Bank 20000mAh',
    arName: 'بنك طاقة 20000mAh',
    ckbName: 'بانکی وزە 20000mAh',
    enDesc:
      'High-capacity power bank with fast charging, dual USB ports, and LED display. Keep your devices charged anywhere, anytime.',
    arDesc:
      'بنك طاقة عالي السعة مع شحن سريع ومنافذ USB مزدوجة وشاشة LED. حافظ على شحن أجهزتك في أي مكان وفي أي وقت.',
    ckbDesc:
      'بانکی وزەی توانای بەرز بە پڕکردنەوەی خێرا، دوو دەرگای USB و پیشاندەری LED. ئامێرەکانت لە هەر شوێنێک، هەر کاتێک پڕبکەرەوە.',
    price: 39.99,
  },
  {
    enName: 'Fitness Tracker Band',
    arName: 'سوار تتبع اللياقة',
    ckbName: 'باندی شوێنکەوتنی تەندروستی',
    enDesc:
      'Advanced fitness tracker with step counter, sleep monitor, and water resistance. Track your health goals with precision.',
    arDesc:
      'متتبع لياقة متقدم مع عداد الخطوات ومراقب النوم ومقاومة الماء. تتبع أهداف صحتك بدقة.',
    ckbDesc:
      'شوێنکەوتنی تەندروستیی پێشکەوتوو بە ژمێرەری هەنگاو، چاودێری خەو و بەرگەگرتن لە ئاو. ئامانجە تەندروستییەکانت بە وردی بشوێنبکەوە.',
    price: 59.99,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create user
  console.log('👤 Creating user: Ahmad...');
  const hashedPassword = await bcrypt.hash(
    'ahmadSoftware',
    Number(process.env.PASSWORD_HASH_SALT) || 10,
  );

  const user = await prisma.user.upsert({
    where: { email: 'dr.ahmad.salah.54@gmail.com' },
    update: {},
    create: {
      name: 'ahmad',
      username: 'ahmad',
      email: 'dr.ahmad.salah.54@gmail.com',
      phone: '07701993085',
      password: hashedPassword,
    },
  });

  console.log('✅ User created:', user.email);

  // Create 100 products
  console.log('📦 Creating 100 products...');

  const products = [];
  for (let i = 0; i < 100; i++) {
    const productData = PRODUCTS_DATA[i % PRODUCTS_DATA.length];
    const image = PRODUCTS_IMAGES[i % PRODUCTS_IMAGES.length];
    const suffix = i + 1;
    const enName = `${productData.enName} #${suffix}`;
    const arName = `${productData.arName} #${suffix}`;
    const ckbName = `${productData.ckbName} #${suffix}`;
    const enDesc = `${productData.enDesc} (Product ${suffix})`;
    const arDesc = `${productData.arDesc} (منتج ${suffix})`;
    const ckbDesc = `${productData.ckbDesc} (کاڵا ${suffix})`;
    const price = (
      productData.price +
      Math.floor(Math.random() * 1000) / 100
    ).toFixed(2);
    const product = await prisma.product.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        userId: user.id,
        enName,
        arName,
        ckbName,
        enDesc,
        arDesc,
        ckbDesc,
        image,
        price: Number(price),
        status: 'AVAILABLE',
      },
    });
    products.push(product);
  }

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

(function () {
  'use strict';

  const T = {
    fa: {
      brandName: 'بنفش',
      home: 'خانه',
      servers: 'سرورها',
      bypass: 'بدون VPN',
      settings: 'تنظیمات',

      off: 'قطع است',
      busy: 'در حال اتصال…',
      on: 'وصل است',
      disconnecting: 'در حال قطع اتصال…',
      reconnecting: 'در حال اتصال مجدد…',
      switching: 'در حال امتحان کردن سرور دیگر…',
      waitingNet: 'به اینترنت وصل نیستید',

      hintOff: 'یک سرور رایگان انتخاب کنید یا دکمه‌ی اتصال را بزنید',
      hintOffSelected: 'آماده‌ی اتصال به سرور انتخاب‌شده',
      hintBusy: 'کمی صبر کنید…',
      hintFinding: 'در حال پیدا کردن بهترین سرور سالم…',
      hintOn: 'اتصال امن برقرار است',
      hintWaitingNet: 'به‌محض برقراری اینترنت، خودکار وصل می‌شود',

      connect: 'اتصال',
      cancel: 'انصراف',
      cancelConnect: 'لغو',
      disconnect: 'قطع اتصال',
      change: 'تغییر',
      save: 'ذخیره',
      saveAndConnect: 'ذخیره و اتصال',
      close: 'بستن',
      later: 'بعداً',
      yes: 'بله',
      no: 'خیر',
      copy: 'کپی',
      clear: 'پاک کردن',
      copied: 'کپی شد',
      saved: 'ذخیره شد',
      delete: 'حذف',
      load: 'بارگذاری',

      speedDown: 'دانلود',
      speedUp: 'آپلود',
      serverAddress: 'آدرس سرور',
      serviceLabel: 'سرویس',
      noServerTap: 'برای انتخاب سرور کلیک کنید',
      chooseFree: 'انتخاب سرور رایگان',
      autoBest: 'اتصال هوشمند',

      // Menus
      menuManual: 'ورود سرور دستی',
      menuSendQr: 'ارسال سرور (QR)',
      menuReceiveQr: 'دریافت سرور (QR)',
      menuProfiles: 'پروفایل‌ها',
      menuCheckUpdate: 'بررسی به‌روزرسانی',
      menuReloadDefaults: 'بازگردانی پیش‌فرض‌ها',

      // Protocol / Service
      protocolTitle: 'سرویس اتصال',
      protoL2tpDesc: 'سریع‌تر است، ولی ممکن است روی همه‌ی اینترنت‌ها جواب ندهد. مناسب وب‌گردی، اینستاگرام، یوتیوب و استفاده روزمره.',
      protoSstpDesc: 'شبیه ترافیک HTTPS است. وقتی L2TP روی اینترنت شما بسته است یا جواب نمی‌دهد از SSTP استفاده کنید.',
      protoNext: 'سرویس جدید در اتصال بعدی اعمال می‌شود',
      chooseAgainTitle: 'دوباره سرور انتخاب کن',
      chooseAgainBody: 'سروری که داشتی برای سرویس دیگر انتخاب شده بود. هر سرویس لیست سرور مخصوص خودش را دارد؛ برای {proto} یک سرور انتخاب کن.',
      chooseAgainBtn: 'انتخاب سرور',

      // Servers & Countries
      stitle: 'سرورهای رایگان',
      reloadList: 'بروزرسانی لیست',
      testAgain: 'تست دوباره',
      loadRunning: 'در حال دریافت لیست سرورها…',
      loadFailed: 'دریافت لیست سرورها ناموفق بود. اینترنت را بررسی کنید.',
      countriesNote: '{servers} سرور در {countries} کشور',
      countryServers: '{n} سرور',
      countryServersOne: '۱ سرور',
      currentHere: 'سرور فعلی تو اینجاست',
      currentServer: 'سرور فعلی',
      portBadge: 'پورت {p}',
      qualityHint: 'کیفیت بالا و پینگ پایین، انتخاب بهتری است. کیفیت یعنی سهم هر کاربر از سرعت سرور: هرچه خلوت‌تر، بهتر.',
      qGood: 'کیفیت: خوب',
      qMedium: 'کیفیت: متوسط',
      qBad: 'کیفیت: بد',
      qUnknown: 'کیفیت: نامشخص',
      testingProgress: 'در حال تست سرورها… {done} از {total}',
      testDone: '{ok} سرور سالم · سالم‌ها بالا می‌آیند',
      testNone: 'هیچ سروری از اینترنت شما جواب نداد. چند دقیقه بعد یا سرویس دیگر را امتحان کنید.',
      testVpnOn: 'برای تست دقیق پینگ سرورها، ابتدا اتصال VPN را قطع کنید.',
      pillTesting: 'در حال تست…',
      serverFailed: 'ناموفق',
      showAllServers: 'نمایش همه ({n} سرور)',
      connectAnyway: 'این سرور در تست جواب نداد. با این حال وصل شوم؟',
      serverSetConnecting: 'سرور {host} انتخاب شد؛ در حال اتصال…',
      nook: 'سرور سالمی پیدا نشد. سرویس دیگر (SSTP / L2TP) را امتحان کنید.',
      fail: 'اتصال برقرار نشد',
      l2tpNoResponse: 'سرور جواب نداد. شاید L2TP ندارد یا اینترنت شما آن را می‌بندد. سرور دیگر یا سرویس SSTP را امتحان کنید.',

      // Manual Server & Profiles
      manualServerTitle: 'تنظیمات سرور دستی',
      portLabelInput: 'پورت (SSTP)',
      pskLabel: 'کلید مشترک (L2TP PSK)',
      userLabel: 'نام کاربری',
      passLabel: 'رمز عبور',
      errAddress: 'آدرس سرور معتبر وارد کنید',
      errPort: 'پورت باید بین ۱ تا ۶۵۵۳۵ باشد',
      profilePlaceholder: 'نام پروفایل (اختیاری)',
      profilesEmpty: 'هنوز پروفایلی ذخیره نشده است',
      profileSaved: 'پروفایل ذخیره شد',
      profileLoaded: 'پروفایل بارگذاری شد',
      profileDeleted: 'پروفایل حذف شد',
      importProfile: 'ورود فایل (Import)',
      exportProfile: 'خروجی فایل (Export)',
      exportWarnTitle: 'خروجی پروفایل',
      exportWarnBody: 'رمز عبور به‌صورت متن ساده در فایل خروجی ذخیره می‌شود. ادامه می‌دهید؟',
      proceed: 'ادامه',
      profileExported: 'فایل پروفایل ذخیره شد',
      configInvalid: 'فایل کانفیگ معتبر نیست',
      configTitle: 'کانفیگ جدید',
      configUse: 'استفاده از این کانفیگ',
      configSaved: 'کانفیگ ذخیره شد و آماده‌ی استفاده است',
      reloadConfirmTitle: 'بازگردانی پیش‌فرض‌ها',
      reloadConfirmBody: 'مطمئن هستید که همه‌ی تنظیمات به حالت پیش‌فرض برگردد؟',
      defaultsReloaded: 'تنظیمات به حالت پیش‌فرض برگشت',

      // QR Share & Receive
      qrSendTitle: 'ارسال سرور (QR)',
      qrSendHint: 'در برنامه‌ی بنفش (اندروید یا ویندوز) از منوی ⋮ گزینه‌ی «دریافت سرور» را بزنید و این QR را اسکن کنید.',
      qrSendNote: 'این QR رمزنگاری شده و فقط با برنامه‌ی بنفش خوانده می‌شود.',
      qrNoServer: 'ابتدا یک سرور انتخاب کنید، سپس آن را ارسال کنید.',
      qrCopyCode: 'کپی کد بنفش',
      qrSaveImg: 'ذخیره تصویر QR',
      qrReceiveTitle: 'دریافت سرور',
      qrReceiveHint: 'QR ساخته‌شده در بنفش را مقابل وب‌کم بگیرید، تصویرش را انتخاب کنید یا کدش را جای‌گذاری کنید.',
      qrCamPermBody: 'وب‌کم فقط در همین پنجره برای خواندن QR روشن می‌شود و هیچ تصویری ذخیره یا ارسال نمی‌شود.',
      qrStartCam: 'روشن کردن وب‌کم و اسکن',
      qrSearching: 'در حال جست‌وجوی QR بنفش…',
      qrCamDenied: 'دسترسی به وب‌کم امکان‌پذیر نشد. از تصویر یا کد متنی استفاده کنید.',
      qrOrOtherWays: 'یا دریافت بدون وب‌کم (تصویر / کد متنی)',
      qrPickImage: 'انتخاب تصویر QR (یا Ctrl+V)',
      qrApplyCode: 'ثبت کد',
      qrInvalid: 'این QR یا کد متعلق به بنفش نیست',
      qrConfirmTitle: 'سرور دریافت شد',
      qrConfirmMsg: '{label}\n\nاین سرور ثبت شود؟',
      qrConfirmSave: 'ثبت سرور',
      qrConnectMsg: 'سرور ثبت شد. الان وصل می‌شوید؟',

      // Settings
      appearanceTitle: 'ظاهر و زبان',
      themeLabel: 'تم برنامه',
      themeDark: 'تاریک',
      themeLight: 'روشن شیشه‌ای',
      themeSystem: 'سیستم',
      lang: 'زبان برنامه',
      reconnectTitle: 'اتصال و اتصال مجدد',
      logTitle: 'گزارش اتصال (Log)',
      logSummary: 'مشاهده و کپی جزئیات فنی اتصال',
      logEmpty: 'هنوز گزارشی ثبت نشده است.',
      autoReconnect: 'اتصال مجدد خودکار',
      autoReconnectNote: 'اگر اتصال قطع شد، بنفش خودکار دوباره وصل شود',
      autoFailover: 'جایگزینی خودکار سرور خراب',
      autoFailoverNote: 'اگر سرور فعلی از کار افتاد، سراغ یک سرور سالم دیگر برود',
      startupReconnect: 'اتصال خودکار هنگام شروع',
      startupReconnectNote: 'با باز شدن بنفش، آخرین اتصال برقرار شود',
      reconnectAttempts: 'تعداد تلاش روی هر سرور',
      reconnectAttemptsNote: 'تعداد تلاش قبل از تعویض سرور',
      reconnectDelay: 'فاصله‌ی بین تلاش‌ها',
      seconds: 'ثانیه',
      tries: 'بار',
      closeTitle: 'رفتار هنگام بستن پنجره',
      closeAsk: 'از من بپرس',
      closeKeep: 'اتصال بماند و برنامه کنار ساعت برود',
      closeQuit: 'قطع اتصال و خروج کامل',
      trayNote: 'وقتی پنجره بسته است، بنفش کنار ساعت ویندوز فعال می‌ماند.',
      proxyUse: 'استفاده از HTTP Proxy برای SSTP',
      proxyHost: 'آدرس پروکسی',
      proxyPort: 'پورت پروکسی',
      advanced: 'پیشرفته (Advanced)',
      customDnsUse: 'استفاده از DNS سفارشی روی تونل',
      customDnsNote: 'جلوگیری از اختلال DNS پس از اتصال (مثلاً 1.1.1.1)',
      customDnsAddr: 'آدرس IPv4 سرور DNS',
      l2tpNatTLabel: 'تنظیم خودکار NAT-T ویندوز برای L2TP',
      l2tpNatTNote: 'فعال‌سازی پشتیبانی ویندوز از سرورهای L2TP پشت NAT',
      saveLogLabel: 'ذخیره گزارش اتصال در فایل',
      openLogFolder: 'باز کردن پوشه لاگ',
      telegramChannel: 'کانال تلگرام',
      guide: 'راهنما و معرفی',
      whatsNewBtn: 'تازه‌های نسخه',

      // Updates & News
      updateChecking: 'در حال بررسی به‌روزرسانی…',
      updateUpToDate: 'شما آخرین نسخه را دارید',
      updateCheckFailed: 'بررسی به‌روزرسانی انجام نشد. اتصال اینترنت را بررسی کنید.',
      updateBanner: 'نسخه‌ی جدید {v} آماده است — مشاهده و نصب',
      updateTitle: 'به‌روزرسانی به نسخه‌ی {v}',
      updateNow: 'دانلود و نصب',
      updateOpenPage: 'باز کردن صفحه‌ی دانلود',
      updateNoNotes: 'نسخه‌ی جدیدی از بنفش آماده است.',
      updateDownloading: 'در حال دانلود… {p}%',
      updateInstalling: 'در حال اجرای نصب‌کننده…',
      updatePortableReady: 'فایل نسخه پرتابل دانلود شد و در پوشه نمایش داده شد.',
      updateFailed: 'دانلود انجام نشد. می‌توانید از صفحه‌ی ریلیزها دانلود کنید.',
      newsBanner: 'اعلان جدید: {title}',
      newsOpen: 'باز کردن لینک',

      // Reconnect status
      reconnectAttempt: 'تلاش',
      of: 'از',
      connectedTo: 'متصل شد به',
      connectionLost: 'اتصال قطع شد؛ در حال اتصال مجدد…',
      failoverToast: 'سرور فعلی پاسخ نمی‌دهد؛ در حال امتحان سرور سالم دیگر…',
      reconnectFailed: 'اتصال مجدد خودکار ناموفق بود.',

      // Close modal
      closeModalTitle: 'بستن بنفش',
      closeModalDetail: 'بنفش کنار ساعت ویندوز می‌ماند و از همان‌جا می‌توانید پنجره را باز کنید یا اتصال را مدیریت کنید.',
      dontAsk: 'دیگر این سؤال را نپرس',
      keepClose: 'فقط پنجره بسته شود (کنار ساعت بماند)',
      quitClose: 'قطع اتصال و خروج کامل',
      closeConnected: 'اتصال VPN برقرار است. می‌خواهید اتصال بماند و فقط پنجره بسته شود، یا کاملاً خارج شوید؟',
      closeOffline: 'می‌توانید بنفش را کنار ساعت نگه دارید یا کاملاً خارج شوید.',

      // Bypass / Without VPN (Iran IP ranges + Custom sites, NO Apps)
      btitle: 'اینترنت مستقیم (بدون VPN)',
      bnote: 'آی‌پی‌های ایران و دامنه‌های انتخابی شما هنگام روشن بودن VPN مستقیم و بدون تونل باز می‌شوند.',
      nvIranTitle: 'سایت‌های ایرانی بدون VPN',
      nvIranTag: 'آزمایشی',
      nvIranSummary: 'اگر مشکلی پیش آمد این سوییچ را خاموش کنید',
      nvIranDetail: 'همه‌ی بازه‌های آی‌پی داخل ایران (RIPE) مستقیم باز می‌شوند',
      nvManageSites: 'مدیریت سایت‌ها',
      nvRefreshIran: 'بروزرسانی لیست ایران',
      nvRangesCount: '{n} بازه‌ی آی‌پی ایران آماده است',
      nvRangesUpdated: 'لیست آی‌پی‌های ایران بروزرسانی شد ({n} بازه)',
      nvRangesFailed: 'بروزرسانی لیست آی‌پی‌های ایران ناموفق بود',
      nvCustomHeading: 'سایت‌ها و آی‌پی‌های انتخابی بدون VPN',
      nvCustomToggle: 'مسیریابی مستقیم سایت‌های انتخابی',
      nvCustomToggleNote: 'دامنه‌ها و آی‌پی‌های لیست زیر بدون VPN باز شوند',
      nvCustomActiveCount: '{n} سایت انتخابی بدون VPN فعال است',
      nvCustomDisabledNote: 'لیست سایت‌های انتخابی غیرفعال است',
      add: 'افزودن',
      sub: 'زیردامنه‌های رایج (www، pay، api، ...) خودکار اضافه می‌شوند؛ آی‌پی و CIDR هم پذیرفته می‌شود.',
      sitePh: 'مثلاً site.ir یا 185.143.232.0/22',
      siteInv: 'آدرس دامنه یا آی‌پی معتبر نیست',
      siteDup: 'این مورد قبلاً در لیست وجود دارد',
      nvSitesEmpty: 'هنوز سایتی در لیست نیست.',
      nvResetSites: 'بازگردانی سایت‌های پیش‌فرض',
      nvSitesResetDone: 'سایت‌های پیش‌فرض بازگردانی شدند',
      nvAppliedLive: 'مسیرهای بدون VPN روی اتصال فعلی اعمال شد',

      // Welcome & What's New
      welcomeTitle: 'به بنفش (Banafsh) خوش آمدید',
      whatsNewTitleModal: 'تازه‌های نسخه‌ی {v}',
      welcomeIntro: 'کلاینت ساده و رایگان L2TP/IPsec و SSTP برای ویندوز، هماهنگ با نسخه‌ی اندروید بنفش.',
      whatsNewHeading: 'تازه‌ها و امکانات جدید',
      wn1: 'دو سرویس اتصال: L2TP/IPsec (سریع‌تر) و SSTP (مشابه HTTPS) با تست واقعی هر پروتکل',
      wn2: 'لیست سرورها به تفکیک کشورها با پرچم، پینگ واقعی و نشانگر کیفیت سرور',
      wn3: 'سایت‌های ایرانی بدون VPN (تمام آی‌پی‌های ایران + دامنه‌های دلخواه) و اشتراک سرور با QR',
      wn4: 'نمایش سرعت زنده دانلود/آپلود، تم تاریک و روشن شیشه‌ای، اعلان خبرها و آپدیت درون‌برنامه‌ای',
      welcomeHow: 'چطور استفاده کنم؟',
      w1: 'سرویس دلخواه (L2TP یا SSTP) را انتخاب کنید و روی دکمه‌ی اتصال یا «انتخاب سرور رایگان» بزنید.',
      w2: 'در تب «سرورها»، کشور دلخواه را باز کنید تا سرورها از اینترنت خودتان تست و مرتب شوند.',
      w3: 'در تب «بدون VPN» می‌توانید کل آی‌پی‌های ایران یا سایت‌های دلخواه را مستقیم باز کنید و از منوی ⋮ سرور را با QR به گوشی بفرستید.',
      w4: 'اگر اینترنت یا سرور قطع شود، بنفش هوشمندانه منتظر اینترنت می‌ماند و دوباره وصل می‌شود.',
      bankTitle: 'نکته‌ی امنیتی و لاگ‌ها',
      bankText: 'سرورهای رایگان توسط داوطلبان پروژه‌ی VPN Gate در دنیا راه‌اندازی شده‌اند، نه یک شرکت. لطفاً برای کارهای حساس مثل بانک یا حساب‌های مهم از سرورهای عمومی رایگان استفاده نکنید.',
      logText: 'اپراتورهای VPN Gate ممکن است لاگ اتصال را نگه دارند؛ بنابراین این سرویس برای دسترسی و وب‌گردی روزمره است، نه ناشناس ماندن کامل.',
      dontShowAgain: 'دیگر در شروع برنامه نشان نده',
      welcomeStart: 'شروع استفاده'
    },

    en: {
      brandName: 'Banafsh',
      home: 'Home',
      servers: 'Servers',
      bypass: 'No VPN',
      settings: 'Settings',

      off: 'Disconnected',
      busy: 'Connecting…',
      on: 'Connected',
      disconnecting: 'Disconnecting…',
      reconnecting: 'Reconnecting…',
      switching: 'Trying another server…',
      waitingNet: 'No internet connection',

      hintOff: 'Pick a free server or press Connect',
      hintOffSelected: 'Ready to connect to selected server',
      hintBusy: 'Please wait…',
      hintFinding: 'Finding the best working server…',
      hintOn: 'Secure tunnel is active',
      hintWaitingNet: 'Will reconnect automatically once internet is back',

      connect: 'Connect',
      cancel: 'Cancel',
      cancelConnect: 'Cancel',
      disconnect: 'Disconnect',
      change: 'Change',
      save: 'Save',
      saveAndConnect: 'Save & Connect',
      close: 'Close',
      later: 'Later',
      yes: 'Yes',
      no: 'No',
      copy: 'Copy',
      clear: 'Clear',
      copied: 'Copied',
      saved: 'Saved',
      delete: 'Delete',
      load: 'Load',

      speedDown: 'Download',
      speedUp: 'Upload',
      serverAddress: 'Server Address',
      serviceLabel: 'Service',
      noServerTap: 'Click to choose a server',
      chooseFree: 'Choose free server',
      autoBest: 'Smart Connect',

      menuManual: 'Enter server manually',
      menuSendQr: 'Send server (QR)',
      menuReceiveQr: 'Receive server (QR)',
      menuProfiles: 'Profiles',
      menuCheckUpdate: 'Check for updates',
      menuReloadDefaults: 'Reload defaults',

      protocolTitle: 'Connection service',
      protoL2tpDesc: 'Faster, though some networks block UDP/IPsec. Great for browsing, YouTube, Instagram and everyday use.',
      protoSstpDesc: 'Looks like standard HTTPS traffic. Use SSTP whenever L2TP does not answer on your network.',
      protoNext: 'The new service will be used on your next connection',
      chooseAgainTitle: 'Choose a server again',
      chooseAgainBody: 'Your previous server came from the other service\'s list. Each service has its own server list — please pick one for {proto}.',
      chooseAgainBtn: 'Choose server',

      stitle: 'Free servers',
      reloadList: 'Refresh list',
      testAgain: 'Test again',
      loadRunning: 'Downloading server list…',
      loadFailed: 'Could not download server list. Check your internet connection.',
      countriesNote: '{servers} servers in {countries} countries',
      countryServers: '{n} servers',
      countryServersOne: '1 server',
      currentHere: 'Your current server is here',
      currentServer: 'Current server',
      portBadge: 'Port {p}',
      qualityHint: 'Higher quality and lower ping make a better choice. Quality estimates each user\'s share of server bandwidth.',
      qGood: 'Quality: good',
      qMedium: 'Quality: medium',
      qBad: 'Quality: bad',
      qUnknown: 'Quality: unknown',
      testingProgress: 'Testing servers… {done} of {total}',
      testDone: '{ok} working servers · healthy ones come first',
      testNone: 'No server answered from your network. Try again shortly or switch service.',
      testVpnOn: 'Disconnect VPN first to measure accurate direct pings.',
      pillTesting: 'Testing…',
      serverFailed: 'Failed',
      showAllServers: 'Show all ({n} servers)',
      connectAnyway: 'This server did not answer the probe. Connect anyway?',
      serverSetConnecting: 'Server {host} selected; connecting…',
      nook: 'No working server found. Try switching service (SSTP / L2TP).',
      fail: 'Connection failed',
      l2tpNoResponse: 'The server did not answer. Your ISP may block L2TP/IPsec — try another server or switch to SSTP.',

      manualServerTitle: 'Manual Server Settings',
      portLabelInput: 'Port (SSTP)',
      pskLabel: 'Pre-shared key (L2TP PSK)',
      userLabel: 'Username',
      passLabel: 'Password',
      errAddress: 'Please enter a valid server address',
      errPort: 'Port must be between 1 and 65535',
      profilePlaceholder: 'Profile name (optional)',
      profilesEmpty: 'No saved profiles yet',
      profileSaved: 'Profile saved',
      profileLoaded: 'Profile loaded',
      profileDeleted: 'Profile deleted',
      importProfile: 'Import JSON',
      exportProfile: 'Export JSON',
      exportWarnTitle: 'Export profile',
      exportWarnBody: 'The password is saved as plain text inside the exported JSON file. Continue?',
      proceed: 'Continue',
      profileExported: 'Profile file exported',
      configInvalid: 'Invalid configuration file',
      configTitle: 'New configuration',
      configUse: 'Use this configuration',
      configSaved: 'Configuration saved and ready',
      reloadConfirmTitle: 'Reload defaults',
      reloadConfirmBody: 'Reset all settings back to their default values?',
      defaultsReloaded: 'Default settings restored',

      qrSendTitle: 'Send Server (QR)',
      qrSendHint: 'Open Banafsh on another phone or PC, open the ⋮ menu → "Receive server", and scan this QR code.',
      qrSendNote: 'Encrypted QR — readable only by Banafsh (Android & Windows).',
      qrNoServer: 'Select a server first before sharing.',
      qrCopyCode: 'Copy Banafsh code',
      qrSaveImg: 'Save QR image',
      qrReceiveTitle: 'Receive Server',
      qrReceiveHint: 'Hold a Banafsh QR up to your webcam, pick a QR screenshot, or paste a Banafsh share code.',
      qrCamPermBody: 'Your camera is only used right here to scan the QR code. Nothing is recorded or sent anywhere.',
      qrStartCam: 'Start camera & scan',
      qrSearching: 'Looking for a Banafsh QR…',
      qrCamDenied: 'Camera unavailable or denied. Use an image file or paste the code below.',
      qrOrOtherWays: 'Or receive without camera (image / code)',
      qrPickImage: 'Choose QR image (or Ctrl+V)',
      qrApplyCode: 'Apply code',
      qrInvalid: 'This QR or code was not created by Banafsh',
      qrConfirmTitle: 'Server received',
      qrConfirmMsg: '{label}\n\nSave this server?',
      qrConfirmSave: 'Save server',
      qrConnectMsg: 'Server saved. Connect right now?',

      appearanceTitle: 'Appearance & Language',
      themeLabel: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light Glass',
      themeSystem: 'System',
      lang: 'Language',
      reconnectTitle: 'Connection & Reconnect',
      logTitle: 'Connection Log',
      logSummary: 'View and copy technical tunnel details',
      logEmpty: 'No connection logs yet.',
      autoReconnect: 'Automatic reconnect',
      autoReconnectNote: 'Reconnect automatically if the VPN drops',
      autoFailover: 'Automatic server failover',
      autoFailoverNote: 'Try another healthy server if the current one stops answering',
      startupReconnect: 'Reconnect on startup',
      startupReconnectNote: 'Restore the last connection when Banafsh opens',
      reconnectAttempts: 'Attempts per server',
      reconnectAttemptsNote: 'Retries before switching to another server',
      reconnectDelay: 'Retry interval',
      seconds: 'sec',
      tries: 'tries',
      closeTitle: 'When closing the window',
      closeAsk: 'Ask me',
      closeKeep: 'Keep connection and minimize to tray',
      closeQuit: 'Disconnect and quit',
      trayNote: 'Banafsh stays active next to the Windows clock even when the window is closed.',
      proxyUse: 'Use HTTP Proxy for SSTP',
      proxyHost: 'Proxy host',
      proxyPort: 'Proxy port',
      advanced: 'Advanced',
      customDnsUse: 'Use custom DNS on VPN tunnel',
      customDnsNote: 'Prevent ISP DNS leaks while connected (e.g. 1.1.1.1)',
      customDnsAddr: 'DNS IPv4 address',
      l2tpNatTLabel: 'Auto-configure Windows L2TP NAT-T',
      l2tpNatTNote: 'Enables Windows IPsec support for L2TP servers behind NAT',
      saveLogLabel: 'Save connection logs to file',
      openLogFolder: 'Open log folder',
      telegramChannel: 'Telegram Channel',
      guide: 'Guide & About',
      whatsNewBtn: 'What\'s New',

      updateChecking: 'Checking for updates…',
      updateUpToDate: 'You have the latest version',
      updateCheckFailed: 'Could not check for updates. Check your internet connection.',
      updateBanner: 'New version {v} is ready — View & install',
      updateTitle: 'Update to v{v}',
      updateNow: 'Download & Install',
      updateOpenPage: 'Open Releases page',
      updateNoNotes: 'A new version of Banafsh is available.',
      updateDownloading: 'Downloading… {p}%',
      updateInstalling: 'Launching installer…',
      updatePortableReady: 'Portable executable downloaded and revealed in Explorer.',
      updateFailed: 'Download failed. You can grab it from the Releases page.',
      newsBanner: 'Notice: {title}',
      newsOpen: 'Open link',

      reconnectAttempt: 'Attempt',
      of: 'of',
      connectedTo: 'Connected to',
      connectionLost: 'Connection lost; reconnecting…',
      failoverToast: 'Server stopped responding; trying another healthy server…',
      reconnectFailed: 'Automatic reconnect failed.',

      closeModalTitle: 'Close Banafsh',
      closeModalDetail: 'Banafsh stays in the Windows system tray so you can reopen it or toggle VPN anytime.',
      dontAsk: 'Don\'t ask me again',
      keepClose: 'Close window only (keep in tray)',
      quitClose: 'Disconnect and quit',
      closeConnected: 'VPN is currently connected. Keep it running in the tray, or disconnect and quit?',
      closeOffline: 'Keep Banafsh in the system tray, or quit completely?',

      btitle: 'Direct Internet (No VPN)',
      bnote: 'Iranian IP ranges and your chosen websites open directly outside the VPN tunnel while connected.',
      nvIranTitle: 'Iranian websites without VPN',
      nvIranTag: 'Experimental',
      nvIranSummary: 'If anything goes wrong, turn this switch off',
      nvIranDetail: 'Routes all Iranian RIPE IPv4 ranges directly outside VPN',
      nvManageSites: 'Manage sites',
      nvRefreshIran: 'Refresh Iran IPs',
      nvRangesCount: '{n} Iranian IP blocks ready',
      nvRangesUpdated: 'Iranian IP list updated ({n} blocks)',
      nvRangesFailed: 'Could not refresh Iranian IP list',
      nvCustomHeading: 'Custom Websites & IPs Without VPN',
      nvCustomToggle: 'Direct routing for custom list',
      nvCustomToggleNote: 'Open the domains and IPs below directly without VPN',
      nvCustomActiveCount: '{n} custom direct sites active',
      nvCustomDisabledNote: 'Custom sites list is turned off',
      add: 'Add',
      sub: 'Common subdomains (www, pay, api, ...) are added automatically; IPv4 & CIDR are also supported.',
      sitePh: 'e.g. site.ir or 185.143.232.0/22',
      siteInv: 'Invalid domain or IPv4 address',
      siteDup: 'Already in the list',
      nvSitesEmpty: 'No custom sites in the list.',
      nvResetSites: 'Restore default sites',
      nvSitesResetDone: 'Default sites restored',
      nvAppliedLive: 'Direct routes updated on active connection',

      welcomeTitle: 'Welcome to Banafsh',
      whatsNewTitleModal: 'What\'s New in v{v}',
      welcomeIntro: 'Simple, free L2TP/IPsec & SSTP VPN client for Windows — built to match Banafsh on Android.',
      whatsNewHeading: 'New Features',
      wn1: 'Dual connection services: L2TP/IPsec (faster) & SSTP (HTTPS-like) with real protocol probes',
      wn2: 'Country-grouped server list with crisp vector flags, live ping, and server quality badges',
      wn3: 'Iranian websites & custom domains without VPN + encrypted QR server sharing',
      wn4: 'Live download/upload speed meter, Dark & Light Glass themes, developer news & in-app updates',
      welcomeHow: 'How to use',
      w1: 'Pick your service (L2TP or SSTP) and click Connect or "Choose free server".',
      w2: 'In "Servers", open any country to probe and rank its servers live from your internet.',
      w3: 'Use "No VPN" to open Iranian websites or chosen domains directly, and ⋮ to share servers via QR.',
      w4: 'If your internet drops, Banafsh waits for connectivity and reconnects automatically.',
      bankTitle: 'Security & Logs Note',
      bankText: 'Free servers are run by volunteers on VPN Gate, not a commercial provider. Avoid logging into sensitive accounts such as banking over public volunteer servers.',
      logText: 'Volunteer operators and VPN Gate keep connection logs for abuse prevention, so use Banafsh for everyday access rather than strict anonymity.',
      dontShowAgain: 'Don\'t show automatically on startup',
      welcomeStart: 'Get Started'
    }
  };

  const DEFAULT_SITES = ['aparat.com', 'digikala.com', 'divar.ir', 'snapp.ir', 'bmi.ir'];
  const HOST_RE = /^[A-Za-z0-9.:_\-[\]]{1,253}$/;
  const ROWS_LIMIT = 50;
  const PENDING = -2;
  const FAILED = -1;

  let appMeta = { version: '0.2.0', isPortable: false, systemDark: true, releasesPage: 'https://github.com/Banafshex/Banafsh-Windows/releases' };
  let S = {
    lang: 'fa',
    theme: 'dark',
    protocol: 'l2tp',
    last: null,
    profiles: {},
    iranSitesEnabled: false,
    customSitesEnabled: true,
    sites: [...DEFAULT_SITES],
    autoReconnect: true,
    autoFailover: true,
    reconnectOnStart: false,
    reconnectDelay: 10,
    reconnectAttempts: 3,
    closeBehavior: 'ask',
    proxyEnabled: false,
    proxyHost: '',
    proxyPort: 8080,
    customDnsEnabled: false,
    customDns: '1.1.1.1',
    l2tpNatT: true,
    saveLogFile: true,
    welcomeSeen: false,
    lastSeenVersion: '',
    updateDismissedVersion: '',
    newsDismissedId: ''
  };

  // Runtime UI state
  let connected = false;
  let busy = false;
  let busyReason = ''; // 'connecting' | 'finding' | 'disconnecting' | 'reconnecting' | 'switching' | 'waitingNet'
  let reconnectingText = '';
  let tunnelIp = '';
  let liveDownBps = 0;
  let liveUpBps = 0;

  // Servers & Country testing state
  let loadedProtocol = null;
  let servers = [];
  let probeResults = [];
  let currentCountry = null; // null => countries list; 'JP' => servers of JP
  let showAllInCountry = false;
  let loadingList = false;
  let testingCountry = false;
  let testedDone = 0;
  let testTotal = 0;
  let testGeneration = 0;
  let renderRaf = null;

  // Updates & News state
  let pendingUpdate = null;
  let pendingNews = null;
  let downloadingUpdate = false;

  // QR state
  let lastQrPayload = '';
  let lastQrSvg = '';
  let camStream = null;
  let camScanTimer = null;

  const logs = [];
  const $ = (id) => document.getElementById(id);
  const netCanvas = new window.BanafshNetworkCanvas($('net-canvas'));

  function t(key, vars = {}) {
    const dict = T[S.lang] || T.fa;
    let str = dict[key] !== undefined ? dict[key] : (T.fa[key] || key);
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), String(v));
    }
    return str;
  }

  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, String(v));
    }
    for (const kid of kids) {
      if (kid !== null && kid !== undefined && kid !== false && kid !== '') {
        node.append(kid);
      }
    }
    return node;
  }

  function pushLog(msg) {
    const stamp = new Date().toLocaleTimeString();
    logs.push(`${stamp}  ${msg}`);
    if (logs.length > 250) logs.shift();
    if (!$('log-modal').hidden) renderLogBox();
  }

  function toast(msg, ms = 3400) {
    const box = $('toast');
    box.textContent = msg;
    box.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { box.hidden = true; }, ms);
  }

  function saveSettings(partial = {}) {
    Object.assign(S, partial);
    return window.api.set(S);
  }

  function formatBytesPerSec(bps) {
    const n = Math.max(0, Number(bps) || 0);
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB/s`;
    return `${Math.round(n / 1024)} KB/s`;
  }

  function shortHost(host) {
    if (!host) return '';
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ? host : host.split('.')[0];
  }

  function protoDisplay(p) {
    return (p || S.protocol) === 'sstp' ? 'SSTP' : 'L2TP/IPsec';
  }

  function protoShort(p) {
    return (p || S.protocol) === 'sstp' ? 'SSTP' : 'L2TP';
  }

  // ==================== THEME & LANGUAGE ====================

  function isEffectiveDark() {
    if (S.theme === 'light') return false;
    if (S.theme === 'system') return !!appMeta.systemDark;
    return true;
  }

  function applyTheme() {
    const dark = isEffectiveDark();
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    netCanvas.setTheme(dark);
    window.api.setWindowTheme(dark).catch(() => {});

    $('theme-dark').classList.toggle('active', S.theme === 'dark');
    $('theme-light').classList.toggle('active', S.theme === 'light');
    $('theme-system').classList.toggle('active', S.theme === 'system');
  }

  function applyLang() {
    const fa = S.lang !== 'en';
    document.documentElement.lang = fa ? 'fa' : 'en';
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    $('brand-name').textContent = t('brandName');
    $('site-in').placeholder = t('sitePh');
    $('profile-name-in').placeholder = t('profilePlaceholder');
    $('qr-code-in').placeholder = fa ? 'کد رمزنگاری‌شده بنفش...' : 'Encrypted Banafsh code...';
    $('version-label').textContent = `Banafsh ${appMeta.version}`;

    document.querySelectorAll('[data-t]').forEach((node) => {
      node.textContent = t(node.dataset.t);
    });

    $('l-fa').classList.toggle('active', fa);
    $('l-en').classList.toggle('active', !fa);

    renderHome();
    renderServersView();
    renderBypass();
    renderSettings();
  }

  // ==================== MODAL HELPERS ====================

  function openModal(id) {
    const m = $(id);
    if (!m) return;
    m.hidden = false;
    m.setAttribute('aria-hidden', 'false');
  }

  function closeModal(id) {
    const m = $(id);
    if (!m) return;
    m.hidden = true;
    m.setAttribute('aria-hidden', 'true');
    if (id === 'qr-scan-modal') stopCameraScan();
  }

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  function askConfirm({ title, body, okText, cancelText }) {
    return new Promise((resolve) => {
      $('confirm-title').textContent = title || '';
      $('confirm-body').textContent = body || '';
      $('confirm-ok').textContent = okText || t('yes');
      $('confirm-cancel').textContent = cancelText || t('cancel');
      openModal('confirm-modal');

      const cleanup = (ans) => {
        $('confirm-ok').onclick = null;
        $('confirm-cancel').onclick = null;
        closeModal('confirm-modal');
        resolve(ans);
      };
      $('confirm-ok').onclick = () => cleanup(true);
      $('confirm-cancel').onclick = () => cleanup(false);
    });
  }

  // ==================== HOME RENDERING ====================

  function renderBanner() {
    const banner = $('home-banner');
    if (pendingUpdate && S.updateDismissedVersion !== pendingUpdate.version) {
      banner.hidden = false;
      $('banner-text').textContent = t('updateBanner', { v: pendingUpdate.version });
      banner.onclick = () => openUpdateModal(pendingUpdate);
      return;
    }
    if (pendingNews && S.newsDismissedId !== pendingNews.id) {
      banner.hidden = false;
      $('banner-text').textContent = t('newsBanner', { title: pendingNews.title || t('brandName') });
      banner.onclick = () => openNewsModal(pendingNews);
      return;
    }
    banner.hidden = true;
    banner.onclick = null;
  }

  function renderHome() {
    const waiting = busy && busyReason === 'waitingNet';
    const pill = $('status-pill');
    pill.classList.toggle('live', connected && !busy);
    pill.classList.toggle('busy', busy && !waiting);
    pill.classList.toggle('waiting', waiting);

    if (waiting) {
      $('status').textContent = t('waitingNet');
      $('status-hint').textContent = t('hintWaitingNet');
    } else if (busy) {
      if (busyReason === 'disconnecting') {
        $('status').textContent = t('disconnecting');
        $('status-hint').textContent = t('hintBusy');
      } else if (busyReason === 'reconnecting') {
        $('status').textContent = reconnectingText || t('reconnecting');
        $('status-hint').textContent = t('hintBusy');
      } else if (busyReason === 'switching') {
        $('status').textContent = t('switching');
        $('status-hint').textContent = t('hintBusy');
      } else if (busyReason === 'finding') {
        $('status').textContent = t('busy');
        $('status-hint').textContent = t('hintFinding');
      } else {
        $('status').textContent = t('busy');
        $('status-hint').textContent = t('hintBusy');
      }
    } else if (connected) {
      $('status').textContent = t('on');
      $('status-hint').textContent = t('hintOn');
    } else {
      $('status').textContent = t('off');
      $('status-hint').textContent = S.last && S.last.host ? t('hintOffSelected') : t('hintOff');
    }

    // Tunnel IP pill
    if (connected && !busy && tunnelIp) {
      $('tunnel-ip').hidden = false;
      $('tunnel-ip').textContent = `IP: ${tunnelIp}`;
    } else {
      $('tunnel-ip').hidden = true;
    }

    // Connect disc & energy ring
    const canCancel = busy && busyReason !== 'disconnecting';
    $('big-label').textContent = canCancel
      ? t('cancelConnect')
      : (busy ? t('disconnecting') : (connected ? t('disconnect') : t('connect')));

    $('orb').classList.toggle('busy', busy);
    $('orb').classList.toggle('live', connected && !busy);
    $('bg-glow').classList.toggle('on', connected && !busy);

    const prevMode = netCanvas.mode;
    const nextMode = busy ? 'connecting' : (connected ? 'connected' : 'idle');
    if (prevMode !== nextMode) {
      netCanvas.setMode(nextMode, nextMode === 'connected' && prevMode === 'connecting');
    }

    // Speed panel
    const showSpeed = connected && !busy;
    $('speed-panel').classList.toggle('visible', showSpeed);
    $('speed-down').textContent = showSpeed ? formatBytesPerSec(liveDownBps) : '—';
    $('speed-up').textContent = showSpeed ? formatBytesPerSec(liveUpBps) : '—';

    // Server & Service cards
    const pShort = protoShort(S.protocol);
    $('home-proto').textContent = pShort;
    $('srv-proto-pill').textContent = pShort;
    $('server-card-caption').textContent = `${t('serverAddress')} · ${pShort}`;

    const flagSlot = $('home-flag');
    flagSlot.replaceChildren();
    if (S.last && S.last.host) {
      if (S.last.cc) flagSlot.appendChild(window.BanafshFlags.flagElement(S.last.cc, 'md'));
      const portSuffix = S.protocol === 'sstp' && S.last.port ? `:${S.last.port}` : '';
      $('addr').textContent = `${S.last.host}${portSuffix}`;
      $('addr').dir = 'ltr';
      if (S.last.ping && S.last.ping > 0) {
        $('home-meta').hidden = false;
        $('home-ping').textContent = `${S.last.ping} ms`;
      } else {
        $('home-meta').hidden = true;
      }
    } else {
      $('addr').textContent = t('noServerTap');
      $('addr').dir = S.lang === 'en' ? 'ltr' : 'rtl';
      $('home-meta').hidden = true;
    }

    $('home-iran-sites').checked = !!S.iranSitesEnabled;
    const customArr = Array.isArray(S.sites) ? S.sites : [];
    $('home-custom-count').textContent = S.customSitesEnabled !== false
      ? t('nvCustomActiveCount', { n: customArr.length })
      : t('nvCustomDisabledNote');

    $('auto-best').disabled = busy;
    renderBanner();
  }

  // ==================== BYPASS / WITHOUT VPN (IRAN IPs + CUSTOM SITES) ====================

  let iranRangesCount = 0;

  function normSiteEntry(raw) {
    let v = String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/^[a-z]+:\/\//, '')
      .replace(/^\*\./, '')
      .replace(/^www\./, '');

    const slashIdx = v.indexOf('/');
    if (slashIdx !== -1) {
      const ipPart = v.slice(0, slashIdx);
      const lenPart = v.slice(slashIdx + 1).split(/[/?#:]/)[0];
      const octs = ipPart.split('.');
      if (octs.length === 4 && octs.every((o) => /^\d{1,3}$/.test(o) && Number(o) <= 255) && /^\d{1,2}$/.test(lenPart)) {
        const len = Number(lenPart);
        if (len >= 8 && len <= 32) {
          let addr = 0;
          for (const o of octs) addr = ((addr << 8) | Number(o)) >>> 0;
          const mask = len === 32 ? (0xFFFFFFFF >>> 0) : ((0xFFFFFFFF << (32 - len)) >>> 0);
          const net = (addr & mask) >>> 0;
          const canon = `${(net >>> 24) & 255}.${(net >>> 16) & 255}.${(net >>> 8) & 255}.${net & 255}`;
          return len === 32 ? canon : `${canon}/${len}`;
        }
        return null;
      }
    }

    v = v.split(/[/?#:]/)[0];
    const octs = v.split('.');
    if (octs.length === 4 && octs.every((o) => /^\d{1,3}$/.test(o) && Number(o) <= 255)) {
      return v;
    }
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v) && v.length <= 253) {
      return v;
    }
    return null;
  }

  async function syncBypassIfConnected() {
    if (!connected || busy) return;
    try {
      const res = await window.api.syncBypass();
      if (res && res.active) {
        toast(t('nvAppliedLive'));
      }
    } catch {}
  }

  function renderBypass() {
    $('bp-iran-sites').checked = !!S.iranSitesEnabled;
    $('home-iran-sites').checked = !!S.iranSitesEnabled;
    $('bp-custom-sites').checked = S.customSitesEnabled !== false;
    $('iran-ranges-count').textContent = iranRangesCount > 0
      ? t('nvRangesCount', { n: iranRangesCount })
      : '';

    const list = Array.isArray(S.sites) ? S.sites : [];
    const customOn = S.customSitesEnabled !== false;

    if (!list.length) {
      $('sites').replaceChildren(el('p', { class: 'muted small center-text', text: t('nvSitesEmpty') }));
      return;
    }

    $('sites').replaceChildren(
      ...list.map((entry) =>
        el(
          'div',
          { class: 'site-row' + (customOn ? '' : ' disabled') },
          el('span', { class: 'site-host', dir: 'ltr', text: entry }),
          el(
            'button',
            {
              class: 'site-del-btn',
              type: 'button',
              'aria-label': t('delete'),
              onclick: async () => {
                S.sites = (S.sites || []).filter((x) => x !== entry);
                await saveSettings({ sites: S.sites });
                renderBypass();
                renderHome();
                await syncBypassIfConnected();
              }
            },
            '×'
          )
        )
      )
    );
  }

  async function toggleIranSites(enabled) {
    S.iranSitesEnabled = !!enabled;
    await saveSettings({ iranSitesEnabled: S.iranSitesEnabled });
    renderHome();
    renderBypass();
    if (connected) {
      await syncBypassIfConnected();
    } else {
      toast(t('saved'));
    }
  }

  $('home-iran-sites').addEventListener('change', (e) => toggleIranSites(e.target.checked));
  $('bp-iran-sites').addEventListener('change', (e) => toggleIranSites(e.target.checked));
  $('home-manage-sites').addEventListener('click', () => showTab('bypass'));

  $('bp-custom-sites').addEventListener('change', async (e) => {
    S.customSitesEnabled = e.target.checked;
    await saveSettings({ customSitesEnabled: S.customSitesEnabled });
    renderBypass();
    renderHome();
    if (connected) {
      await syncBypassIfConnected();
    } else {
      toast(t('saved'));
    }
  });

  async function addCustomSite() {
    const clean = normSiteEntry($('site-in').value);
    if (!clean) {
      toast(t('siteInv'));
      return;
    }
    const list = Array.isArray(S.sites) ? S.sites : [];
    if (list.includes(clean)) {
      toast(t('siteDup'));
      return;
    }
    S.sites = [clean, ...list];
    $('site-in').value = '';
    await saveSettings({ sites: S.sites });
    renderBypass();
    renderHome();
    if (connected) {
      await syncBypassIfConnected();
    } else {
      toast(t('saved'));
    }
  }

  $('add-site').addEventListener('click', addCustomSite);
  $('site-in').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSite();
    }
  });

  $('btn-reset-sites').addEventListener('click', async () => {
    S.sites = [...DEFAULT_SITES];
    S.customSitesEnabled = true;
    await saveSettings({ sites: S.sites, customSitesEnabled: true });
    renderBypass();
    renderHome();
    toast(t('nvSitesResetDone'));
    await syncBypassIfConnected();
  });

  $('btn-refresh-iran').addEventListener('click', async () => {
    $('btn-refresh-iran').disabled = true;
    try {
      const res = await window.api.refreshIranRanges();
      if (res && res.count) iranRangesCount = res.count;
      renderBypass();
      if (res && res.ok) {
        toast(t('nvRangesUpdated', { n: res.count }));
      } else {
        toast(t('nvRangesFailed'));
      }
    } finally {
      $('btn-refresh-iran').disabled = false;
    }
  });

  // ==================== PROTOCOL / SERVICE SWITCHING ====================

  function openProtocolModal() {
    $('opt-l2tp').classList.toggle('selected', S.protocol !== 'sstp');
    $('opt-sstp').classList.toggle('selected', S.protocol === 'sstp');
    openModal('protocol-modal');
  }

  async function selectProtocol(nextProto) {
    closeModal('protocol-modal');
    if (nextProto !== 'l2tp' && nextProto !== 'sstp') return;
    if (nextProto === S.protocol) return;

    testGeneration++;
    testingCountry = false;
    await saveSettings({ protocol: nextProto });

    // Force server list reload for the newly chosen service
    loadedProtocol = null;
    servers = [];
    probeResults = [];
    currentCountry = null;
    showAllInCountry = false;

    renderHome();
    renderSettings();

    if (!$('s-servers').hidden) {
      loadServersList();
    }

    if (connected) {
      toast(t('protoNext'));
      return;
    }

    // Mirror MainActivity.verifyServerForService: if current server came from the other protocol's list,
    // verify whether this host also exists in the new service's list.
    if (S.last && S.last.host && S.last.listKey && S.last.listKey !== nextProto) {
      const ok = await window.api.verifyServerForProtocol(nextProto, S.last.host);
      if (ok) {
        S.last = { ...S.last, listKey: nextProto, protocol: nextProto };
        await saveSettings({ last: S.last });
        renderHome();
      } else {
        S.last = null;
        await saveSettings({ last: null });
        renderHome();
        const pick = await askConfirm({
          title: t('chooseAgainTitle'),
          body: t('chooseAgainBody', { proto: protoDisplay(nextProto) }),
          okText: t('chooseAgainBtn'),
          cancelText: t('later')
        });
        if (pick) showTab('servers');
      }
    }
  }

  $('card-protocol').addEventListener('click', openProtocolModal);
  $('srv-proto-pill').addEventListener('click', openProtocolModal);
  $('set-open-proto').addEventListener('click', openProtocolModal);
  $('opt-l2tp').addEventListener('click', () => selectProtocol('l2tp'));
  $('opt-sstp').addEventListener('click', () => selectProtocol('sstp'));

  // ==================== SERVERS & COUNTRY PROBING ====================

  async function loadServersList(force = false) {
    if (loadingList) return;
    if (!force && loadedProtocol === S.protocol && servers.length > 0) {
      renderServersView();
      return;
    }

    testGeneration++;
    testingCountry = false;
    loadingList = true;
    currentCountry = null;
    showAllInCountry = false;
    $('srv-progress-wrap').hidden = true;
    $('srv-note').textContent = t('loadRunning');
    $('list').replaceChildren();

    const targetProto = S.protocol;
    try {
      const downloaded = await window.api.servers(targetProto);
      if (targetProto !== S.protocol) return;
      servers = Array.isArray(downloaded) ? downloaded : [];
      probeResults = new Array(servers.length).fill(PENDING);
      loadedProtocol = targetProto;
    } catch (e) {
      servers = [];
      probeResults = [];
      toast(t('loadFailed'));
      pushLog('server list load failed: ' + (e.message || e));
    } finally {
      loadingList = false;
      renderServersView();
    }
  }

  function openCountry(cc) {
    currentCountry = cc;
    showAllInCountry = false;
    $('main-scroll').scrollTop = 0;
    renderServersView();
    if (!connected) {
      startCountryProbe();
    }
  }

  function backToCountries() {
    testGeneration++;
    testingCountry = false;
    currentCountry = null;
    showAllInCountry = false;
    $('srv-progress-wrap').hidden = true;
    renderServersView();
  }

  async function startCountryProbe() {
    if (currentCountry === null || !servers.length) return;
    if (connected) {
      toast(t('testVpnOn'));
      renderServersView();
      return;
    }

    const indices = [];
    servers.forEach((s, idx) => {
      if ((s.cc || '--') === currentCountry) {
        probeResults[idx] = PENDING;
        indices.push(idx);
      }
    });
    if (!indices.length) return;

    const myGen = ++testGeneration;
    const proto = S.protocol;
    testingCountry = true;
    testedDone = 0;
    testTotal = indices.length;
    $('srv-progress-wrap').hidden = false;
    $('srv-progress-bar').style.width = '0%';
    renderServersView();

    let cursor = 0;
    const healthBatch = [];

    const scheduleRender = () => {
      if (renderRaf) return;
      renderRaf = requestAnimationFrame(() => {
        renderRaf = null;
        if (myGen !== testGeneration) return;
        const pct = testTotal > 0 ? Math.round((testedDone * 100) / testTotal) : 0;
        $('srv-progress-bar').style.width = pct + '%';
        renderServersView();
      });
    };

    const worker = async () => {
      while (cursor < indices.length) {
        if (myGen !== testGeneration) return;
        const sIdx = indices[cursor++];
        const srv = servers[sIdx];
        const ms = await window.api.test({
          protocol: proto,
          host: srv.host,
          ip: srv.ip,
          port: srv.port
        });
        if (myGen !== testGeneration) return;
        probeResults[sIdx] = ms > 0 ? ms : FAILED;
        healthBatch.push({ host: srv.host, ms });
        testedDone++;
        scheduleRender();
      }
    };

    await Promise.all(Array.from({ length: Math.min(10, indices.length) }, worker));
    if (myGen !== testGeneration) return;

    testingCountry = false;
    $('srv-progress-wrap').hidden = true;
    renderServersView();
    window.api.health(proto, healthBatch).catch(() => {});
  }

  function qualityBadgeInfo(q) {
    switch (q) {
      case 'good': return { cls: 'q-good', text: t('qGood') };
      case 'medium': return { cls: 'q-medium', text: t('qMedium') };
      case 'bad': return { cls: 'q-bad', text: t('qBad') };
      default: return { cls: 'q-unknown', text: t('qUnknown') };
    }
  }

  function renderServersView() {
    const isCountryOpen = currentCountry !== null;
    $('srv-back').hidden = !isCountryOpen;
    $('srv-reload').hidden = isCountryOpen;
    $('test-all').hidden = !isCountryOpen;
    $('srv-proto-pill').textContent = protoShort(S.protocol);

    if (loadingList) {
      $('srv-title').textContent = t('stitle');
      $('srv-note').textContent = t('loadRunning');
      return;
    }

    if (!servers.length) {
      $('srv-title').textContent = t('stitle');
      $('srv-note').textContent = t('loadFailed');
      $('list').replaceChildren();
      return;
    }

    const currentHost = S.last?.host || '';

    // 1. Countries Overview
    if (!isCountryOpen) {
      $('srv-title').textContent = t('stitle');
      const byCountry = new Map();
      servers.forEach((s, idx) => {
        const key = s.cc || '--';
        if (!byCountry.has(key)) byCountry.set(key, []);
        byCountry.get(key).push(idx);
      });

      const groups = [...byCountry.entries()].sort((a, b) =>
        b[1].length - a[1].length ||
        window.BanafshFlags.countryName(a[0], '', S.lang).localeCompare(
          window.BanafshFlags.countryName(b[0], '', S.lang)
        )
      );

      $('srv-note').textContent = t('countriesNote', {
        servers: servers.length,
        countries: groups.length
      });

      const rows = groups.map(([cc, idxs]) => {
        const first = servers[idxs[0]];
        const cName = window.BanafshFlags.countryName(cc, first.country, S.lang);
        const hasCurrent = Boolean(currentHost && idxs.some((i) => servers[i].host === currentHost));
        const countLabel = idxs.length === 1 ? t('countryServersOne') : t('countryServers', { n: idxs.length });

        return el(
          'div',
          {
            class: 'country-item' + (hasCurrent ? ' current' : ''),
            onclick: () => openCountry(cc)
          },
          window.BanafshFlags.flagElement(cc, 'lg'),
          el(
            'div',
            { class: 'country-info' },
            el('div', { class: 'country-name-row' }, el('span', { class: 'country-title', text: cName })),
            el(
              'div',
              { class: 'country-sub' },
              el('span', { text: countLabel }),
              hasCurrent ? el('span', { class: 'tag-pill tag-current', text: t('currentHere') }) : null
            )
          ),
          el('span', { class: 'row-chevron', text: '‹' })
        );
      });

      $('list').replaceChildren(...rows);
      return;
    }

    // 2. Servers inside Current Country
    const cName = window.BanafshFlags.countryName(currentCountry, '', S.lang);
    $('srv-title').textContent = cName;

    const visible = [];
    servers.forEach((s, idx) => {
      if ((s.cc || '--') === currentCountry) visible.push(idx);
    });

    const okCount = visible.filter((i) => probeResults[i] > 0).length;
    if (connected) {
      $('srv-note').textContent = t('testVpnOn');
    } else if (testingCountry) {
      $('srv-note').textContent = t('testingProgress', { done: testedDone, total: testTotal });
    } else if (okCount === 0) {
      $('srv-note').textContent = t('testNone');
    } else {
      $('srv-note').textContent = t('testDone', { ok: okCount });
    }

    $('test-all').disabled = testingCountry || connected || busy;

    // Sort matching ServerListActivity.kt:
    // Current server first -> Answered (ms > 0) -> Pending -> Failed -> Quality tier -> Ping / Share
    const ordered = [...visible].sort((a, b) => {
      const curA = servers[a].host === currentHost ? 0 : 1;
      const curB = servers[b].host === currentHost ? 0 : 1;
      if (curA !== curB) return curA - curB;

      const stateA = probeResults[a] > 0 ? 0 : (probeResults[a] === PENDING ? 1 : 2);
      const stateB = probeResults[b] > 0 ? 0 : (probeResults[b] === PENDING ? 1 : 2);
      if (stateA !== stateB) return stateA - stateB;

      const qA = servers[a].qualityRank ?? 2;
      const qB = servers[b].qualityRank ?? 2;
      if (qA !== qB) return qA - qB;

      if (probeResults[a] > 0 && probeResults[b] > 0) {
        return probeResults[a] - probeResults[b];
      }
      return (servers[b].share || 0) - (servers[a].share || 0);
    });

    const shown = showAllInCountry || ordered.length <= ROWS_LIMIT
      ? ordered
      : ordered.slice(0, ROWS_LIMIT);
    const showPort = S.protocol === 'sstp';

    const items = shown.map((idx) => {
      const srv = servers[idx];
      const res = probeResults[idx];
      const isCurrent = srv.host === currentHost;
      const qInfo = qualityBadgeInfo(srv.quality);

      let pingPill = null;
      if (!connected) {
        if (res > 0) {
          pingPill = el('span', { class: 'tag-pill p-ok', dir: 'ltr' }, el('span', { class: 'p-dot' }), `${res} ms ✓`);
        } else if (res === FAILED) {
          pingPill = el('span', { class: 'tag-pill p-bad' }, el('span', { class: 'p-dot' }), `${t('serverFailed')} ✕`);
        } else {
          pingPill = el('span', { class: 'tag-pill p-wait' }, el('span', { class: 'p-dot' }), t('pillTesting'));
        }
      }

      const btnDisabled = busy || (!connected && res === PENDING);
      const connectBtn = el(
        'button',
        {
          class: 'btn small-btn' + (res === FAILED && !connected ? ' ghost' : ''),
          type: 'button',
          onclick: async () => {
            if (!connected && res === FAILED) {
              const anyway = await askConfirm({
                title: cName,
                body: t('connectAnyway'),
                okText: t('connect'),
                cancelText: t('cancel')
              });
              if (!anyway) return;
            }
            chooseFreeServer(srv, res > 0 ? res : 0);
          }
        },
        t('connect')
      );
      connectBtn.disabled = btnDisabled;

      return el(
        'div',
        {
          class: 'server-item' + (isCurrent ? ' current' : '') + (!connected && res === FAILED ? ' failed' : '')
        },
        window.BanafshFlags.flagElement(srv.cc, 'md'),
        el(
          'div',
          { class: 'server-info' },
          el(
            'div',
            { class: 'server-title-row' },
            el('span', { class: 'server-title', text: `${cName} · ${shortHost(srv.host)}` })
          ),
          el(
            'div',
            { class: 'server-pills-row' },
            isCurrent ? el('span', { class: 'tag-pill tag-current', text: t('currentServer') }) : null,
            showPort ? el('span', { class: 'tag-pill tag-port', text: t('portBadge', { p: srv.port }) }) : null,
            el('span', { class: 'tag-pill ' + qInfo.cls, text: qInfo.text }),
            pingPill
          )
        ),
        connectBtn
      );
    });

    if (shown.length < ordered.length) {
      items.push(
        el(
          'button',
          {
            class: 'btn ghost full',
            type: 'button',
            onclick: () => {
              showAllInCountry = true;
              renderServersView();
            }
          },
          t('showAllServers', { n: ordered.length })
        )
      );
    }

    $('list').replaceChildren(...items);
  }

  async function chooseFreeServer(srv, measuredPing = 0) {
    testGeneration++;
    testingCountry = false;
    const chosen = {
      host: srv.host,
      ip: srv.ip || '',
      port: srv.port || 443,
      user: srv.user || 'vpn',
      pass: srv.pass || 'vpn',
      psk: srv.psk || 'vpn',
      cc: srv.cc || '',
      country: srv.country || '',
      ping: measuredPing || srv.ping || 0,
      protocol: S.protocol,
      listKey: S.protocol,
      verify: true
    };
    await saveSettings({ last: chosen });
    showTab('home');
    toast(t('serverSetConnecting', { host: shortHost(chosen.host) }));
    await startConnection(chosen);
  }

  // ==================== CONNECT / DISCONNECT / SMART AUTO-PICK ====================

  async function pickBestServerAutomatically() {
    const proto = S.protocol;
    if (loadedProtocol !== proto || !servers.length) {
      try {
        servers = await window.api.servers(proto);
        probeResults = new Array(servers.length).fill(PENDING);
        loadedProtocol = proto;
      } catch {
        return null;
      }
    }
    if (!servers.length) return null;

    // Rank top 16 quality servers and probe concurrently
    const ranked = [...servers]
      .sort((a, b) => (a.qualityRank ?? 2) - (b.qualityRank ?? 2) || (b.share || 0) - (a.share || 0))
      .slice(0, 16);

    const probed = await Promise.all(
      ranked.map(async (srv) => ({
        srv,
        ms: await window.api.test({ protocol: proto, host: srv.host, ip: srv.ip, port: srv.port })
      }))
    );

    window.api.health(proto, probed.map((x) => ({ host: x.srv.host, ms: x.ms }))).catch(() => {});

    const alive = probed
      .filter((x) => x.ms > 0)
      .sort((a, b) => (a.srv.qualityRank ?? 2) - (b.srv.qualityRank ?? 2) || a.ms - b.ms);

    if (!alive.length) return null;
    const winner = alive[0];
    return {
      host: winner.srv.host,
      ip: winner.srv.ip || '',
      port: winner.srv.port || 443,
      user: winner.srv.user || 'vpn',
      pass: winner.srv.pass || 'vpn',
      psk: winner.srv.psk || 'vpn',
      cc: winner.srv.cc || '',
      country: winner.srv.country || '',
      ping: winner.ms,
      protocol: proto,
      listKey: proto,
      verify: true
    };
  }

  async function startConnection(serverOverride = null) {
    if (busy) return;
    let target = serverOverride || S.last;

    // Verify list compatibility before connecting
    if (target && target.host && target.listKey && target.listKey !== S.protocol) {
      const exists = await window.api.verifyServerForProtocol(S.protocol, target.host);
      if (exists) {
        target = { ...target, listKey: S.protocol, protocol: S.protocol };
      } else {
        target = null;
      }
    }

    busy = true;
    busyReason = target ? 'connecting' : 'finding';
    renderHome();

    try {
      if (!target || !target.host) {
        target = await pickBestServerAutomatically();
        if (!target) {
          toast(t('nook'));
          return;
        }
      }

      busyReason = 'connecting';
      S.last = { ...target, protocol: S.protocol };
      await saveSettings({ last: S.last });
      renderHome();

      pushLog(`connecting [${S.protocol.toUpperCase()}] ${target.host}:${target.port || 443}`);
      const r = await window.api.connect({
        protocol: S.protocol,
        host: target.host,
        port: target.port || 443,
        user: target.user || 'vpn',
        pass: target.pass || 'vpn',
        psk: target.psk || 'vpn'
      });

      if (r && r.ok) {
        connected = true;
        pushLog(`connected: ${target.host}`);
      } else if (r && r.errorCode === 'CANCELLED') {
        connected = false;
      } else {
        connected = false;
        const msg = r?.errorCode === 'L2TP_NO_RESPONSE' ? t('l2tpNoResponse') : t('fail');
        toast(msg, 4600);
        pushLog('connect error: ' + (r?.error || 'unknown'));
      }
    } finally {
      busy = false;
      busyReason = '';
      renderHome();
      renderServersView();
    }
  }

  $('big').addEventListener('click', async () => {
    if (busy && busyReason !== 'disconnecting') {
      await window.api.cancel();
      busy = false;
      busyReason = '';
      connected = false;
      renderHome();
      pushLog('connection cancelled by user');
      return;
    }
    if (busy) return;
    if (connected) {
      busy = true;
      busyReason = 'disconnecting';
      renderHome();
      await window.api.disconnect();
      connected = false;
      tunnelIp = '';
      liveDownBps = 0;
      liveUpBps = 0;
      busy = false;
      busyReason = '';
      renderHome();
      renderServersView();
      pushLog('disconnected');
    } else {
      await startConnection(S.last);
    }
  });

  $('free').addEventListener('click', () => showTab('servers'));
  $('auto-best').addEventListener('click', async () => {
    if (busy) return;
    await startConnection(null);
  });

  $('card-server').addEventListener('click', (e) => {
    if (e.target.closest('#btn-manual-edit')) return;
    showTab('servers');
  });
  $('card-server').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openManualServerModal();
  });
  $('btn-manual-edit').addEventListener('click', (e) => {
    e.stopPropagation();
    openManualServerModal();
  });

  $('srv-back').addEventListener('click', backToCountries);
  $('srv-reload').addEventListener('click', () => loadServersList(true));
  $('test-all').addEventListener('click', startCountryProbe);

  // ==================== MANUAL SERVER & PROFILES ====================

  function openManualServerModal() {
    $('man-host').value = S.last?.host || '';
    $('man-port').value = String(S.last?.port || 443);
    $('man-user').value = S.last?.user || 'vpn';
    $('man-pass').value = S.last?.pass || 'vpn';
    $('man-psk').value = S.last?.psk || 'vpn';
    openModal('manual-modal');
    setTimeout(() => $('man-host').focus(), 20);
  }

  async function saveManualServer(andConnect = false) {
    const host = $('man-host').value.trim();
    const port = Number($('man-port').value);
    const user = $('man-user').value.trim() || 'vpn';
    const pass = $('man-pass').value || 'vpn';
    const psk = $('man-psk').value || 'vpn';

    if (!host || !HOST_RE.test(host)) {
      toast(t('errAddress'));
      return;
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      toast(t('errPort'));
      return;
    }

    const manualSrv = {
      host,
      ip: '',
      port,
      user,
      pass,
      psk,
      cc: '',
      country: '',
      ping: 0,
      protocol: S.protocol,
      listKey: null, // Manual servers can be used with any service
      verify: false
    };

    await saveSettings({ last: manualSrv });
    closeModal('manual-modal');
    renderHome();
    toast(t('saved'));

    if (andConnect) {
      if (connected) await window.api.disconnect();
      await startConnection(manualSrv);
    }
  }

  $('man-save').addEventListener('click', () => saveManualServer(false));
  $('man-save-connect').addEventListener('click', () => saveManualServer(true));

  function renderProfilesList() {
    const entries = Object.entries(S.profiles || {});
    const box = $('profiles-list');
    if (!entries.length) {
      box.replaceChildren(el('p', { class: 'muted small center-text', text: t('profilesEmpty') }));
      return;
    }
    box.replaceChildren(
      ...entries.map(([name, prof]) =>
        el(
          'div',
          { class: 'profile-row' },
          prof.cc ? window.BanafshFlags.flagElement(prof.cc, 'sm') : null,
          el(
            'div',
            { class: 'profile-row-info' },
            el('strong', { text: name }),
            el('small', { text: `${prof.host}:${prof.port || 443} · ${(prof.protocol || 'l2tp').toUpperCase()}` })
          ),
          el(
            'button',
            {
              class: 'btn ghost small-btn',
              type: 'button',
              onclick: async () => {
                const nextProto = prof.protocol === 'sstp' ? 'sstp' : 'l2tp';
                S.protocol = nextProto;
                S.last = { ...prof, listKey: null };
                await saveSettings({ protocol: S.protocol, last: S.last });
                closeModal('profiles-modal');
                renderHome();
                renderSettings();
                toast(t('profileLoaded'));
              }
            },
            t('load')
          ),
          el(
            'button',
            {
              class: 'btn ghost small-btn',
              type: 'button',
              onclick: async () => {
                const copy = { ...(S.profiles || {}) };
                delete copy[name];
                S.profiles = copy;
                await saveSettings({ profiles: copy });
                renderProfilesList();
                toast(t('profileDeleted'));
              }
            },
            '×'
          )
        )
      )
    );
  }

  function openProfilesModal() {
    $('profile-name-in').value = '';
    renderProfilesList();
    openModal('profiles-modal');
  }

  $('btn-profile-save').addEventListener('click', async () => {
    if (!S.last || !S.last.host) {
      toast(t('qrNoServer'));
      return;
    }
    const name = $('profile-name-in').value.trim() || S.last.host;
    const nextProfiles = { ...(S.profiles || {}), [name]: { ...S.last, protocol: S.protocol } };
    S.profiles = nextProfiles;
    await saveSettings({ profiles: nextProfiles });
    $('profile-name-in').value = '';
    renderProfilesList();
    toast(t('profileSaved'));
  });

  $('btn-profile-export').addEventListener('click', async () => {
    if (!S.last || !S.last.host) {
      toast(t('qrNoServer'));
      return;
    }
    const ok = await askConfirm({
      title: t('exportWarnTitle'),
      body: t('exportWarnBody'),
      okText: t('proceed'),
      cancelText: t('cancel')
    });
    if (!ok) return;
    const done = await window.api.exportProfile({ ...S.last, protocol: S.protocol });
    if (done) toast(t('profileExported'));
  });

  $('btn-profile-import').addEventListener('click', async () => {
    const res = await window.api.importProfile();
    if (!res || res.canceled) return;
    if (!res.ok || !res.profile) {
      toast(t('configInvalid'));
      return;
    }
    const p = res.profile;
    const summary = `${p.host}:${p.port}\nUser: ${p.user || '(empty)'}\nService: ${(p.protocol || S.protocol).toUpperCase()}`;
    const useIt = await askConfirm({
      title: t('configTitle'),
      body: summary,
      okText: t('configUse'),
      cancelText: t('cancel')
    });
    if (!useIt) return;

    if (p.protocol === 'l2tp' || p.protocol === 'sstp') S.protocol = p.protocol;
    S.last = {
      host: p.host,
      ip: '',
      port: p.port || 443,
      user: p.user || 'vpn',
      pass: p.pass || 'vpn',
      psk: p.psk || 'vpn',
      cc: p.cc || '',
      country: '',
      ping: 0,
      protocol: S.protocol,
      listKey: null,
      verify: p.verify !== false
    };
    await saveSettings({ protocol: S.protocol, last: S.last });
    closeModal('profiles-modal');
    renderHome();
    renderSettings();
    toast(t('configSaved'));
  });

  // ==================== QR SEND & RECEIVE ====================

  async function openQrSendModal() {
    if (!S.last || !S.last.host) {
      toast(t('qrNoServer'));
      return;
    }
    try {
      const res = await window.api.qrEncode({
        ...S.last,
        protocol: S.protocol
      });
      lastQrPayload = res.payload;
      lastQrSvg = res.svg;
      $('qr-svg-box').innerHTML = res.svg;
      const portPart = S.protocol === 'sstp' ? `:${S.last.port || 443}` : '';
      $('qr-send-server').textContent = `${S.last.cc ? S.last.cc + ' · ' : ''}${S.last.host}${portPart}`;
      openModal('qr-send-modal');
    } catch (e) {
      toast(t('fail'));
    }
  }

  $('qr-copy-code').addEventListener('click', async () => {
    if (!lastQrPayload) return;
    await navigator.clipboard.writeText(lastQrPayload);
    toast(t('copied'));
  });

  $('qr-save-img').addEventListener('click', async () => {
    if (!lastQrSvg) return;
    const ok = await window.api.qrSaveSvg(lastQrSvg, S.last?.host || 'server');
    if (ok) toast(t('saved'));
  });

  function stopCameraScan() {
    if (camScanTimer) {
      clearInterval(camScanTimer);
      camScanTimer = null;
    }
    if (camStream) {
      camStream.getTracks().forEach((tr) => tr.stop());
      camStream = null;
    }
    const vid = $('qr-video');
    if (vid) vid.srcObject = null;
  }

  function openQrReceiveModal() {
    stopCameraScan();
    $('qr-cam-explain').hidden = false;
    $('qr-cam-box').hidden = true;
    $('qr-scan-status').hidden = true;
    $('qr-code-in').value = '';
    openModal('qr-scan-modal');
  }

  async function handleDecodedQrText(rawText) {
    const srv = await window.api.qrDecode(rawText);
    if (!srv) {
      toast(t('qrInvalid'));
      if (!$('qr-scan-status').hidden) {
        $('qr-scan-status').textContent = t('qrInvalid');
      }
      return false;
    }

    closeModal('qr-scan-modal');
    const label = `${srv.cc ? srv.cc + ' · ' : ''}${srv.host}:${srv.port}`;
    const saveIt = await askConfirm({
      title: t('qrConfirmTitle'),
      body: t('qrConfirmMsg', { label }),
      okText: t('qrConfirmSave'),
      cancelText: t('cancel')
    });
    if (!saveIt) return true;

    if (srv.protocol === 'l2tp' || srv.protocol === 'sstp') {
      S.protocol = srv.protocol;
    }
    S.last = {
      host: srv.host,
      ip: '',
      port: srv.port || 443,
      user: srv.user || 'vpn',
      pass: srv.pass || 'vpn',
      psk: srv.psk || 'vpn',
      cc: srv.cc || '',
      country: '',
      ping: 0,
      protocol: S.protocol,
      listKey: null,
      verify: srv.verify !== false
    };
    await saveSettings({ protocol: S.protocol, last: S.last });
    renderHome();
    renderSettings();

    const connectNow = await askConfirm({
      title: t('qrConfirmTitle'),
      body: t('qrConnectMsg'),
      okText: t('yes'),
      cancelText: t('no')
    });
    if (connectNow) {
      if (connected) await window.api.disconnect();
      await startConnection(S.last);
    }
    return true;
  }

  $('qr-start-cam').addEventListener('click', async () => {
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      const vid = $('qr-video');
      vid.srcObject = camStream;
      await vid.play();

      $('qr-cam-explain').hidden = true;
      $('qr-cam-box').hidden = false;
      $('qr-scan-status').hidden = false;
      $('qr-scan-status').textContent = t('qrSearching');

      const cvs = $('qr-decode-canvas');
      const ctx = cvs.getContext('2d', { willReadFrequently: true });

      camScanTimer = setInterval(async () => {
        if (!vid.videoWidth || !vid.videoHeight) return;
        cvs.width = vid.videoWidth;
        cvs.height = vid.videoHeight;
        ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const code = window.jsQR && window.jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          stopCameraScan();
          await handleDecodedQrText(code.data);
        }
      }, 220);
    } catch {
      $('qr-scan-status').hidden = false;
      $('qr-scan-status').textContent = t('qrCamDenied');
    }
  });

  async function decodeImageBlob(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
      const cvs = $('qr-decode-canvas');
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      const maxDim = 1000;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      cvs.width = Math.max(1, Math.round(img.width * scale));
      cvs.height = Math.max(1, Math.round(img.height * scale));
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const code = window.jsQR && window.jsQR(imgData.data, imgData.width, imgData.height);
      if (code && code.data) {
        await handleDecodedQrText(code.data);
      } else {
        toast(t('qrInvalid'));
      }
    } catch {
      toast(t('qrInvalid'));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  $('qr-file-in').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (file) await decodeImageBlob(file);
  });

  document.addEventListener('paste', async (e) => {
    if ($('qr-scan-modal').hidden) return;
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          await decodeImageBlob(blob);
          return;
        }
      }
    }
  });

  $('qr-decode-btn').addEventListener('click', () => {
    const txt = $('qr-code-in').value.trim();
    if (!txt) return;
    handleDecodedQrText(txt);
  });

  // ==================== OVERFLOW MENU & QUICK HEADER ACTIONS ====================

  const topMenu = $('top-menu');
  function toggleMenu(force) {
    const show = force !== undefined ? force : topMenu.hidden;
    topMenu.hidden = !show;
    $('btn-menu').setAttribute('aria-expanded', String(show));
  }

  $('btn-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', () => {
    if (!topMenu.hidden) toggleMenu(false);
  });

  topMenu.querySelectorAll('[data-menu]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      toggleMenu(false);
      const act = btn.dataset.menu;
      if (act === 'manual') openManualServerModal();
      else if (act === 'qr-send') openQrSendModal();
      else if (act === 'qr-receive') openQrReceiveModal();
      else if (act === 'profiles') openProfilesModal();
      else if (act === 'update') checkForUpdatesManual();
      else if (act === 'log') openLogModal();
      else if (act === 'reset') confirmReloadDefaults();
    });
  });

  $('btn-theme-quick').addEventListener('click', () => {
    const next = isEffectiveDark() ? 'light' : 'dark';
    saveSettings({ theme: next });
    applyTheme();
  });

  $('win-min').addEventListener('click', () => window.api.minimize());
  $('win-close').addEventListener('click', () => window.api.closeWindow());

  // ==================== UPDATES & NEWS ====================

  function openUpdateModal(info) {
    if (!info) return;
    pendingUpdate = info;
    downloadingUpdate = false;
    $('update-modal-title').textContent = t('updateTitle', { v: info.version });
    $('update-notes').textContent = info.localizedNotes || t('updateNoNotes');
    $('update-dl-box').hidden = true;
    $('btn-update-now').hidden = false;
    $('btn-update-now').disabled = false;
    $('btn-update-page').hidden = true;
    openModal('update-modal');
  }

  async function checkForUpdatesManual() {
    toast(t('updateChecking'));
    const res = await window.api.checkUpdate(true);
    if (!res || !res.ok) {
      toast(t('updateCheckFailed'));
      return;
    }
    if (res.upToDate || !res.info) {
      toast(t('updateUpToDate'));
      return;
    }
    openUpdateModal(res.info);
    renderBanner();
  }

  $('btn-update-now').addEventListener('click', async () => {
    if (!pendingUpdate || downloadingUpdate) return;
    downloadingUpdate = true;
    $('btn-update-now').disabled = true;
    $('update-dl-box').hidden = false;
    $('update-dl-bar').style.width = '0%';
    $('update-dl-label').textContent = t('updateDownloading', { p: 0 });

    const res = await window.api.downloadUpdate(pendingUpdate);
    downloadingUpdate = false;

    if (res && res.cancelled) {
      closeModal('update-modal');
      return;
    }
    if (!res || !res.ok || !res.filePath) {
      $('btn-update-now').disabled = false;
      $('update-dl-label').textContent = t('updateFailed');
      $('btn-update-page').hidden = false;
      return;
    }

    if (res.isPortable) {
      await window.api.installUpdate(res.filePath);
      $('update-dl-label').textContent = t('updatePortableReady');
      toast(t('updatePortableReady'), 5000);
    } else {
      $('update-dl-label').textContent = t('updateInstalling');
      await window.api.installUpdate(res.filePath);
    }
  });

  $('btn-update-page').addEventListener('click', () => {
    window.api.openExternal(pendingUpdate?.pageUrl || appMeta.releasesPage);
  });

  $('btn-update-later').addEventListener('click', async () => {
    if (downloadingUpdate) {
      await window.api.cancelUpdateDownload();
      downloadingUpdate = false;
    } else if (pendingUpdate) {
      await saveSettings({ updateDismissedVersion: pendingUpdate.version });
    }
    closeModal('update-modal');
    renderBanner();
  });

  function openNewsModal(item) {
    if (!item) return;
    pendingNews = item;
    $('news-title').textContent = item.title || t('brandName');
    $('news-body').textContent = item.text || '';
    $('btn-news-open').hidden = !item.url;
    $('btn-news-open').onclick = () => {
      if (item.url) window.api.openExternal(item.url);
    };
    openModal('news-modal');
  }

  $('btn-news-close').addEventListener('click', async () => {
    if (pendingNews && pendingNews.id) {
      await saveSettings({ newsDismissedId: pendingNews.id });
    }
    closeModal('news-modal');
    renderBanner();
  });

  // ==================== LOGS, GUIDE & SETTINGS ====================

  async function renderLogBox() {
    const diskLog = await window.api.getLogFile().catch(() => '');
    const combined = diskLog || logs.join('\n');
    $('log').textContent = combined || t('logEmpty');
  }

  async function openLogModal() {
    await renderLogBox();
    openModal('log-modal');
  }

  $('set-open-log').addEventListener('click', openLogModal);
  $('btn-copy-log').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('log').textContent || '');
    toast(t('copied'));
  });
  $('btn-clear-log').addEventListener('click', async () => {
    logs.length = 0;
    await window.api.clearLogFile();
    await renderLogBox();
    toast(t('saved'));
  });
  $('btn-reveal-log').addEventListener('click', () => window.api.revealLogFile());

  function openWelcomeDialog(mode = 'welcome') {
    $('welcome-heading').textContent = mode === 'whatsnew'
      ? t('whatsNewTitleModal', { v: appMeta.version })
      : t('welcomeTitle');
    $('welcome-dont-show-wrap').hidden = mode !== 'welcome';
    $('welcome-dont-show').checked = !!S.welcomeSeen;
    openModal('welcome-modal');
  }

  async function closeWelcomeDialog() {
    closeModal('welcome-modal');
    const hideNext = $('welcome-dont-show').checked || !S.welcomeSeen;
    await saveSettings({
      welcomeSeen: hideNext,
      lastSeenVersion: appMeta.version
    });
  }

  $('welcome-start').addEventListener('click', closeWelcomeDialog);
  $('welcome-x').addEventListener('click', closeWelcomeDialog);
  $('open-guide').addEventListener('click', () => openWelcomeDialog('guide'));
  $('open-whatsnew').addEventListener('click', () => openWelcomeDialog('whatsnew'));
  $('btn-check-update-set').addEventListener('click', checkForUpdatesManual);
  $('btn-telegram').addEventListener('click', () => window.api.openExternal('https://t.me/Banafsh_sstp'));

  async function confirmReloadDefaults() {
    const yes = await askConfirm({
      title: t('reloadConfirmTitle'),
      body: t('reloadConfirmBody'),
      okText: t('yes'),
      cancelText: t('no')
    });
    if (!yes) return;
    await saveSettings({
      protocol: 'l2tp',
      theme: 'dark',
      iranSitesEnabled: false,
      customSitesEnabled: true,
      sites: [...DEFAULT_SITES],
      autoReconnect: true,
      autoFailover: true,
      reconnectOnStart: false,
      reconnectDelay: 10,
      reconnectAttempts: 3,
      closeBehavior: 'ask',
      proxyEnabled: false,
      proxyHost: '',
      proxyPort: 8080,
      customDnsEnabled: false,
      customDns: '1.1.1.1',
      l2tpNatT: true,
      saveLogFile: true
    });
    applyTheme();
    applyLang();
    toast(t('defaultsReloaded'));
    await syncBypassIfConnected();
  }

  function renderSettings() {
    $('set-proto-badge').textContent = protoShort(S.protocol);
    $('set-proto-summary').textContent = S.protocol === 'sstp' ? t('protoSstpDesc') : t('protoL2tpDesc');

    $('auto-reconnect').checked = S.autoReconnect !== false;
    $('auto-failover').checked = S.autoFailover !== false;
    $('startup-reconnect').checked = !!S.reconnectOnStart;
    $('reconnect-delay').value = String(S.reconnectDelay || 10);
    $('reconnect-attempts').value = String(S.reconnectAttempts || 3);

    document.querySelectorAll('input[name="close-behavior"]').forEach((r) => {
      r.checked = r.value === (S.closeBehavior || 'ask');
    });

    $('proxy-enabled').checked = !!S.proxyEnabled;
    $('proxy-host').value = S.proxyHost || '';
    $('proxy-port').value = String(S.proxyPort || 8080);

    $('custom-dns-enabled').checked = !!S.customDnsEnabled;
    $('custom-dns').value = S.customDns || '1.1.1.1';
    $('l2tp-natt').checked = S.l2tpNatT !== false;
    $('save-log-file').checked = S.saveLogFile !== false;
  }

  $('theme-dark').addEventListener('click', () => { saveSettings({ theme: 'dark' }); applyTheme(); });
  $('theme-light').addEventListener('click', () => { saveSettings({ theme: 'light' }); applyTheme(); });
  $('theme-system').addEventListener('click', () => { saveSettings({ theme: 'system' }); applyTheme(); });

  $('l-fa').addEventListener('click', () => { saveSettings({ lang: 'fa' }); applyLang(); });
  $('l-en').addEventListener('click', () => { saveSettings({ lang: 'en' }); applyLang(); });

  $('auto-reconnect').addEventListener('change', (e) => { saveSettings({ autoReconnect: e.target.checked }); toast(t('saved')); });
  $('auto-failover').addEventListener('change', (e) => { saveSettings({ autoFailover: e.target.checked }); toast(t('saved')); });
  $('startup-reconnect').addEventListener('change', (e) => { saveSettings({ reconnectOnStart: e.target.checked }); toast(t('saved')); });
  $('reconnect-delay').addEventListener('change', (e) => {
    const n = Math.max(5, Math.min(300, Number(e.target.value) || 10));
    saveSettings({ reconnectDelay: n });
    toast(t('saved'));
  });
  $('reconnect-attempts').addEventListener('change', (e) => {
    const n = Math.max(1, Math.min(10, Number(e.target.value) || 3));
    saveSettings({ reconnectAttempts: n });
    toast(t('saved'));
  });

  document.querySelectorAll('input[name="close-behavior"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      saveSettings({ closeBehavior: e.target.value });
      toast(t('saved'));
    });
  });

  $('save-proxy').addEventListener('click', () => {
    saveSettings({
      proxyEnabled: $('proxy-enabled').checked,
      proxyHost: $('proxy-host').value.trim(),
      proxyPort: Math.max(1, Math.min(65535, Number($('proxy-port').value) || 8080))
    });
    toast(t('saved'));
  });

  $('btn-save-adv').addEventListener('click', () => {
    saveSettings({
      customDnsEnabled: $('custom-dns-enabled').checked,
      customDns: $('custom-dns').value.trim() || '1.1.1.1',
      l2tpNatT: $('l2tp-natt').checked,
      saveLogFile: $('save-log-file').checked
    });
    toast(t('saved'));
  });

  // ==================== NAVIGATION ====================

  function showTab(name) {
    document.querySelectorAll('.screen').forEach((sec) => {
      sec.hidden = sec.id !== 's-' + name;
    });
    document.querySelectorAll('.bottom-nav button').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    $('main-scroll').scrollTop = 0;

    if (name === 'servers') {
      loadServersList(false);
    }
  }

  document.querySelectorAll('.bottom-nav button').forEach((b) => {
    b.addEventListener('click', () => showTab(b.dataset.tab));
  });

  // ==================== CLOSE WINDOW MODAL ====================

  function openCloseModal(data) {
    $('close-modal-message').textContent = data?.connected ? t('closeConnected') : t('closeOffline');
    $('close-keep').textContent = t('keepClose');
    $('close-quit').textContent = t('quitClose');
    $('close-cancel').textContent = t('cancel');
    openModal('close-modal');
  }

  async function resolveCloseChoice(choice) {
    const remember = $('remember-close').checked;
    closeModal('close-modal');
    $('remember-close').checked = false;
    await window.api.closeChoice(choice, remember);
  }

  $('close-keep').addEventListener('click', () => resolveCloseChoice('keep'));
  $('close-quit').addEventListener('click', () => resolveCloseChoice('quit'));
  $('close-cancel').addEventListener('click', () => resolveCloseChoice('cancel'));
  $('close-modal-x').addEventListener('click', () => resolveCloseChoice('cancel'));
  window.api.onCloseRequest(openCloseModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('close-modal').hidden) resolveCloseChoice('cancel');
      else if (!$('confirm-modal').hidden) $('confirm-cancel').click();
      else {
        ['protocol-modal', 'manual-modal', 'qr-send-modal', 'qr-scan-modal', 'profiles-modal', 'log-modal'].forEach((id) => {
          if (!$(id).hidden) closeModal(id);
        });
      }
    }
  });

  // ==================== STARTUP OVERLAY ====================

  const startup = $('startup');
  const startupShownAt = Date.now();
  let startupHidden = false;

  function applyStartup(ev) {
    if (!ev || !startup) return;
    const p = Math.max(0, Math.min(100, Number(ev.percent) || 0));
    $('startup-bar').style.width = p + '%';
    $('startup-percent').textContent = p + '%';
    if (ev.text) $('startup-text').textContent = ev.text;
    if (p >= 100 && !startupHidden) {
      startupHidden = true;
      const wait = Math.max(0, 900 - (Date.now() - startupShownAt));
      setTimeout(() => {
        startup.classList.add('hidden');
        setTimeout(() => { try { startup.remove(); } catch {} }, 400);
      }, wait + 120);
    }
  }
  window.api.onStartup(applyStartup);
  window.api.startupGet().then(applyStartup).catch(() => {});

  // ==================== MAIN PROCESS EVENTS ====================

  window.api.onEvent((ev) => {
    if (!ev) return;
    switch (ev.type) {
      case 'connected':
      case 'reconnected':
        connected = true;
        busy = false;
        busyReason = '';
        renderHome();
        renderServersView();
        if (ev.type === 'reconnected') toast(`${t('connectedTo')} ${shortHost(ev.host)}`);
        break;

      case 'speed':
        liveDownBps = Number(ev.downBps) || 0;
        liveUpBps = Number(ev.upBps) || 0;
        if (ev.ip) tunnelIp = ev.ip;
        if (connected && !busy) {
          $('speed-down').textContent = formatBytesPerSec(liveDownBps);
          $('speed-up').textContent = formatBytesPerSec(liveUpBps);
          if (tunnelIp) {
            $('tunnel-ip').hidden = false;
            $('tunnel-ip').textContent = `IP: ${tunnelIp}`;
          }
        }
        break;

      case 'connectionLost':
        connected = false;
        tunnelIp = '';
        liveDownBps = 0;
        liveUpBps = 0;
        busy = S.autoReconnect !== false;
        busyReason = 'reconnecting';
        reconnectingText = t('reconnecting');
        renderHome();
        toast(t('connectionLost'));
        break;

      case 'waitingNetwork':
        connected = false;
        busy = true;
        busyReason = 'waitingNet';
        renderHome();
        break;

      case 'reconnecting':
        connected = false;
        busy = true;
        busyReason = 'reconnecting';
        reconnectingText = `${t('reconnecting')} (${t('reconnectAttempt')} ${ev.attempt} ${t('of')} ${ev.attempts})`;
        renderHome();
        break;

      case 'switchingServer':
        connected = false;
        busy = true;
        busyReason = 'switching';
        renderHome();
        toast(t('failoverToast'));
        break;

      case 'reconnectFailed':
        connected = false;
        busy = false;
        busyReason = '';
        renderHome();
        toast(t('reconnectFailed'));
        break;

      case 'settings':
        if (ev.settings) {
          const prevProto = S.protocol;
          S = { ...S, ...ev.settings };
          if (!Array.isArray(S.sites)) S.sites = [...DEFAULT_SITES];
          if (S.protocol !== prevProto) {
            loadedProtocol = null;
            currentCountry = null;
          }
          applyTheme();
          renderSettings();
          renderBypass();
          renderHome();
          renderServersView();
        }
        break;

      case 'iranRangesUpdated':
        if (ev.count) {
          iranRangesCount = ev.count;
          renderBypass();
        }
        break;

      case 'systemTheme':
        appMeta.systemDark = !!ev.systemDark;
        applyTheme();
        break;

      case 'status':
        connected = !!ev.connected;
        if (!connected) {
          tunnelIp = '';
          liveDownBps = 0;
          liveUpBps = 0;
        }
        busy = false;
        busyReason = '';
        renderHome();
        renderServersView();
        break;

      case 'connectionError':
        connected = false;
        busy = false;
        busyReason = '';
        renderHome();
        toast(ev.errorCode === 'L2TP_NO_RESPONSE' ? t('l2tpNoResponse') : t('fail'));
        break;

      case 'pickServerNeeded':
        showTab('servers');
        break;

      case 'triggerUpdateCheck':
        checkForUpdatesManual();
        break;

      case 'updateProgress':
        if (downloadingUpdate) {
          const p = Math.max(0, Math.min(100, Number(ev.percent) || 0));
          $('update-dl-bar').style.width = p + '%';
          $('update-dl-label').textContent = t('updateDownloading', { p });
        }
        break;

      case 'updateAvailable':
        if (ev.info) {
          pendingUpdate = ev.info;
          renderBanner();
          if ($('welcome-modal').hidden) openUpdateModal(ev.info);
        }
        break;

      case 'newsAvailable':
        if (ev.item) {
          pendingNews = ev.item;
          renderBanner();
          if ($('welcome-modal').hidden && $('update-modal').hidden) openNewsModal(ev.item);
        }
        break;

      case 'log':
        if (ev.line) {
          logs.push(ev.line);
          if (logs.length > 250) logs.shift();
          if (!$('log-modal').hidden) $('log').textContent = logs.join('\n');
        }
        break;
    }
  });

  // ==================== INITIALIZE ====================

  (async () => {
    try {
      const [info, saved, bpInfo] = await Promise.all([
        window.api.appInfo().catch(() => appMeta),
        window.api.get().catch(() => ({})),
        window.api.bypassInfo().catch(() => ({ iranCount: 0 }))
      ]);
      appMeta = { ...appMeta, ...info };
      S = { ...S, ...(saved || {}) };
      if (!Array.isArray(S.sites)) S.sites = [...DEFAULT_SITES];
      iranRangesCount = Number(bpInfo?.iranCount) || 0;

      applyTheme();
      applyLang();
      showTab('home');

      connected = await window.api.status().catch(() => false);
      renderHome();

      if (!S.welcomeSeen) {
        openWelcomeDialog('welcome');
      } else if (S.lastSeenVersion && S.lastSeenVersion !== appMeta.version) {
        openWelcomeDialog('whatsnew');
        saveSettings({ lastSeenVersion: appMeta.version });
      } else {
        saveSettings({ lastSeenVersion: appMeta.version });
        // Check cached news / updates
        window.api.checkNews().then((r) => {
          if (r && r.item && S.newsDismissedId !== r.item.id) {
            pendingNews = r.item;
            renderBanner();
          }
        }).catch(() => {});
      }
    } catch (e) {
      pushLog('init error: ' + (e.message || e));
    }
  })();
})();

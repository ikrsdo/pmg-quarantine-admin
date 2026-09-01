# Değişiklik Günlüğü

[English](CHANGELOG.md) | Türkçe

Bu projedeki tüm önemli değişiklikler burada belgelenir. Format gevşek
bir şekilde [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)'u,
sürümleme ise [Semantic Versioning](https://semver.org/)'i takip eder -
proje `0.x` sürümündeyken, minor sürüm artışları da geriye dönük
uyumsuz değişiklikler içerebilir.

## [Yayınlanmamış]

### Eklenenler

- Girişten sonra açılan yeni bir Dashboard ekranı, artık ilk açılış
  sayfası. Karantina hacim grafiği (24 saat/7 gün geçişli), en çok
  karantinaya düşen gönderenler listesi ve Tracking Center durum
  dağılımı widget'ı içeriyor; hiçbiri harici bir grafik kütüphanesi
  eklemeden, düz CSS çubuk grafikleriyle yapıldı.
- Karantina ve Tracking Center arasında en-iyi-çaba (best-effort)
  çapraz bağlantı: Karantina detay sayfasındaki "Search in Tracking
  Center" ve Tracking Center detay sayfasındaki "Search in
  Quarantine" butonları, ilgili kaydın gönderen/alıcı bilgisi ve zaman
  damgası etrafında ±15 dakikalık bir pencereyle filtrelenmiş diğer
  listeye götürüyor. Bu kesin bir eşleşme garantisi değil, en-iyi-çaba
  bir eşleştirmedir - PMG'nin Karantina ve Tracking Center API'leri
  ortak bir kimlik alanı paylaşmıyor.
- Hem Karantina hem Tracking Center filtre modallarının içinde
  "Saved Filters" - sık kullanılan zaman aralıkları için hızlı
  butonlar (Karantina: son 24 saat/7 gün; Tracking Center: son 24
  saat/7 gün, NDR/Reddedilenler, Greylist).
- Hem Karantina hem Tracking Center liste sayfalarında, o an
  filtrelenmiş satırları dışa aktaran bir CSV export butonu.
- README artık Login, Karantina ve Tracking Center ekranlarının
  masaüstü ve mobil görüntülerini içeren bir Ekran Görüntüleri
  bölümüne sahip.
- README artık en son sürüme nasıl güncelleneceğini belgeliyor
  (`git pull && docker compose up -d --build`), ve Kurulum
  bölümündeki `git clone` komutu artık yer tutucu yerine gerçek
  repository adresini kullanıyor.
- Dashboard'a "Top Senders" yanına, Tracking Center'ın son 7 gününde
  en çok görünen alıcıları sıralayan bir "Top Receivers" widget'ı
  eklendi.
- Tracking Center detay sayfasındaki "From" alanının altına, bu
  değerin Postfix tarafından kaydedilen zarf (envelope) göndereni
  olduğunu ve mesajın header From adresinden farklı olabileceğini
  (örn. `bounce.xxx=...@...` gibi bounce/VERP adresleri) açıklayan
  kısa bir not eklendi. Tracking Center'ın API'si her zaman sadece bu
  tek zarf-seviyesi alanı sağlıyor - yanına gösterilebilecek ayrı bir
  header-From verisi mevcut değil.
- Tracking Center listesindeki Status kolonu artık diğer kolonlar gibi
  sıralanabiliyor - sıralama, ham PMG durum koduna göre değil, ekranda
  gösterilen durum etiketine göre yapılıyor (örn. "Delivered",
  "Quarantined").
- Tracking Center'ın filtre modalına, listeyi tek bir teslimat/alım
  durumuna göre daraltan bir "Status" açılır menüsü eklendi (örn.
  Quarantined, Bounced, Rejected) - bu, zaten çekilmiş zaman aralığı
  üzerinde istemci tarafında yapılan bir filtre, çünkü Tracking
  Center API'sinin kendisinde bir status sorgu parametresi yok.

### Değişenler

- Dashboard hem mobil hem masaüstünde daha modern görünmesi için
  yeniden tasarlandı: mevcut widget'ların üstüne "Last 7 days" özet
  kart şeridi eklendi (Quarantined, Tracked mail, Unique senders, Top
  status), masaüstünde tek sütun yerine 2 sütunlu widget grid'i
  kullanılıyor, ve her widget kartı artık renkli bir sol-kenar
  şeridi, hafif arka plan/gölge ve düz tek renk yerine gradyan bar
  dolgularıyla gösteriliyor. Veri veya widget içeriği değişmedi,
  sadece yerleşim ve görsel stil değişti.
- Dashboard'daki "Quarantine Volume" grafiği artık varsayılan olarak
  7 gün görünümünü gösteriyor (24 saat değil); 24 saat/7 gün geçişi
  aynı şekilde duruyor, kullanıcı isterse değiştirebiliyor.
- Dashboard'daki "Top Senders" widget'ı artık gönderenleri Karantina
  listesi yerine Tracking Center'ın genel posta trafiğinden
  sıralıyor - böylece sadece en çok karantinaya düşen değil, genel
  olarak en çok posta gönderen kim onu yansıtıyor (yukarıdaki yeni
  "Top Receivers" widget'ı da aynı Tracking Center kaynağını
  kullanıyor).
- Dashboard'daki "Tracking Center Status Distribution" bölümü
  "Message Delivery Status" olarak yeniden adlandırıldı - davranış
  değişikliği yok, sadece daha anlaşılır bir başlık.
- Dashboard'ın karantina/tracking sorguları artık 60 saniyelik bir
  `staleTime` ve dakikaya yuvarlanmış bir zaman penceresi kullanıyor,
  böylece Dashboard'dan uzaklaşıp bir dakika içinde geri dönmek 7
  günlük tracking verisini tekrar çekmek yerine zaten alınmış veriyi
  yeniden kullanıyor. Girişten sonraki ilk yükleme yine bu verinin
  gerçek maliyetine katlanıyor.

### Düzeltmeler

- Tracking Center detay sayfasındaki "Search in Quarantine" butonu
  artık sadece kaydın durumu gerçekten "Quarantined" (`Q`) olduğunda
  görünüyor - daha önce Delivered/Bounced/Rejected/Blocked gibi
  karantinada asla olamayacak kayıtlar dahil her kayıtta gösteriliyordu.
- "Saved Filters" ön tanımlı filtre butonları (Karantina ve Tracking
  Center) artık o an aktif olan ön ayarı vurguluyor, böylece hangi
  hızlı filtrenin (varsa) uygulandığı bir bakışta anlaşılıyor.
- Tracking Center'ın tarih ön ayarları ("Last 24h"/"Last 7 days")
  artık tıklandığında NDR/Greylist onay kutularını temizliyor - daha
  önce NDR veya Greylist seçildikten sonra bir tarih ön ayarına
  basıldığında, filtre panelinde hiçbir gösterge olmamasına rağmen
  NDR/Greylist sessizce uygulanmış kalıyordu.
- `CollapsibleSection` bileşeninin tıklanabilir başlığı bir `<button>`
  elemanıydı; bir widget `right` slotuna etkileşimli bir kontrol
  geçtiğinde (ör. Dashboard hacim grafiğindeki 24 saat/7 gün geçiş
  butonları) bu, bir `<button>` içine iç içe geçmiş geçersiz bir
  `<button>` ve bir React hydration uyarısı üretiyordu. Başlık artık
  bir `<button>` yerine `role="button"` özellikli bir `<div>`.
- Karantina CSV export'unda "Sender" kolonu boş geliyordu (PMG'nin
  genelde boş olan `sender` alanını, uygulamanın genelindeki
  `sender || from` yedeklemesi olmadan doğrudan okuyordu). Bu kolon
  artık bu yedeklemeyi kullanan "From" oldu, ve yanına PMG'nin liste
  uç noktasında bulunmayan (sadece mesaj detayında bulunan)
  "Envelope Sender" kolonu satır başına ayrı bir istekle eklendi.
  "Time" ve "Size" kolonları artık ham unix zaman damgası ve bayt
  sayısı yerine okunabilir formatta (`gg/aa/yyyy, sa:dk:sn` ve KB).
- Tracking Center CSV export'undaki "Time" ve "Size" kolonları da
  ham unix zaman damgası/bayt cinsindeydi, artık Karantina'dakiyle
  aynı şekilde formatlanıyor. "Delivery Status"/"Receive Status"
  PMG'nin ham durum kodunu (`2`, `5`, `N`, `B` vb.) export ediyordu,
  bunun yerine artık uygulamadaki durum rozetinde gösterilen aynı
  etiketi export ediyor (ör. "Delivered", "Bounced", "Blocked").
- Önceki İngilizce çeviri geçişinde gözden kaçan iki Türkçe buton
  ipucu ("CSV'ye Aktar", her iki liste sayfasında da) "Export CSV"
  olarak düzeltildi.
- Dashboard'daki Quarantine Volume/Top Senders/Status Distribution
  widget'ları, 24 saat/7 gün seçicisinden bağımsız olarak her zaman
  boş görünüyordu. Her iki widget'ın sorgusu da sadece `starttime`
  gönderip `endtime`'ı boş bırakıyordu; PMG'nin API'si `endtime`
  gönderilmediğinde bunu "şimdi" değil `starttime + 24 saat` olarak
  varsayıyor - bu yüzden 7 gün öncesine ayarlı bir `starttime`,
  aslında bir hafta önceki tek bir 24 saatlik pencereyi sorguluyordu,
  şimdiye kadar uzanan 7 günlük aralığı değil. Her iki sorgu da artık
  açık bir `endtime` gönderiyor. Ayrıca diğer sayfalarda zaten var olan
  PMG bileti süresi dolduğunda login'e yönlendirme davranışı Dashboard'a
  da eklendi - önceden başarısız bir Dashboard sorgusu yanıltıcı boş
  durumu gösteriyordu, login ekranına dönmek yerine.
- Yukarıdaki `endtime` düzeltmesinden sonra Dashboard çok yavaş
  yükleniyormuş gibi hissettiriyordu: `starttime`/`endtime` bileşen
  gövdesinde her render'da (memoize edilmeden) yeniden hesaplanıyordu,
  bu yüzden bir saniye sınırını aşan herhangi bir yeniden render yeni
  bir değer üretiyor, bu da sorgunun önbellek anahtarını değiştirip
  yepyeni bir istek tetikliyor - bu da başka bir yeniden render'a yol
  açıyor, o da başka bir saniye sınırını aşabiliyor, ve bu böyle devam
  ediyordu. Bu hata `endtime` düzeltmesinden önce de vardı, ama eski,
  yanlışlıkla dar sorgular neredeyse anında döndüğü için görünmüyordu;
  sorgular gerçek 7 günlük veriyi döndürmeye başlayınca (istek başına
  daha yavaş), her yeniden sorgunun bir saniye sınırını aşması için
  daha fazla zamanı oldu, bu da tekrarlanan `/api/quarantine` ve
  `/api/tracking` isteklerinden oluşan görünür bir zincire dönüştü.
  `starttime`/`endtime` artık her render'da değil, mount'ta bir kez
  `useMemo` ile hesaplanıyor.

## [0.4.1] - 2026-08-31

### Değişenler

- Tracking Center detayındaki "Message Events" zaman çizelgesi, daha
  önce her içerik filtresi (`pmg-smtp-filter`) log satırını, satır
  PMG'nin antispam/politika kurallarından biriyle eşleşen bir postayı
  kaydetse bile (`... (rule: <kural adı>)`), genel bir "Log" olayı
  olarak gösteriyordu. Bunlar artık kendi "Policy Match" kategorisine
  sahip ve eşleşen kuralın adını gösteriyor.
- Favicon artık login sayfasında kullanılanla aynı Lucide Shield
  ikonuna sahip mavi bir rozet - ilgisiz, soyut bir logo yerine.
- Tracking Center detayındaki "Message Events" zaman çizelgesi artık
  genel "Log" kategorisini göstermiyor - tanınan bir olay türüyle
  eşleşmeyen satırlar artık yapılandırılmış görünümden tamamen
  çıkarılıyor, çünkü ham log (aynı bölümdeki geçiş düğmesi) zaten
  yapılandırılmamış satırlar dahil her satırı içeriyor.

## [0.4.0] - 2026-08-31

### Güvenlik

- `/api/login`, PMG kimlik bilgisi kaba kuvvet saldırılarına karşı
  artık hız sınırlı (IP başına 15 dakikada 20 deneme) - mevcut bir
  oturum olmadan erişilebilen tek uç nokta bu olduğu için.
- Güvenlik yanıt başlıkları ([Helmet](https://helmetjs.github.io/)
  aracılığıyla) artık her yanıtta ayarlanıyor - `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Powered-By`
  başlığının kaldırılması, vb. (CSP kapalı bırakıldı, çünkü frontend
  iOS backdrop-blur düzeltmesi ve login sayfasının gradyan arka planı
  için satır içi `style` özniteliklerine dayanıyor).
- Karantinadaki postanın HTML önizleme uç noktası artık kendi
  `Content-Security-Policy: sandbox` başlığını da gönderiyor - biri
  tarayıcıyı doğrudan o URL'ye yönlendirirse buna karşı ek bir savunma
  katmanı olarak (frontend'in kendi sandbox'lanmış iframe kullanımı
  bundan etkilenmiyor).
- Docker imajı artık root yerine root olmayan bir kullanıcı olarak
  çalışıyor.
- README artık uygulamanın kimlik bilgisi işleme, oturum hijyeni,
  backend sertleştirme ve ağ duruşunu belgeleyen tam bir "Security
  Notes" bölümüne sahip, ve artık "erken geliştirme" uyarısını
  taşımıyor.

### Değişenler

- Karantina detayındaki "Spam Score" ve "Spam Test Details"
  bölümleri, ve Tracking Center detayındaki "Status" ve "Message
  Events" bölümleri, artık hem mobilde hem masaüstünde daraltılabilir
  akordeonlar (Spam Score ve Status varsayılan olarak açık, Spam Test
  Details ve Message Events kapalı).
- Karantina filtre penceresindeki "Alıcı e-postası" alanı artık düz
  bir select yerine aranabilir bir açılır liste, böylece uzun bir
  alıcı listesi kaydırmak yerine yazarak filtrelenebiliyor.
- Karantina detayındaki "Spam Test Details" bölümü artık spam test
  dökümünü düz metin olarak kopyalayan bir "Copy" düğmesine sahip.
- Görsel tutarlılık için, Karantina ve Tracking Center detay
  sayfalarının bölüm başlıklarındaki tüm aksiyon düğmeleri - Spam Test
  Details'in "Copy" düğmesi, ve Message Events'in "Copy Log" ve "Show
  Raw Log" düğmeleri - artık hem mobilde hem masaüstünde başlığı
  sıkıştırmak yerine başlığın altında kendi satırlarında duruyor.
  Başlığın kendisi artık yalnızca kendi adını gösteriyor (Spam Score
  ve Status için rozetiyle birlikte).
- Login sayfası daha derli toplu: form artık gerçek bir kart içinde
  (kenarlık, gölge, arka plan), başlığın üzerinde bir kalkan ikonu
  var, giriş alanlarının görünür bir odak halkası var, şifre alanının
  göster/gizle geçişi var, hata mesajının eşleşen bir ikonu var, ve
  "Sign in" düğmesi gönderim sırasında bir yükleniyor animasyonu
  gösteriyor - hem mobilde hem masaüstünde.

### Düzeltmeler

- Tracking Center detayındaki "Message Events" zaman çizelgesi,
  syslog zaman damgaları klasik Postfix syslog formatı yerine
  (`Aug 29 15:10:01`) ISO 8601 olan (`2026-08-30T14:34:09.659617+03:00`)
  PMG kurulumlarında, her log satırını tarihsiz, genel bir "Log" olayı
  olarak gösteriyordu. Satır ayrıştırıcısının regex'i yalnızca klasik
  formatı tanıyordu, bu yüzden her satır sessizce eşleşmiyor ve
  genel/tarihsiz duruma düşüyordu. Her iki zaman damgası formatını da
  tanıyarak ve ISO olanı görüntüleme için biçimlendirerek düzeltildi
  (`30/08, 14:34:09`) - Received/Queued/Processed/Delivered vb. artık
  tekrar doğru şekilde kategorize ediliyor.
- Karantina filtre penceresindeki "Alıcı e-postası" aranabilir açılır
  liste, penceresinin alt kenarına boşluksuz yapışık render
  ediliyordu. Açılır liste mutlak konumlandırılmıştı, bu yüzden
  penceresinin kendi (daha kısa) düzen yüksekliğini etkilemiyordu, ve
  penceresinin `overflow-y-auto` özelliği açılır listeyi tam o
  yükseklikte kırpıyordu. Açılır listenin normal belge akışında render
  edilmesi sağlanarak düzeltildi, böylece altındaki alanları aşağı
  itiyor ve pencere artık onu tam olarak sığdıracak şekilde büyüyor.
- Safari'de (mobil ve masaüstü), Karantina filtre penceresindeki
  aranabilir açılır listeden bir e-posta seçmek değeri ayarlıyor ama
  listeyi açık bırakıyor, altındaki Start/End tarih alanlarını
  engelliyordu. "Alıcı e-postası" alanı, açılır liste widget'ının
  tamamını (geçiş düğmesi, arama girişi ve her seçenek düğmesi) tek
  bir `<label>` içine sarıyordu; Safari'nin örtük label-to-control tık
  yönlendirmesi, seçimin kendi tık işleyicisi onu kapattıktan hemen
  sonra açılır listeyi yeniden açıyordu. Tek bir form kontrolü yerine
  özel bir widget'ı sardığı için o alanda `<label>` yerine düz bir
  `<div>` kullanılarak düzeltildi.

## [0.3.0] - 2026-08-30

### Eklenenler

- Karantina ve Tracking Center liste araç çubukları (mobil ve
  masaüstü) artık listeyi talep üzerine yeniden getiren bir Refresh
  düğmesine sahip, istek devam ederken dönen bir ikonla birlikte.
- Karantina liste/detay ve Tracking Center liste aksiyonları artık bir
  toast bildirimi gösteriyor (Deliver, Block, Whitelist ve hatalar),
  hem mobilde hem masaüstünde ekranın altına sabitlenmiş. Her toast 5
  saniye sonra otomatik kapanıyor ve altında kalan süreyi gösteren
  küçülen bir ilerleme çubuğu var.

### Değişenler

- Filter ve Tracking filtre pencereleri, ve onay diyaloğu, artık
  açıkken arkalarındaki sayfayı bulanıklaştırıyor (mobil ve masaüstü),
  ve mobilde filtre pencereleri alttan açılan bir sayfa yerine ekranın
  ortasında açılıyor.
- Deliver ve Whitelist artık, Block için zaten kullanılan aynı diyalog
  üzerinden onay gerektiriyor; hem Karantina listesinde (tablo satırı,
  toplu seçim çubuğu ve mobil kaydırma aksiyonları) hem detay
  sayfalarında, mobil ve masaüstünde. Daha önce yalnızca Block onay
  gerektiriyordu.
- Karantina ve Tracking Center arama alanı yer tutucuları, gereksiz
  "Search" kelimesini kaldırdı - artık "Subject or Sender…" ve
  "Sender or Recipient…".
- Mobilde, Karantina ve Tracking Center liste araç çubuklarındaki
  Filter, Select, Refresh ve tema geçiş düğmeleri artık yalnızca
  ikonlarını gösteriyor (metin etiketi yok), arama kutusu için yer
  açarak. Masaüstü bundan etkilenmiyor - etiketler orada hâlâ
  gösteriliyor.
- Karantina ve Tracking Center detay sayfalarındaki Geri düğmesi artık
  (uygulamanın diğer araç çubuğu düğmeleriyle eşleşen) kenarlıklı bir
  düğme, düz metin yerine - böylece tıklanabilir bir kontrol olarak
  net şekilde okunuyor.
- Mobil Karantina kartı artık alıcı adresini gösteriyor (Tracking
  Center'ın `→ recipient@…` satırına benzer stilde), ve mobil Tracking
  Center kartı artık zaman damgasının yanında mesaj boyutunu
  gösteriyor - ikisi de daha önce yalnızca masaüstünde vardı veya
  yoktu.
- Mobilde, Tracking Center detayındaki Message Events bölümünün "Copy
  Log" ve "Show Raw Log" düğmeleri artık "Message Events" başlığının
  yanında yer için rekabet etmek yerine kendi satırlarında; masaüstü
  onları satır içinde tutuyor. Her iki etiket de artık cümle
  büyük/küçük harf yerine başlık büyük/küçük harfte ("Copy Log", "Show
  Raw Log").
- Karantina ve Tracking Center filtre pencereleri, ve Karantina
  "Block" onay diyaloğu, artık yalnızca kendi Close/Cancel
  düğmeleriyle değil, Escape tuşuyla veya pencerenin dışına
  tıklanarak da kapanıyor.
- Masaüstünde, Karantina listesindeki bir mesaja veya Tracking Center
  listesindeki bir kayda tıklamak, artık ayrı bir tam sayfaya gitmek
  yerine detay görünümünü liste üzerinde sağdan açılan bir çekmece
  olarak açıyor (X düğmesi, Escape veya dışına tıklamayla
  kapatılabilir). Liste altta bağlı kalıyor, böylece kapandığında
  filtreler, sıralama ve kaydırma konumu korunuyor. Bir mesaja/kayda
  doğrudan bir bağlantı (veya sayfa yenileme) hâlâ eskisi gibi tam,
  bağımsız detay sayfasını açıyor.
- Tracking Center detayının ham syslog dökümü artık bir "Message
  Events" zaman çizelgesi olarak sunuluyor: her satır kategorize
  ediliyor (Received, Queued, Processed, Delivered, Deferred,
  Bounced, Rejected, Greylisted, veya genel bir Log geri dönüşü) sade
  bir dille özetle birlikte, ve orijinal syslog satırını görmek için
  genişletilebiliyor. Bir "Show raw log" geçiş düğmesi önceki düz
  metin görünümüne geri dönüyor.
- Tracking Center çekmecesindeki "Status" ve "Message Events" bölüm
  başlıkları, ve Karantina çekmecesindeki "Spam Score" ve "Spam Test
  Details" bölüm başlıkları, artık küçük, soluk metin yerine kalın ve
  bir ayırıcı çizgiyle - böylece bir bakışta bölüm başlığı olarak
  okunuyor.
- Tracking Center çekmecesindeki "Show raw log" geçişi artık gerçek
  bir düğme olarak stillendirildi (önceden metin bağlantısıydı), ve
  ham syslog'u panoya kopyalayan yeni bir "Copy log" düğmesinin
  yanında duruyor.
- Karantina çekmecesindeki Headers sekmesi artık ham mesaj başlıklarını
  panoya kopyalayan bir "Copy" düğmesine sahip.

### Düzeltmeler

- Karantina detayının Preview sekmesi, bir e-posta istemcisinin
  göstereceği şekilde değil, ham, hâlâ MIME kodlu mesaj kaynağını
  (quoted-printable metin, render edilmemiş HTML/CSS) gösteriyordu.
  Artık PMG'nin kendi temizlenmiş HTML render uç noktasından
  (`/api2/htmlmail/...`) alınıp sandbox'lanmış bir iframe içinde
  render ediliyor; ham kaynak artık arayüzde hiçbir yerde
  gösterilmiyor.
- Mobilde, uygulama başlığı (ad/sürüm ve giriş yapmış kullanıcı adı)
  ve Tracking Center kart listesi, kullanıcı adı veya bir gönderen/
  alıcı adresi uzun olduğunda ekranın sağ kenarını aşıp yatay
  kaydırmaya zorlayabiliyordu. İkisi de metin öğeleri `min-w-0`'dan
  yoksun flex satırlardı, bu yüzden doğal metin genişliklerinin
  altına küçülmeyi/kırpılmayı reddediyorlardı. Bu öğelere `min-w-0`
  (ve eksik olan yerlerde `truncate`) verilerek düzeltildi, böylece
  görüntü alanını genişletmek yerine içinde küçülüp üç nokta ile
  kısaltılıyorlar.
- Mobil Safari'de, Filter/Tracking filtre pencerelerinin ve onay
  diyaloğunun arkasındaki bulanıklaştırma, altındaki CSS doğru olsa
  bile render edilmiyordu. iOS Safari, kendi GPU compositing katmanı
  olmadıkça `position: fixed` bir öğede `backdrop-filter`'ı sessizce
  atlıyor. Üç modal arka planında `transform: translateZ(0)` ile bir
  tane zorlanarak düzeltildi.
- Mobilde, herhangi bir form alanına odaklanmak (login kullanıcı adı/
  şifre, arama kutuları, filtre alanları) sayfanın kayıyormuş/
  yakınlaşıyormuş gibi görünmesine ve yatay taşmaya neden olabiliyordu.
  iOS Safari, odaklanılan bir girişin `font-size`'ı 16px'in altındaysa
  görüntü alanını otomatik yakınlaştırıyor; birkaç giriş `text-sm`
  (14px) kullanıyordu. `640px` kesme noktasının altındaki tüm
  `input`/`select`/`textarea` öğelerinde `font-size: 16px`
  zorlanarak düzeltildi.
- Uygulamanın bir web app manifest'i veya iOS "ana ekrana ekle" meta
  etiketleri yoktu, bu yüzden Safari'nin "Add to Home Screen"
  özelliğiyle yüklemek yalnızca tam bir tarayıcı sekmesinde (Safari
  adres çubuğu ve araç çubuğuyla) açılan bir yer imi oluşturuyordu,
  bağımsız bir PWA yerine. Bu ayrıca sabit alt aksiyon çubuklarının
  (Karantina toplu seçim çubuğu, detay sayfası aksiyon çubuğu)
  tarayıcının kendi alt araç çubuğunun altında kalıp yalnızca üst
  kenarlarının görünmesine, ve Karantina listesi, Tracking Center
  listesi ve her iki detay sayfasındaki sabit üst başlığın iOS durum
  çubuğu/çentik/Dynamic Island'ın altında render edilmesine yol
  açıyordu. Bir web app manifest'i, `apple-touch-icon` ve iOS PWA meta
  etiketleri eklenerek, artı bu sabit başlıkların ve her iki sabit alt
  aksiyon çubuğunun bağımsız çalışırken durum çubuğu/home indicator'ı
  temizlemesi için `safe-area-inset` dolgusu eklenerek düzeltildi.
  Bunun etkili olması için zaten yüklenmiş bir Ana Ekran ikonunun
  silinip yeniden eklenmesi gerekir, çünkü iOS bu etiketleri yalnızca
  yükleme anında okur.
- Masaüstünde, Karantina liste tablosu satırlarındaki Deliver ve Block
  düğmelerinin üzerine gelmek, işaretçi yerine varsayılan ok imlecini
  koruyordu. Tailwind v4, kullanılan preflight'ın `button { cursor:
  pointer }` kuralını kaldırdı. `index.css` içinde genel olarak
  yeniden eklenerek düzeltildi.

## [0.2.0] - 2026-08-29

### Eklenenler

- Uygulama sürüm numarası artık arayüzün kendisinde gösteriliyor
  (masaüstünde kenar çubuğu, mobilde başlık), `package.json`'dan
  alınıyor.
- Karantina ve Tracking Center masaüstü tabloları artık sıralanabilir
  sütunlara sahip (bir başlığa tıklayınca sırala, tekrar tıklayınca
  tersine çevir), PMG'nin kendi liste davranışıyla eşleşerek.
- Uygulama genelinde (gezinme, araç çubuğu, aksiyon düğmeleri, tema
  geçişi, geri bağlantıları) daha derli toplu, profesyonel bir görünüm
  için [Lucide](https://lucide.dev) ikon seti benimsendi.
- Karantina ve Tracking Center masaüstü tabloları artık her mesajın
  boyutunu KB cinsinden gösteriyor.

### Değişenler

- Masaüstü kenar çubuğu, ve Karantina ile Tracking Center liste
  sayfalarındaki arama/filtre araç çubuğu ve tablo başlıkları, artık
  yerinde sabit kalıyor - yalnızca liste/tablo içeriği altlarında
  kaydırılıyor.
- Karantina ve Tracking Center masaüstü tabloları artık okunabilirlik
  için zebra desenli satırlar ve daha belirgin bir başlık satırı
  (gölgeli arka plan, daha kalın büyük harfli etiketler, daha güçlü
  alt kenarlık) kullanıyor.
- Tracking Center artık, zaman aralığı istenmediğinde PMG'nin örtük
  ~24 saatlik varsayılanı yerine PMG'nin kendi arayüz davranışını
  varsayılan alıyor - sayfa yüklenmeden bir saat önceden, günün
  gece yarısına kadar.
- Karantina listesi artık, zaman aralığı istenmediğinde PMG'nin örtük
  ~24 saatlik varsayılanı yerine son 7 günü varsayılan alıyor (PMG'nin
  kendi arayüz varsayılanıyla eşleşerek).
- Karantina "alıcı e-postası" filtresi artık serbest metin alanı
  yerine, o an karantinada bulunan farklı alıcı adreslerinden oluşan
  "Tümü" artı bir açılır liste.
- Masaüstü kenar çubuğu daha geniş, ve giriş yapmış hesap adı artık
  (uygulama başlığının altında) en üste yakın duruyor, alt yerine.

## [0.1.0] - 2026-08-29

### Eklenenler

- İlk sürüm: karantina yönetimi (listele/ara/filtrele, teslim et,
  beyaz listeye al, engelle), Tracking Center (salt okunur sorgu),
  yönetici başına PMG girişi (Help Desk rolü, ortak servis hesabı
  yok), koyu/açık tema, yüklenebilir PWA.
- Docker paketleme: tek çok aşamalı `Dockerfile`, hem `/api/*` hem de
  derlenmiş frontend'i sunan tek bir Express süreci.

### Düzeltmeler

- Uygulama TLS'i sonlandıran bir reverse proxy/tünel arkasında
  (örn. Cloudflare Tunnel) çalışırken login oturum çerezi hiçbir zaman
  tarayıcıya geri gönderilmiyordu. Express, proxy'nin
  `X-Forwarded-Proto` başlığına güvenmiyordu, bu yüzden `req.secure`
  `false` kalıyordu ve `express-session`, `cookie.secure: true` olan
  oturum çerezi için sessizce `Set-Cookie`'yi atlıyordu.
  `app.set('trust proxy', 1)` ayarlanarak düzeltildi.

### Değişenler

- Tüm frontend arayüz metinleri ve proje belgeleri (`README.md`,
  `CLAUDE.md`, backend README, Docker Compose yorumları) Türkçe'den
  İngilizce'ye çevrildi, ve orijinal dağıtım ortamına özgü referanslar
  genelleştirildi.

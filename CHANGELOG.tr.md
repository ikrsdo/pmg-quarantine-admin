# Değişiklik Günlüğü

[English](CHANGELOG.md) | Türkçe

Bu projedeki tüm önemli değişiklikler burada belgelenir. Format gevşek
bir şekilde [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)'u,
sürümleme ise [Semantic Versioning](https://semver.org/)'i takip eder -
proje `0.x` sürümündeyken, minor sürüm artışları da geriye dönük
uyumsuz değişiklikler içerebilir.

## [0.9.4] - 2026-09-04

### Değiştirildi

- "Actions" (Aksiyonlar) menüsü (mobil alt çubuk, masaüstü başlığı,
  masaüstü çekmece başlığı) artık ortalanmış bir modal yerine
  tetikleyici butona bağlı bir dropdown olarak açılıyor - dışarı
  tıklanınca veya Escape'e basılınca kapanıyor. Mobil tetikleyici alt
  çubukta olduğu için dropdown'ı yukarı doğru açıyor; diğerleri aşağı
  doğru açıyor.

## [0.9.3] - 2026-09-04

### Değiştirildi

- Detay ekranındaki tek tek aksiyon buton sırası (mobil alt çubuk,
  masaüstü başlığı, masaüstü çekmece başlığı) tek bir "Actions"
  (Aksiyonlar) tetikleyicisiyle değiştirildi; tıklanınca menü açılıyor
  (Deliver/Whitelist/Block/Mark unseen). Önceki satır/grid düzeni
  kısıtlı ekrana sığdırmak için tekrar tekrar revize gerektiriyordu;
  sabit boyutlu tetikleyici yeni aksiyonlar eklense de düzen
  değişikliği gerektirmiyor. Altta yatan davranış (deliver/whitelist/
  block için onay adımı, mark-seen/unseen için doğrudan mutasyon)
  değişmedi.

## [0.9.2] - 2026-09-04

### Düzeltildi

- Mobilde detay ekranının alt sabit aksiyon çubuğunda Deliver/
  Whitelist/Block/Mark unseen tek satıra sıkışıyor, "Mark unseen"
  etiketi kırpılıyordu. Artık mobilde 2x2 grid düzeninde gösteriliyor,
  dört buton da tam görünüyor.
- Mobilde karantina listesinden bir mesajın detayına girip geri
  çıkıldığında, karttaki Göz/GözKapalı simgesi bir anlığına doğru
  duruma geçip sonra eski haline dönebiliyordu. Kök neden: liste
  sorgusunun varsayılan yeniden-mount'ta yeniden çekmesi, sunucu
  tarafında henüz tamamlanmamış (fire-and-forget) mark-seen/mark-unseen
  yazımından önceki bir yanıtı alıp zaten doğru olan önbelleği
  eziyordu. Liste sorgusunda mount'ta yeniden çekmeyi kapatıp mevcut
  önbellek yamalarına (ve manuel Yenile butonuna) güvenerek çözüldü.

## [0.9.1] - 2026-09-04

### Düzeltildi

- Görüldü/görülmedi geçişleri (liste satırlarındaki Göz/GözKapalı
  simgesi ve detay ekranının "Görülmedi yap" butonu), uygulandıktan
  hemen sonra karantina içerik uç noktasını artık yeniden çekmiyor -
  mutasyonun fire-and-forget yazımı, yeniden-mount sırasında oluşan bir
  yeniden çekmeyle yarışabiliyor ve sessizce eziliyordu, bu da detay
  ekranındaki butonun kaybolmasına ve listedeki geçişin hiçbir etkisi
  yokmuş gibi görünmesine yol açıyordu.

## [0.9.0] - 2026-09-03

### Eklendi

- PMG'nin kendi `seen` alanının üzerine görüldü/görülmedi takibi.
  Bir mesajın detay ekranı açıldığında, PMG'nin kendi davranışına
  benzer şekilde mesaj sessizce (bildirim göstermeden) görüldü olarak
  işaretlenir. Mobilde kart, masaüstünde tablo satırlarındaki
  dokunulabilir Göz/GözKapalı simgesi listeden doğrudan görüldü/
  görülmedi durumunu değiştirir; detay ekranının aksiyon çubuğuna da
  yalnızca mesaj görüldü durumundayken görünen bir "Görülmedi işaretle"
  butonu eklendi.

## [0.8.11] - 2026-09-03

### Düzeltildi

- Karantina sayfasındaki Refresh butonu, sayfa ilk açıldıktan sonra
  gelen mailleri hiç göstermiyordu. Zaman filtresinin üst sınırı
  sayfa mount edildiği anda "şimdi"ye sabitleniyor ve her
  `refetch()` çağrısında aynen kullanılıyordu; bu yüzden daha yeni
  mailler pencerenin dışında kalıyordu (yalnızca başka sayfaya gidip
  geri gelmek, sayfayı yeniden mount edip sınırı yeniden hesapladığı
  için maili gösteriyordu). Üst sınır artık bir sonraki gece yarısına
  sabitleniyor - Tracking Center'ın filtresinde zaten kullanılan
  yaklaşımın aynısı; Tracking Center'da bu sorunun görünmemesinin
  sebebi de buydu.

## [0.8.10] - 2026-09-02

### Değişti

- README'nin "Güncelleme" bölümü artık `docker compose up -d --build`
  komutunun bir önceki imajı dangling (atıl, kullanılmayan) bir imaj
  olarak sunucuda bıraktığını belirtiyor ve her güncellemeden sonra
  bunları temizlemek için `docker image prune -f` komutunu ekliyor.

## [0.8.9] - 2026-09-02

### Düzeltildi

- README'nin Özellikler ve Güvenlik Notları bölümleri, arayüzde bir
  `delete` (sil) karantina aksiyonu ve buna ait bir onay adımı
  varmış gibi anlatıyordu - böyle bir şey yok; arayüz yalnızca
  `deliver`, `whitelist` ve `blocklist` aksiyonlarını sunuyor. Beyaz
  liste mekanizmasının kendisi bundan etkilenmiyor - hâlâ PMG'nin
  desteklediği tüm aksiyonlara göre kontrol yapıyor - ama artık
  dokümantasyon arayüzün bugün gerçekten hangilerini kullandığını
  söylüyor ve kalanların (`delete`, `mark-seen`, `mark-unseen`,
  `welcomelist`, `blacklist`) ilerideki bir versiyonda arayüze
  eklenebileceğini not ediyor.

## [0.8.8] - 2026-09-02

### Değişti

- Başlıktaki sürüm numarası (masaüstü kenar çubuğu ve mobil başlık
  çubuğu) koyu modda daha okunaklı hale getirildi - `text-zinc-600`,
  `zinc-950` arka planına çok yakındı.

## [0.8.7] - 2026-09-02

### Değişti

- README ekran görüntüleri, eski/daha küçük görüntü kümesi yerine demo
  modundan alınan tam bir görüntü kümesiyle (dashboard, üç karantina
  türünün tamamı, Tracking Center, yapılandırılmış Message Events)
  değiştirildi.

## [0.8.6] - 2026-09-01

### Değişti

- Mobil başlıkta turuncu DEMO rozeti artık uygulama başlığı yerine
  gerçekte neyi nitelediği olan giriş yapılmış hesap adının yanında
  gösteriliyor.

## [0.8.5] - 2026-09-01

### Düzeltmeler

- Demo modunda Karantina <-> Tracking Center çapraz eşleşmesi hiçbir
  zaman eşleşme bulamıyordu: iki sahte veri kümesi birbirinden bağımsız,
  ilgisiz rastgele gönderen/alıcı/zaman değerleriyle üretiliyordu; bu
  yüzden "Tracking Center'da görüntüle" bağlantısının gönderen+alıcı+
  15dk penceresi filtresi hiçbir şeyle örtüşmüyordu. `buildTrackingDataset()`
  artık sahte Tracking Center'ın bir kısmını gerçek karantina kayıtlarından
  (aynı gönderen/alıcı/zaman, durum `Q`) türetiyor; böylece çapraz bağlantı
  demoda gerçek bir eşleşmeye çözümleniyor.

## [0.8.4] - 2026-09-01

### Düzeltmeler

- Demo modunda Tracking Center her zaman yapılandırılmış bir Message
  Events zaman çizelgesi yerine "No recognized events - see the raw
  log for the full trail." mesajını gösteriyordu. `mockPmgClient.js`
  tarafından üretilen sahte log satırlarında başta zaman damgası/
  hostname öneki yoktu; bu yüzden önyüzün log ayrıştırıcısı
  (`trackingLogEvents.js`) her satırı genel `Log` kategorisine
  düşürüyordu ve zaman çizelgesi bunları tamamen filtreliyordu. Sahte
  log satırları artık gerçek PMG API'sinin döndürdüğü formatla eşleşen
  klasik syslog önekini (`Ay Gün SS:DD:SS <host> ...`) taşıyor.

## [0.8.3] - 2026-09-01

### Değişti

- README'nin Özellikler bölümü artık eksiksiz bir liste yerine tüm
  özellikleri kapsıyor (yapılandırılmış Message Events zaman
  çizelgesi, toplu seçim, yıkıcı işlemlerde onay adımı, güncelleme
  kontrolü bandı, demo modu). Aslında bir Karantina/Tracking Center
  detay sayfası özelliği olmasına rağmen daha önce Dashboard
  maddesine iliştirilmiş olan Karantina↔Tracking Center çapraz
  bağlantı notu artık kendi maddesinde.

## [0.8.2] - 2026-09-01

### Değişti

- README/`.env.example`, geçerli iki `NODE_ENV` değerini
  (`production`/`development`) artık açıkça belirtiyor ve `PORT`
  değişkeninin yalnızca uygulamanın container içinde dinlediği portu
  değiştirdiğini netleştiriyor - `docker-compose.yml`'deki `3000:3000`
  port eşlemesiyle (ve healthcheck URL'iyle) senkron tutulmazsa
  uygulamaya erişilemez hale gelir.

## [0.8.1] - 2026-09-01

### Değişti

- README/`.env.example`, reverse proxy/tunnel olmadan düz `http://`
  üzerinden erişildiğinde Demo modunun hâlâ `NODE_ENV=development`
  gerektirdiğini netleştiriyor - `NODE_ENV=production`'ın güvenli
  oturum çerezi, gerçek uygulamada olduğu gibi HTTPS gerektirir, aksi
  halde giriş sessizce kalıcı olmaz.

## [0.8.0] - 2026-09-01

### Eklendi

- Demo modu (`DEMO_MODE=true`): uygulamayı gerçek bir PMG yerine bellek
  içi sahte bir PMG'ye karşı, sabit `demo`/`demo` girişiyle çalıştırır.
  Tüm ekranlar (Dashboard, Quarantine spam/virus/attachment, Tracking
  Center) gerçekçi bir örnek veri setiyle çalışır; PMG sunucusu veya ağ
  erişimi gerekmez. Quarantine aksiyonları (deliver/block vb.) bellek
  içi veriyi gerçekten değiştirir, böylece demo canlı bir sistem gibi
  davranır; veri yeniden başlatmada sıfırlanır. Bir demo instance'ın
  gerçek olanla karıştırılmaması için sidebar/header'da bir "DEMO"
  rozeti gösterilir. Gerçek bir dağıtımdan ayrı bir container olarak
  çalıştırılmak üzere tasarlanmıştır - bkz. README.md > "Demo modu".

## [0.7.2] - 2026-09-01

### Düzeltmeler

- Tracking Center'daki "Policy Match" olayı, eşleşen kuralın adını son
  kapanan parantez yerine ilk kapanan parantezde kesiyordu; bu yüzden
  adının içinde kendi parantezi olan bir kural (örn.
  `Whitelist - Netmak (in)`) `Whitelist - Netmak (in` şeklinde,
  sondaki `)` eksik gösteriliyordu. Tamamen kozmetik - PMG'deki asıl
  işlem etkilenmiyordu.

## [0.7.1] - 2026-09-01

### Düzeltmeler

- CSV export'u (Karantina ve Tracking Center) formül/CSV injection'a
  karşı korumasızdı: `=`, `+`, `-` veya `@` ile başlayan bir mail
  konusu veya gönderen adresi (tamamen saldırganın kontrolünde, çünkü
  mail içeriği) export edilen dosya Excel/Sheets'te açıldığında formül
  olarak yorumlanabiliyordu. Bu tür alanların başına artık bir `'`
  ekleniyor, böylece hesap tablosu uygulamaları bunları düz metin
  olarak görüyor.

## [0.7.0] - 2026-09-01

### Eklenenler

- Karantina ekranı artık sadece spam'i değil, PMG'nin üç karantina
  türünün tamamını kapsıyor: Virus Quarantine ve Attachment
  Quarantine. Navigasyondaki "Quarantine" girişi (masaüstünde iç içe
  bir grup, mobilde bir dropdown) Spam, Virus ve Attachment Quarantine
  arasında geçiş yapmayı sağlıyor; aktif tür URL'de kalıyor
  (`?type=spam|virus|attachment`), böylece bağlantılar, geri/ileri ve
  sayfa yenileme hep doğru türü koruyor. Liste, kart ve detay sayfası
  türe göre uyarlanıyor - Virus Quarantine'de virüs adı rozeti,
  Attachment Quarantine'de engellenen ek dosyaları listesi (yeni
  `GET /quarantine/:id/attachments` endpoint'i), Spam Quarantine'de
  mevcut spam skoru rozeti - ve CSV export sütunları da aynı şekilde
  uyarlanıyor. Dashboard değişmedi, hâlâ sadece spam gösteriyor.

## [0.6.0] - 2026-09-01

### Eklenenler

- Dashboard, Karantina ve Tracking Center sayfalarında uygulama artık
  açılışta GitHub'daki release tag'lerini kontrol ediyor ve daha yeni
  bir sürüm varsa ekranın altında kalıcı bir bildirim çubuğu
  gösteriyor. Bu çubuk kullanıcı kapatana kadar açık kalıyor ve
  changelog'a bağlantı veriyor; kapatma işlemi sürüm bazında
  hatırlanıyor, yani gerçekten daha yeni bir sürüm çıkana kadar tekrar
  görünmüyor.

### Düzeltmeler

- Mobil sekme çubuğundaki "Tracking Center" etiketi dar telefon
  ekranlarında iki satıra bölünüyor ve sekme çubuğunun yüksekliğini
  bozuyordu. Artık tek satırda kalıyor (daha küçük yazı, satır kaydırma
  yok, daha sıkı boşluk).

## [0.5.0] - 2026-09-01

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
  sadece yerleşim ve görsel stil değişti. "Quarantine Volume" ve
  "Message Delivery Status" artık masaüstünde yan yana gösteriliyor,
  ve "Top status" özet kartı diğer kartlarla tutarlı olacak şekilde
  artık etiket alanında durum adını (örn. "Delivered"), değer
  alanında ise sayıyı gösteriyor - önceki "İsim (sayı)" biçimi dar
  mobil ekranlarda kesiliyordu.
- Dashboard'daki "Quarantine Volume" grafiği artık her zaman son 7
  günü gösteriyor ve diğer widget'larla aynı "(last 7 days)" başlık
  stiline uyuyor; 24 saat/7 gün geçişi kaldırıldı, çünkü zaten
  Dashboard'daki diğer tüm widget'lar da sabit 7 günlük görünüme
  sahip.
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

- PWA manifest'indeki `start_url` alanı, Dashboard yeniden
  tasarımından kalma şekilde hâlâ `/quarantine`'a işaret ediyordu;
  artık girişten sonraki gerçek ilk açılış sayfası olan
  `/dashboard`'a işaret ediyor.
- `apple-touch-icon.png`, `icon-192.png` ve `icon-512.png` dosyaları
  `favicon.svg` güncellendikten sonra bile hâlâ eski ikon görselini
  taşıyordu - artık aynı tasarımdan (login sayfasındaki mavi
  yuvarlatılmış arka plan üzerindeki lucide "Shield" ikonu) yeniden
  üretildiler.
- Dashboard'daki "Top Senders"/"Top Receivers" ve "Quarantine Volume"
  satırlarında uzun etiketler (ör. uzun e-posta adresleri) sığması için
  sonuna üç nokta ile kısaltılıyor - mobilde `title` tooltip'ini
  gösterecek bir hover özelliği olmadığından, artık kısaltılmış bir
  etikete dokununca tam adresi gösteren küçük bir kutu açılıyor; başka
  bir yere dokunmak kutuyu kapatıyor.
- Favicon/uygulama ikonu URL'leri (`favicon.svg`, `apple-touch-icon.png`
  ve manifest'teki `icon-192.png`/`icon-512.png`) artık `?v=2` cache-bust
  sorgu parametresi taşıyor - mobil tarayıcılar site verisi tamamen
  temizlendikten sonra bile ikon güncellemesinde eski favicon'u
  göstermeye devam ediyordu.
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

# PMG Quarantine Admin

[English](README.md) | Türkçe

**Sürüm:** 0.9.9 · [Değişiklik Günlüğü](CHANGELOG.tr.md)

[Proxmox Mail Gateway](https://www.proxmox.com/en/proxmox-mail-gateway)
(PMG) için mobil öncelikli, tamamen duyarlı (responsive) bir yönetim
paneli. Mail/güvenlik yöneticilerine, PMG'nin kendi web arayüzünün
mobilde iyi çalışmadığı iki konuda hızlı ve sade bir arayüz sunar:
karantinadaki postaları inceleyip işlem yapmak, ve Tracking Center
üzerinden posta teslimat durumunu sorgulamak.

Tek, ayrı bir Docker container olarak çalışır - PMG cihazının kendisine
hiç dokunmaz, onunla yalnızca PMG API üzerinden konuşur.

## Özellikler

- **Dashboard** - girişten sonraki ilk açılış sayfası: son 7 güne ait
  karantina hacmi, mesaj teslimat durumu ve en çok görülen gönderen/
  alıcılar.
- **Karantina yönetimi** - PMG'nin üç karantina türünü de kapsar (Spam,
  Virus, Attachment), navigasyondan geçiş yapılabilir. Karantinadaki
  postaları listele, ara/filtrele ve işlem yap (teslim et, beyaz
  listeye al, engelle); mobilde kaydırmalı (swipe) kart listesi ve
  çoklu seçimle toplu işlem, masaüstünde yoğun bir veri tablosu. Engelle
  işlemi bir onay adımı gerektirir.
- **Tracking Center** - bir postanın teslimat durumunu gönderene,
  alıcıya veya filtreye göre sorgula, salt okunur. Her kaydın syslog
  kaydı, ham log satırları yerine yapılandırılmış, genişletilebilir bir
  Message Events zaman çizelgesi olarak gösterilir.
- **Karantina ve Tracking Center arasında çapraz bağlantı** - bir
  Karantina kaydının detay sayfası, en-iyi-çaba ile eşleşen Tracking
  Center kaydına bağlantı verir (ve tersi yönde de) - böylece aynı
  postayı iki kez aramanız gerekmez.
- **Saved Filters ön ayarları ve CSV export**, hem Karantina hem
  Tracking Center liste sayfalarında.
- **Yönetici başına PMG girişi** - her yönetici kendi PMG hesabıyla
  (Help Desk rolü) giriş yapar, böylece PMG'nin kendi denetim
  kaydındaki işlemler ortak bir servis hesabı yerine doğru şekilde o
  yöneticiye atfedilir. PMG kimlik bilgileri hiçbir zaman saklanmaz -
  yalnızca PMG'nin verdiği kısa ömürlü ticket/CSRF token'ı, sunucu
  tarafında httpOnly bir oturum çerezinde tutulur.
- **Koyu/açık tema**, PWA olarak yüklenebilir.
- **Güncelleme kontrolü bandı** - GitHub'da yeni bir sürüm çıktığında
  uygulama içinde bildirir, sürüm bazında kapatılabilir.
- **Demo modu** - gerçek bir PMG sunucusu olmadan, gerçekçi örnek veriyle
  tüm ekranları deneyin, aşağıdaki [Demo modu](#demo-modu) bölümüne
  bakın.

Kapsam dışı: welcomelist/blocklist *politika* yönetimi (genel veya
alan adı bazında) - bunun için PMG'nin kendi arayüzünü kullanın.

## Ekran Görüntüleri

[Demo modundan](#demo-modu) alınmıştır.

### Masaüstü

<table>
<tr>
<td width="50%"><img src="screenshots/desktop/01-desktop-dashboard.png" width="100%" alt="Dashboard"/><br/><sub>Dashboard</sub></td>
<td width="50%"><img src="screenshots/desktop/02-desktop-spam-quarantine-list.png" width="100%" alt="Spam karantina listesi"/><br/><sub>Karantina - spam listesi</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/03-desktop-spam-quarantine-message-details.png" width="100%" alt="Spam karantina mesaj detayı"/><br/><sub>Karantina - spam mesaj detayı</sub></td>
<td width="50%"><img src="screenshots/desktop/04-desktop-virus-quarantine-list.png" width="100%" alt="Virüs karantina listesi"/><br/><sub>Karantina - virüs listesi</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/05-desktop-virus-quarantine-message-details.png" width="100%" alt="Virüs karantina mesaj detayı"/><br/><sub>Karantina - virüs mesaj detayı</sub></td>
<td width="50%"><img src="screenshots/desktop/06-desktop-attachment-quarantine-list.png" width="100%" alt="Ek karantina listesi"/><br/><sub>Karantina - ek listesi</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/07-desktop-attachment-quarantine-message-details.png" width="100%" alt="Ek karantina mesaj detayı"/><br/><sub>Karantina - ek mesaj detayı</sub></td>
<td width="50%"><img src="screenshots/desktop/08-desktop-tracking-center-list.png" width="100%" alt="Tracking Center liste görünümü"/><br/><sub>Tracking Center - liste görünümü</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/09-desktop-tracking-message-details.png" width="100%" alt="Tracking Center mesaj detayı"/><br/><sub>Tracking Center - mesaj detayı</sub></td>
<td width="50%"><img src="screenshots/desktop/10-desktop-tracking-structured-message-events.png" width="100%" alt="Yapılandırılmış Message Events görünümü"/><br/><sub>Tracking Center - yapılandırılmış Message Events</sub></td>
</tr>
</table>

### Mobil

<table>
<tr>
<td width="33%"><img src="screenshots/mobile/01-mobile-login.png" width="100%" alt="Giriş"/><br/><sub>Giriş</sub></td>
<td width="33%"><img src="screenshots/mobile/02-mobile-dashboard.png" width="100%" alt="Dashboard"/><br/><sub>Dashboard</sub></td>
<td width="33%"><img src="screenshots/mobile/03-mobile-quarantine-types-menu.png" width="100%" alt="Karantina türleri menüsü"/><br/><sub>Karantina - tür menüsü</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/04-mobile-spam-quarantine-list.png" width="100%" alt="Spam karantina listesi"/><br/><sub>Karantina - spam listesi</sub></td>
<td width="33%"><img src="screenshots/mobile/05-mobile-spam-quarantine-message-details.png" width="100%" alt="Spam karantina mesaj detayı"/><br/><sub>Karantina - spam mesaj detayı</sub></td>
<td width="33%"><img src="screenshots/mobile/06-mobile-virus-quarantine-list.png" width="100%" alt="Virüs karantina listesi"/><br/><sub>Karantina - virüs listesi</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/07-mobile-virus-quarantine-message-details.png" width="100%" alt="Virüs karantina mesaj detayı"/><br/><sub>Karantina - virüs mesaj detayı</sub></td>
<td width="33%"><img src="screenshots/mobile/08-mobile-attachment-quarantine-list.png" width="100%" alt="Ek karantina listesi"/><br/><sub>Karantina - ek listesi</sub></td>
<td width="33%"><img src="screenshots/mobile/09-mobile-attachment-quarantine-message-details.png" width="100%" alt="Ek karantina mesaj detayı"/><br/><sub>Karantina - ek mesaj detayı</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/10-mobile-swipe-left-deliver.png" width="100%" alt="Karantina sola kaydır - teslim et"/><br/><sub>Karantina - kaydırarak teslim et</sub></td>
<td width="33%"><img src="screenshots/mobile/11-mobile-swipe-right-block.png" width="100%" alt="Karantina sağa kaydır - engelle"/><br/><sub>Karantina - kaydırarak engelle</sub></td>
<td width="33%"><img src="screenshots/mobile/12-mobile-tracking-center-list.png" width="100%" alt="Tracking Center liste görünümü"/><br/><sub>Tracking Center - liste görünümü</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/13-mobile-tracking-center-message-details.png" width="100%" alt="Tracking Center mesaj detayı"/><br/><sub>Tracking Center - mesaj detayı</sub></td>
<td width="33%"><img src="screenshots/mobile/14-mobile-tracking-center-structured-message-events.png" width="100%" alt="Yapılandırılmış Message Events görünümü"/><br/><sub>Tracking Center - yapılandırılmış Message Events</sub></td>
<td width="33%"></td>
</tr>
</table>

## Teknoloji Yığını

- **Backend:** Node.js/Express, bir kimlik doğrulama + PMG API proxy'si
  olarak (tarayıcı asla doğrudan PMG ile konuşmaz - PMG API'de CORS
  desteği yok, ve PMG'nin ticket/CSRF akışının sunucu tarafında
  kalması gerekiyor).
- **Frontend:** React + Tailwind CSS, mobil öncelikli.
- **Paketleme:** tek bir çok aşamalı Dockerfile - tek bir Express
  süreci hem `/api/*` rotalarını hem de derlenmiş frontend'i statik
  dosya olarak sunar.

## Ön Koşullar

- Docker ve Docker Compose
- Bu container'ın çalıştığı yerden erişilebilir bir PMG sunucusu, ve
  yönetici başına **Help Desk** rolüne sahip bir PMG hesabı (yalnızca
  Quarantine Manager rolü Tracking Center'a erişemez; Administrator/
  root@pam gereksiz ve önerilmez)

## Kurulum

```bash
git clone https://github.com/ikrsdo/pmg-quarantine-admin.git
cd pmg-quarantine-admin
cp .env.example .env
```

`.env` dosyasını düzenleyip en azından `PMG_BASE_URL` ve
`SESSION_SECRET` değerlerini ayarlayın (aşağıdaki
[Yapılandırma](#yapılandırma) bölümüne bakın). Ardından:

```bash
docker compose up -d --build
```

Uygulama 3000 portunda dinler (hızlı bir yerel kontrol için
`http://localhost:3000`). Giriş ekranında kendi PMG kullanıcı adı/
şifrenizle oturum açın.

## Demo modu

Gerçek bir PMG sunucusu olmadan tüm ekranları (Quarantine spam/virus/
attachment, Tracking Center, Dashboard) denemek mi istiyorsunuz? Depoyu
ayrı bir klasöre klonlayın, o kopyanın kendi `.env` dosyasında
`DEMO_MODE=true` ayarlayın ve ayrı bir container olarak çalıştırın:

```bash
git clone https://github.com/ikrsdo/pmg-quarantine-admin.git pmg-quarantine-admin-demo
cd pmg-quarantine-admin-demo
cp .env.example .env
# .env dosyasını düzenleyin: DEMO_MODE=true ve kendi SESSION_SECRET değerinizi ayarlayın
docker compose up -d --build
```

`demo` / `demo` ile giriş yapın. Backend tamamen bellek içi sahte bir
PMG'ye karşı çalışır - `PMG_BASE_URL` gerekmez, hiçbir şey gerçek bir
PMG sunucusuna veya ağa dokunmaz. Örnek veri seti (quarantine mailleri,
tracking kayıtları) gerçekçi ve orta ölçeklidir; quarantine aksiyonları
(deliver/block vb.) bu veriyi gerçekten değiştirir, böylece demo canlı
bir sistem gibi davranır - süreç yeniden başladığında veri sıfırlanır.
Bir demo instance'ın gerçek olanla karıştırılmaması için sidebar/
header'da bir "DEMO" rozeti gösterilir. Bu, aynı depodan klonlanmış
gerçek, halihazırda çalışan bir dağıtıma dokunmayan, ayrı ve tamamen
izole bir instance'dır.

> **Reverse proxy/tunnel olmadan düz `http://` üzerinden mi
> deneyeceksiniz?** `NODE_ENV=production` iken oturum çerezi HTTPS
> gerektirir (bkz.
> [Yerel ağın dışına açmak](#yerel-ağın-dışına-açmak)) - aksi halde
> giriş kalıcı olmaz. Demo'yu HTTPS arkasına koymak yerine sadece
> `http://<host>:3000` üzerinden hızlıca bakmak istiyorsanız, o demo
> kopyasının `.env` dosyasında `NODE_ENV=development` ayarlayın. Bunu
> yalnızca burada yapmak güvenlidir: demo modu hiçbir zaman gerçek PMG
> kimlik bilgisi tutmaz.

## Güncelleme

En son sürüme güncellemek için, `docker-compose.yml` dosyasını içeren
proje klasörünün içinden şu komutu çalıştırarak yeni kodu çekip imajı
yeniden derleyin:

```bash
cd pmg-quarantine-admin
sudo git pull && sudo docker compose up -d --build
```

Her yeniden derlemede bir önceki imaj sunucuda kalır ve artık hiçbir
etikete bağlı olmayan ("dangling") atıl bir imaja dönüşür -
`docker compose up -d --build` bunları kendiliğinden temizlemez.
Temizlemek için:

```bash
sudo docker image prune -f
```

Bu komut yalnızca dangling (etiketsiz, kullanılmayan) imajları siler,
bu yüzden her güncellemeden sonra çalıştırmak güvenlidir - şu an
kullanımda olan imaja veya başka container'lara ait imajlara
dokunmaz.

## Yapılandırma

Tüm yapılandırma ortam değişkenleri üzerinden yapılır - tam şablon
için `.env.example` dosyasına bakın.

| Değişken | Açıklama |
|---|---|
| `DEMO_MODE` | Gerçek bir PMG yerine bellek içi sahte bir PMG'ye karşı çalışmak için `true` - bkz. [Demo modu](#demo-modu) |
| `PMG_BASE_URL` | PMG sunucunuzun temel adresi, örn. `https://pmg.example.local:8006` (`DEMO_MODE=true` iken gerekmez) |
| `PMG_API_PATH` | PMG API yolu, normalde `/api2/json` |
| `PMG_ALLOW_SELF_SIGNED` | PMG'nin kendinden imzalı sertifikasını kabul etmek için `true` (dahili ağlarda tipik) |
| `NODE_ENV` | `production` (varsayılan, önerilen) veya `development` - oturum çerezinin HTTPS gerektirip gerektirmediğini de belirler, aşağıya bakın |
| `PORT` | Backend'in container içinde dinlediği port (varsayılan `3000`) - `docker-compose.yml`'deki port eşlemesini de güncellemediğiniz sürece `3000` olarak bırakın |
| `SESSION_SECRET` | Oturum çerezlerini imzalamak için kullanılan uzun, rastgele bir dize - her zaman kendi değerinizi ayarlayın |

PMG kullanıcı adı/şifresi asla `.env` içine yazılmaz - her yönetici
kendi kimlik bilgilerini giriş ekranında, istek anında girer.

## Yerel ağın dışına açmak

Bu projenin `docker-compose.yml` dosyası yalnızca `app` servisini
çalıştırır - içinde bir reverse proxy veya tünel bulunmaz. Zaten
kullandığınız, dahili servisleri HTTPS üzerinden dışarı açan ne varsa
onun arkasına koyun (Cloudflare Tunnel, nginx, Traefik, Caddy, vb.),
container'ın yayınlanan portuna işaret ederek.

`NODE_ENV=production` olduğunda oturum çerezi `Secure` olarak
işaretlenir, bu yüzden uygulamaya bu modda HTTPS üzerinden erişilmesi
gerekir - düz HTTP üzerinden bir reverse proxy adımı, ya da doğrudan
`http://` üzerinden test etmek, girişin sessizce kalıcı olmamasına yol
açar.

Güvenilir bir ağın dışından erişilebilir herhangi bir kurulum için,
PMG giriş ekranının önüne (ikinci bir faktör olarak) bir kimlik
doğrulama katmanı (örn. Cloudflare Access) eklemek önerilir.

## Güvenlik Notları

**Kimlik bilgileri ve oturumlar**

- PMG kullanıcı adı/şifresi asla `.env`'e, diske veya tarayıcıya
  dokunmaz - her yöneticinin şifresi yalnızca giriş anında PMG'ye
  iletilir ve hiçbir yerde saklanmaz; yalnızca PMG'nin verdiği kısa
  ömürlü ticket/CSRF token, sunucu tarafında, o yöneticinin kendi
  httpOnly, (üretimde) `Secure`, `SameSite=lax` oturum çerezine bağlı
  olarak tutulur. Oturum, session fixation'ı önlemek için her başarılı
  girişte yenilenir.
- Yönetici başına ayrı bir PMG hesabı kullanın (Help Desk rolü), asla
  `root@pam` kullanmayın - bkz. [Ön Koşullar](#ön-koşullar).
- `.env` asla commit edilmez - içinde PMG kimlik bilgisi yoktur,
  yalnızca bağlantı/oturum ayarları vardır.

**Backend sertleştirme**

- `/api/login`, PMG kimlik bilgisi kaba kuvvet saldırılarını
  yavaşlatmak için hız sınırlıdır (IP başına 15 dakikada 20 deneme) -
  mevcut bir oturum olmadan erişilebilen tek uç nokta budur.
- Her karantina işlemi, PMG'ye iletilmeden önce sabit bir geçerli PMG
  aksiyonu listesine göre kontrol edilir (`deliver`, `delete`,
  `whitelist`, `blocklist`, vb.) - keyfi aksiyon dizeleri reddedilir.
  Uygulamanın mevcut arayüzü yalnızca `deliver`, `whitelist` ve
  `blocklist` aksiyonlarını sunar; beyaz liste, API'nin desteklediği
  diğer PMG aksiyonlarına da (`delete`, `mark-seen`, `mark-unseen`,
  `welcomelist`, `blacklist`) izin verir - bunlar ilerideki bir
  versiyonda arayüze eklenebilir.
- Güvenlik başlıkları ([Helmet](https://helmetjs.github.io/)
  aracılığıyla) her yanıtta ayarlanır: `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, ve `X-Powered-By`
  başlığının kaldırılması, ve diğerleri.
- Karantinadaki postanın HTML önizlemesi, PMG'nin kendi temizleme
  (sanitizing) formatlayıcısı üzerinden render edilir ve frontend'de
  `sandbox=""` bir iframe içine yüklenir; bu URL'yi sunan backend
  rotası da, doğrudan o URL'ye gitmeye karşı ek bir savunma katmanı
  olarak kendi `Content-Security-Policy: sandbox` başlığını gönderir.
- Docker imajı root olarak değil, root olmayan bir kullanıcı olarak
  çalışır.
- Bağımlılıklar her sürümden önce `npm audit` ile kontrol edilir (bu
  sürüm itibarıyla 0 bilinen güvenlik açığı).

**Ağ**

- PMG API'ye ağ erişimini bu container'ın ağı/VPN'i ile sınırlayın -
  PMG API'nin kendisini genel internete açmayın.
- `PMG_ALLOW_SELF_SIGNED=true` ayarını, körlemesine açık bırakılacak
  bir varsayılan değil, dahili/lab ağları için bilinçli, belgelenmiş
  bir tercih olarak ele alın - etkinleştirildiğinde başlangıçta bir
  uyarı loglanır.
- HTTPS ve reverse-proxy gereksinimleri için
  [Yerel ağın dışına açmak](#yerel-ağın-dışına-açmak) bölümüne bakın.
- "PMG dışında dış bağlantı yok" kuralının tek istisnası: tarayıcı,
  açılışta daha yeni bir sürüm olup olmadığını kontrol etmek ve bir
  güncelleme bildirimi göstermek için genel, kimlik doğrulaması
  gerektirmeyen GitHub API'sini (`api.github.com/repos/.../tags`)
  çağırır. Hiçbir kimlik bilgisi veya uygulama verisi gönderilmez -
  sadece düz bir `GET` isteği. GitHub'a erişilemezse (örneğin
  internetten izole bir kurulumda) sessizce başarısız olur.

Bir güvenlik açığı bulursanız, lütfen genel bir PR yerine bir issue
açın (veya hassas konular için doğrudan proje sahibiyle iletişime
geçin).

## Geliştirme

Bu projenin dayandığı mimari kararların ve PMG API notlarının tamamı
için `CLAUDE.md` dosyasına, backend'e özgü geliştirme/test komutları
için `app/backend/README.md` dosyasına bakın.

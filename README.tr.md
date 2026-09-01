# PMG Quarantine Admin

[English](README.md) | Türkçe

**Sürüm:** 0.7.2 · [Değişiklik Günlüğü](CHANGELOG.tr.md)

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
  alıcılar; ayrıca bir Karantina kaydı ile eşleşen Tracking Center
  kaydı arasında (ve tersi yönde) en-iyi-çaba çapraz bağlantı.
- **Karantina yönetimi** - PMG'nin üç karantina türünü de kapsar (Spam,
  Virus, Attachment), navigasyondan geçiş yapılabilir. Karantinadaki
  postaları listele, ara/filtrele ve işlem yap (teslim et, beyaz
  listeye al, engelle, sil); mobilde kaydırmalı (swipe) kart listesi,
  masaüstünde yoğun bir veri tablosu.
- **Tracking Center** - bir postanın teslimat durumunu ve syslog
  kaydını gönderene, alıcıya veya filtreye göre sorgula, salt okunur.
- **Saved Filters ön ayarları ve CSV export**, hem Karantina hem
  Tracking Center liste sayfalarında.
- **Yönetici başına PMG girişi** - her yönetici kendi PMG hesabıyla
  (Help Desk rolü) giriş yapar, böylece PMG'nin kendi denetim
  kaydındaki işlemler ortak bir servis hesabı yerine doğru şekilde o
  yöneticiye atfedilir. PMG kimlik bilgileri hiçbir zaman saklanmaz -
  yalnızca PMG'nin verdiği kısa ömürlü ticket/CSRF token'ı, sunucu
  tarafında httpOnly bir oturum çerezinde tutulur.
- **Koyu/açık tema**, PWA olarak yüklenebilir.

Kapsam dışı: welcomelist/blocklist *politika* yönetimi (genel veya
alan adı bazında) - bunun için PMG'nin kendi arayüzünü kullanın.

## Ekran Görüntüleri

### Masaüstü

<table>
<tr>
<td width="50%"><img src="screenshots/desktop/1-desktop-login.jpg" width="100%" alt="Giriş"/><br/><sub>Giriş</sub></td>
<td width="50%"><img src="screenshots/desktop/2-desktop-quarantine-main-list-view.jpg" width="100%" alt="Karantina liste görünümü"/><br/><sub>Karantina - liste görünümü</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/3-desktop-quarantine-filter-modal.jpg" width="100%" alt="Karantina filtre penceresi"/><br/><sub>Karantina - filtre</sub></td>
<td width="50%"><img src="screenshots/desktop/4-desktop-quarantine-message-details.jpg" width="100%" alt="Karantina mesaj detayı"/><br/><sub>Karantina - mesaj detayı</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/5-desktop-tracking-center-main-list-view.jpg" width="100%" alt="Tracking Center liste görünümü"/><br/><sub>Tracking Center - liste görünümü</sub></td>
<td width="50%"><img src="screenshots/desktop/6-desktop-tracking-center-filter-modal.jpg" width="100%" alt="Tracking Center filtre penceresi"/><br/><sub>Tracking Center - filtre</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/7-desktop-tracking-center-message-details.jpg" width="100%" alt="Tracking Center mesaj detayı"/><br/><sub>Tracking Center - mesaj detayı</sub></td>
<td width="50%"><img src="screenshots/desktop/8-desktop-structured-message-events-view.jpg" width="100%" alt="Yapılandırılmış Message Events görünümü"/><br/><sub>Tracking Center - yapılandırılmış Message Events</sub></td>
</tr>
</table>

### Mobil

<table>
<tr>
<td width="33%"><img src="screenshots/mobile/1-mobile-login.jpeg" width="100%" alt="Giriş"/><br/><sub>Giriş</sub></td>
<td width="33%"><img src="screenshots/mobile/2-mobile-quarantine-main-list-view.jpeg" width="100%" alt="Karantina liste görünümü"/><br/><sub>Karantina - liste görünümü</sub></td>
<td width="33%"><img src="screenshots/mobile/3-mobile-quarantine-message-details.jpeg" width="100%" alt="Karantina mesaj detayı"/><br/><sub>Karantina - mesaj detayı</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/4-mobile-quarantine-multi-selection.jpeg" width="100%" alt="Karantina çoklu seçim"/><br/><sub>Karantina - çoklu seçim</sub></td>
<td width="33%"><img src="screenshots/mobile/5-mobile-quarantine-swipe-left-deliver.jpeg" width="100%" alt="Karantina sola kaydır - teslim et"/><br/><sub>Karantina - kaydırarak teslim et</sub></td>
<td width="33%"><img src="screenshots/mobile/6-mobile-quarantine-swipe-right-block.jpeg" width="100%" alt="Karantina sağa kaydır - engelle"/><br/><sub>Karantina - kaydırarak engelle</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/7-mobile-tracking-center-main-list-view.jpeg" width="100%" alt="Tracking Center liste görünümü"/><br/><sub>Tracking Center - liste görünümü</sub></td>
<td width="33%"><img src="screenshots/mobile/8-mobile-tracking-center-message-details.jpeg" width="100%" alt="Tracking Center mesaj detayı"/><br/><sub>Tracking Center - mesaj detayı</sub></td>
<td width="33%"><img src="screenshots/mobile/9-mobile-structured-message-events-view.jpeg" width="100%" alt="Yapılandırılmış Message Events görünümü"/><br/><sub>Tracking Center - yapılandırılmış Message Events</sub></td>
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

## Güncelleme

En son sürüme güncellemek için, `docker-compose.yml` dosyasını içeren
proje klasörünün içinden şu komutu çalıştırarak yeni kodu çekip imajı
yeniden derleyin:

```bash
cd pmg-quarantine-admin
sudo git pull && sudo docker compose up -d --build
```

## Yapılandırma

Tüm yapılandırma ortam değişkenleri üzerinden yapılır - tam şablon
için `.env.example` dosyasına bakın.

| Değişken | Açıklama |
|---|---|
| `PMG_BASE_URL` | PMG sunucunuzun temel adresi, örn. `https://pmg.example.local:8006` |
| `PMG_API_PATH` | PMG API yolu, normalde `/api2/json` |
| `PMG_ALLOW_SELF_SIGNED` | PMG'nin kendinden imzalı sertifikasını kabul etmek için `true` (dahili ağlarda tipik) |
| `NODE_ENV` | Üretimde `production` - oturum çerezinin HTTPS gerektirip gerektirmediğini de belirler |
| `PORT` | Backend'in dinlediği port (varsayılan `3000`) |
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

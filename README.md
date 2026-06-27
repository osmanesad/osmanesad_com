# osmanesad.com

A minimal personal website for Osman Esad Hoşbak. It brings together notes, archive entries, GitHub projects, profile information, CV links, and social links in a simple static frontend.

The site is built with plain HTML, CSS, and JavaScript. Published notes and like counts are loaded from Supabase, while the projects page reads public repositories from GitHub.

## Türkçe Açıklama

Bu repo, Osman Esad Hoşbak'ın kişisel web sitesi için hazırlanmış statik bir site yapısıdır. Amaç; yazıları, küçük projeleri, CV bağlantılarını, sosyal hesapları ve iletişim bilgisini sade, hızlı ve okunabilir bir arayüzde toplamaktır.

Son düzenlemede site baştan sadeleştirildi:

- Beyaz zemin, siyah metin ve koyu turuncu vurgu rengi kullanıldı.
- Menü dili daha net hale getirildi: `Notlar`, `Arşiv`, `Projeler`, `Hakkımda`.
- Hakkımda sayfası CV'deki deneyimlere daha yakın, daha somut bir dille yeniden yazıldı.
- Ana sayfa karşılama alanı küçültüldü ve daha düzenli hale getirildi.
- Beğen butonu ayrı bir bileşen gibi ele alındı; durum, sayaç, ikon ve erişilebilirlik bilgileri iyileştirildi.
- Mobil uyumluluk ve sayfa aralıkları sadeleştirildi.

## Sayfalar

- `index.html`: Ana okuma alanı. Supabase üzerinden yayınlanmış notları çeker, seçili yazıyı gösterir, beğenme ve paylaşma işlevlerini içerir.
- `archive.html`: Yayınlanmış notların arşiv sayfası. Başlığa göre arama ve yıl bazlı gezinme sağlar.
- `projects.html`: GitHub üzerindeki public projeleri listeler.
- `about.html`: Hakkımda, deneyim, eğitim, CV ve iletişim bağlantıları.
- `admin.html`: Yönetim arayüzü için mevcut dosya. Ana site akışından ayrı tutulur.

## Kullanılan Yapı

Site herhangi bir framework kullanmadan çalışır:

- HTML: Sayfa iskeletleri.
- CSS: Tüm görsel sistem ve responsive düzen `styles.css` içinde.
- JavaScript modules: Dinamik içerik, Supabase, GitHub API, tema ve yazı boyutu kontrolleri.
- Supabase: Yayınlanmış notlar ve beğeni sayıları.
- GitHub API: Projeler sayfasındaki repo listesi.
- LocalStorage: Okuma teması, yazı boyutu, ziyaretçi kimliği ve daha önce beğenilmiş not bilgisi.

## Önemli Dosyalar

- `app.js`: Ana sayfa mantığı. Notları Supabase'ten çeker, seçili notu gösterir, beğenme/paylaşma/tema/yazı boyutu işlemlerini yönetir.
- `archive.js`: Arşiv listesini Supabase'ten çeker, arama ve yıl filtreleme işlevlerini kurar.
- `projects.js`: GitHub API üzerinden repo listesini alır ve filtrelenebilir proje listesi oluşturur.
- `content-utils.js`: HTML içeriğini güvenli şekilde temizleyip sayfaya basmak için yardımcı fonksiyonlar içerir.
- `styles.css`: Tipografi, renkler, layout, butonlar, listeler ve mobil kırılımlar.
- `version.txt`: Sitenin görünen beta/sürüm bilgisi.
- `assets/icons/`: Sosyal platform ikonları.
- `assets/Osman_Esad_Hosbak_CV_TR_2026.pdf`: Türkçe CV.
- `assets/Osman_Esad_Hosbak_CV_EN_2026.pdf`: İngilizce CV.

## Sistem Nasıl Çalışıyor?

Ana sayfa açıldığında `app.js` çalışır. Supabase bağlantısı kurulur ve `posts` tablosundan sadece `published` durumundaki notlar çekilir. En güncel not seçili yazı olarak gösterilir. Sağ tarafta son notlar listelenir.

Beğenme sistemi Supabase üzerindeki `post_likes` verisini okur ve `like_once` RPC fonksiyonunu çağırır. Tarayıcıda üretilen ziyaretçi kimliği `localStorage` içinde saklanır. Böylece aynı ziyaretçinin aynı notu tekrar tekrar beğenmesi engellenir.

Arşiv sayfası yine Supabase'ten yayınlanmış notları alır. İçerikten kısa bir özet üretir, yıl bağlantıları ve başlık aramasıyla listeyi gezilebilir hale getirir.

Projeler sayfası GitHub public API üzerinden `osmanesad` kullanıcısının repolarını çeker. Fork ve arşivlenmiş repolar gizlenir, liste son güncellenme tarihine göre sıralanır.

## Yerelde Çalıştırma

Bu site statik dosyalardan oluştuğu için özel bir build adımı yoktur. ES module importları ve tarayıcı güvenliği nedeniyle doğrudan dosyayı çift tıklamak yerine küçük bir local server ile çalıştırmak daha doğrudur.

PowerShell içinde:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Sonra tarayıcıda aç:

```text
http://127.0.0.1:4173/
```

Alternatif olarak başka bir port kullanabilirsin:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

## Kontrol Listesi

Değişikliklerden sonra genelde şunlar kontrol edilmeli:

- Ana sayfa açılıyor mu?
- `about.html`, `archive.html`, `projects.html` açılıyor mu?
- `styles.css`, `app.js`, `archive.js`, `projects.js` HTTP üzerinden dönüyor mu?
- Yerel linkler ve asset dosyaları mevcut mu?
- Sosyal ikonlar görünüyor mu?
- Supabase bağlantısı notları çekiyor mu?
- GitHub projeleri listeleniyor mu?
- Beğen butonu sayı ve durum bilgisini güncelliyor mu?
- Mobil görünümde menü, giriş alanı ve listeler taşmadan duruyor mu?

## Notlar

Bu repo şu anda basit, taşınabilir ve framework bağımsız kalacak şekilde düzenlenmiştir. Yeni özellik eklerken önce mevcut statik yapıyı bozmamak, sonra gerekirse küçük ve anlaşılır JavaScript modülleriyle ilerlemek daha sağlıklı olur.

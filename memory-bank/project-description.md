# Localhost Port Manager — Tauri + Rust + Frontend

**Platform hedefi:** Windows-first, sonrasında macOS/Linux uyumlu  
**Dağıtım modeli:** Public open-source desktop app + opsiyonel CLI  
**Ürün tipi:** System tray / menu bar tarzı geliştirici yardımcı aracı

---

## 1) Ürün özeti

Amaç: Kullanıcının makinesinde aktif olan localhost portlarını, ilgili process bilgilerini ve aksiyonlarını tek ekrandan yönetebilmesini sağlamak.

Uygulama şunları desteklemeli:

- Aktif portları listeleme
- Portu kullanan process bilgisini gösterme
- PID, process adı, executable path, working directory, command line gösterme
- Tek tıkla:
  - tarayıcıda açma
  - proje klasörünü açma
  - terminal açma
  - process kill etme
  - process detayını görme
- Arama, filtreleme, sıralama
- Tray app olarak çalışma
- Settings ekranı
- CLI desteği
- Windows-first edge case’leri:
  - admin yetkisi gereken işlemler
  - WSL süreçleri
  - Docker port mapping görünürlüğü
  - erişilemeyen process metadata durumları
- Public release kalitesinde logging, crash handling, updater, packaging

---

## 2) Önerilen tech stack

## 2.1 Desktop framework

- **Tauri v2**
- **Rust** backend/core
- Avantaj:
  - hafif binary
  - native hissiyat
  - tray desteği
  - command bridge ile güvenli desktop capability modeli
  - Windows tarafında iyi dağıtım deneyimi

## 2.2 Frontend

- **React**
- **TypeScript**
- **Vite**
- **TanStack Router** veya basit yapı için React Router
- **TanStack Query** (runtime data refresh, cache, polling için)
- **Zustand** (UI ve settings state için)
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React** ikonları

> Minimal ve hızlı geliştirme için öneri:  
> **React + TypeScript + Vite + Tailwind + shadcn/ui + Zustand + TanStack Query**

## 2.3 Rust tarafı ana kütüphaneler

Aşağıdaki liste öneri niteliğinde; birebir isimler projede güncel sürümlere göre teyit edilmeli.

- **tauri**
- **tauri-plugin-shell**
- **tauri-plugin-opener**
- **tauri-plugin-dialog**
- **tauri-plugin-log**
- **tauri-plugin-store** veya settings’i kendi JSON config’inle yönetme
- **tauri-plugin-updater**
- **serde**
- **serde_json**
- **tokio**
- **sysinfo** (process bilgileri için)
- **netstat2** veya platform-specific ağ introspection crate’leri
- **windows** crate (Windows native API gerekirse)
- **tracing**
- **tracing-subscriber**
- **thiserror**
- **anyhow**
- **directories** veya **dirs-next**
- **chrono**
- **parking_lot**
- **once_cell**

## 2.4 Veri saklama

- Başlangıç için:
  - **JSON settings/config**
  - **lightweight local cache**
- İleri aşama için:
  - SQLite gerekmez; ancak geçmiş kayıtlar, snapshots, analytics olacaksa düşünebilirsin

## 2.5 Test araçları

### Frontend

- **Vitest**
- **React Testing Library**
- **Playwright** (desktop E2E için sınırlı ama UI smoke test’lerde değerlendirilebilir)

### Rust

- `cargo test`
- integration tests
- snapshot tests (gerekirse)
- Windows özel testleri için GitHub Actions matrix

## 2.6 CI/CD

- **GitHub Actions**
- İş akışları:
  - lint
  - unit test
  - build
  - release drafter
  - signed/notarized artifacts pipeline (ileride)

## 2.7 Packaging / release

- Windows: **MSI** + opsiyonel portable `.exe`
- İleri aşama:
  - code signing
  - auto updater
  - winget release
- macOS/Linux roadmap sonrası:
  - DMG / AppImage / deb

---

## 3) Mimari yaklaşım

## 3.1 Katmanlar

### A. Core discovery layer (Rust)

Sorumluluklar:

- aktif TCP/UDP portlarını bulmak
- process/PID eşlemek
- process metadata toplamak
- path, command line, working directory almaya çalışmak
- localhost açılabilir URL üretmek

### B. Action layer (Rust)

Sorumluluklar:

- browser’da aç
- folder aç
- terminal aç
- kill process
- refresh / rescan
- gerektiğinde yetki hatalarını dönmek

### C. Integration layer (Rust)

Sorumluluklar:

- Docker / WSL / özel process tespiti
- future plugin-style sources
- settings persistence
- logs
- updater hooks

### D. UI layer (React)

Sorumluluklar:

- list view
- detail drawer/modal
- filters/search/sort
- settings page
- onboarding
- empty/error/loading states
- tray interactions için görünüm mantığı

### E. CLI layer

Sorumluluklar:

- port listeleme
- JSON output
- process kill
- port açma
- scriptable kullanım

---

## 4) Monorepo / klasör yapısı önerisi

```text
localhost-port-manager/
├─ src-tauri/
│  ├─ src/
│  │  ├─ commands/
│  │  │  ├─ ports.rs
│  │  │  ├─ actions.rs
│  │  │  ├─ settings.rs
│  │  │  └─ system.rs
│  │  ├─ core/
│  │  │  ├─ discovery.rs
│  │  │  ├─ process.rs
│  │  │  ├─ ports.rs
│  │  │  ├─ url.rs
│  │  │  ├─ docker.rs
│  │  │  ├─ wsl.rs
│  │  │  └─ permissions.rs
│  │  ├─ state/
│  │  │  └─ app_state.rs
│  │  ├─ models/
│  │  │  ├─ port_entry.rs
│  │  │  ├─ settings.rs
│  │  │  └─ response.rs
│  │  ├─ services/
│  │  │  ├─ settings_service.rs
│  │  │  ├─ logging_service.rs
│  │  │  └─ scan_service.rs
│  │  ├─ tray/
│  │  │  └─ tray.rs
│  │  ├─ errors.rs
│  │  ├─ lib.rs
│  │  └─ main.rs
│  ├─ capabilities/
│  ├─ icons/
│  ├─ Cargo.toml
│  └─ tauri.conf.json
├─ src/
│  ├─ app/
│  ├─ components/
│  │  ├─ ports/
│  │  ├─ settings/
│  │  ├─ layout/
│  │  └─ common/
│  ├─ features/
│  │  ├─ ports/
│  │  ├─ filters/
│  │  ├─ actions/
│  │  ├─ settings/
│  │  └─ onboarding/
│  ├─ hooks/
│  ├─ lib/
│  ├─ stores/
│  ├─ types/
│  ├─ routes/
│  └─ main.tsx
├─ packages/
│  └─ cli/           # opsiyonel ayrı CLI paketi
├─ docs/
├─ .github/workflows/
├─ package.json
└─ README.md
```

---

## 5) Feature set — desteklenecek tüm ana özellikler

## 5.1 Port discovery

Her port entry için mümkün olduğunca şu alanlar dönmeli:

- port numarası
- protocol (TCP / UDP)
- host / bind address
- localhost URL önerisi
- process name
- PID
- executable path
- working directory
- command line
- status/listening bilgisi
- start time / uptime (mümkünse)
- user/system ownership bilgisi (mümkünse)
- source classification:
  - native
  - Node
  - Python
  - Docker
  - WSL
  - database
  - unknown

## 5.2 Port list UI

- tablo veya card list
- hızlı refresh
- auto refresh interval
- search box
- filtreler:
  - protocol
  - listening only
  - process type
  - privileged ports
  - favorites
- sort:
  - port
  - process name
  - PID
  - uptime
- row actions:
  - Open URL
  - Open Folder
  - Open Terminal
  - Kill
  - Copy URL
  - Copy PID
  - Details

## 5.3 Process details view

- detay drawer/modal
- gösterilecek alanlar:
  - PID
  - process name
  - executable path
  - command
  - working directory
  - ports used by same process
  - classification
  - privilege/permission durumu
  - environment summary (çok dikkatli; varsayılan olarak full env gösterme)
- aksiyonlar:
  - kill
  - copy all details
  - open containing folder
  - relaunch path yoksa disable

## 5.4 Browser integration

- localhost URL üretme
- varsayılan:
  - `http://127.0.0.1:{port}`
- settings üzerinden:
  - `localhost`
  - `127.0.0.1`
  - `0.0.0.0` davranış yönetimi
  - protocol heuristic: http / https
- özel path template:
  - örn. `/health`, `/docs`, `/swagger`

## 5.5 Folder integration

- executable path’den klasör açma
- working directory varsa onu tercih etme
- erişilemiyorsa fallback:
  - executable parent
  - disable state + tooltip

## 5.6 Terminal integration

Windows tarafında destek seçenekleri:

- Windows Terminal
- PowerShell
- CMD
- Git Bash
- VS Code terminal (sonradan)

Aksiyonlar:

- klasörde terminal aç
- varsa kullanıcı seçimine göre default terminal kullan
- working directory yoksa executable directory’ye düş

## 5.7 Kill process

- soft stop mümkünse dene
- sonra force kill opsiyonu
- confirm dialog
- protected/system process için güvenlik uyarısı
- settings:
  - “confirm before kill”
  - “show force kill”
- multi-port tek process durumunda kullanıcıyı uyar

## 5.8 Tray mode

- sistem tray ikonu
- tray menüsü:
  - Show app
  - Refresh ports
  - Favorite ports
  - Settings
  - Quit
- opsiyonlar:
  - close to tray
  - start minimized
  - launch on startup

## 5.9 Settings

Ayrıntılı settings gereksinimleri aşağıdaki bölümde.

## 5.10 CLI support

Önerilen komutlar:

```bash
lpm list
lpm list --json
lpm open 3000
lpm kill 3000
lpm kill --pid 12345
lpm inspect 3000
lpm refresh
```

CLI özellikleri:

- scriptable JSON output
- exit code standardizasyonu
- Windows shell dostu kullanım
- UI ile aynı core discovery layer’ı kullanma

## 5.11 Logging & diagnostics

- uygulama logları
- action logları
- son scan süresi
- scan error logları
- diagnostics export:
  - app version
  - OS version
  - settings snapshot
  - log excerpt
- kullanıcı dostu “Report issue” akışı

## 5.12 Update system

- app update check
- release notes görüntüleme
- manual / auto update
- failure rollback planı

---

## 6) Settings tasarımı

## 6.1 General

- theme: system / light / dark
- language: başlangıçta İngilizce, sonra i18n
- launch on startup
- start minimized
- close to tray
- check updates automatically

## 6.2 Scanning

- auto refresh enabled
- refresh interval (örn. 2s / 5s / 10s / 30s)
- scan TCP
- scan UDP
- show only listening
- resolve process metadata aggressively
- include system processes
- hide inaccessible processes
- enable deep process inspection

## 6.3 Actions

- default browser URL host:
  - localhost
  - 127.0.0.1
- default protocol:
  - http
  - https
  - auto-detect
- preferred terminal:
  - Windows Terminal
  - PowerShell
  - CMD
  - Git Bash
- confirm before kill
- default open path:
  - working directory
  - executable folder

## 6.4 UI preferences

- compact mode
- dense rows
- show PID column
- show protocol column
- show path column
- show command column
- remember filters
- remember window size/position

## 6.5 Safety & privacy

- hide command line by default
- blur sensitive paths
- confirm dangerous actions
- telemetry disabled by default
- crash reports opt-in

## 6.6 Advanced

- enable WSL integration
- enable Docker integration
- experimental features
- custom localhost URL templates
- custom ignore rules
- custom favorite rules

## 6.7 Data model örneği

```json
{
  "theme": "system",
  "launchOnStartup": false,
  "startMinimized": false,
  "closeToTray": true,
  "autoRefresh": true,
  "refreshIntervalMs": 5000,
  "scanTcp": true,
  "scanUdp": false,
  "showListeningOnly": true,
  "includeSystemProcesses": false,
  "hideInaccessibleProcesses": false,
  "defaultUrlHost": "127.0.0.1",
  "defaultProtocol": "http",
  "preferredTerminal": "windows-terminal",
  "confirmBeforeKill": true,
  "defaultOpenPath": "working-directory",
  "compactMode": false,
  "showPidColumn": true,
  "showProtocolColumn": true,
  "showPathColumn": true,
  "showCommandColumn": false,
  "rememberFilters": true,
  "enableWslIntegration": true,
  "enableDockerIntegration": true,
  "telemetryEnabled": false,
  "crashReportsEnabled": false,
  "experimentalFeatures": false
}
```

---

## 7) Windows-first teknik detaylar

## 7.1 Port discovery stratejisi

Başlangıç için en sağlam yaklaşım:

1. aktif socket/port bilgilerini al
2. PID ile eşle
3. PID üzerinden process metadata çek
4. UI modeline normalize et

Olası kaynaklar:

- native Windows APIs
- `netstat -ano`
- PowerShell komutları
- Rust crate’leri + gerektiğinde native fallback

Öneri:

- ilk aşamada crate tabanlı çözüm
- problemli edge case’lerde Windows API fallback katmanı

## 7.2 Process metadata alma

Hedef metadata:

- process name
- executable path
- command line
- current working directory
- owner/user
- uptime

Not:

- bazı process’lerde yetki yetersizliği olabilir
- system process’ler için graceful degradation şart

## 7.3 Terminal açma

Öncelik sırası:

- kullanıcı settings’te seçtiyse onu kullan
- yoksa Windows Terminal tespit et
- sonra PowerShell
- sonra CMD

## 7.4 Open folder

- working directory varsa onu aç
- yoksa executable path’in parent’ını aç
- ikisi de yoksa action disable et

## 7.5 Kill güvenliği

- kendi uygulamanı yanlışlıkla öldürmeyi engelle
- system-critical process’leri işaretle
- tek process birden çok port tutuyorsa bunu belirt
- admin gerekli ise hata mesajını net ver

---

## 8) WSL desteği

Amaç:

- WSL içinde çalışan servislerin mümkünse anlaşılır görünmesi

Destek düzeyleri:

### Faz 1

- WSL kaynaklı process’leri “WSL” olarak etiketle
- port görünüyorsa listede göster

### Faz 2

- distro adı çözümleme
- WSL path dönüşümü
- ilgili klasör açma için uygun fallback

### Faz 3

- WSL komutlarıyla derin introspection
- distro-specific terminal açma

Not:

- ilk sürümde WSL’de tam metadata almak zor olabilir
- bunu settings altında experimental/advanced yap

---

## 9) Docker desteği

Amaç:

- container kaynaklı portları daha anlamlı göstermek

Destek düzeyleri:

### Faz 1

- Docker tarafından publish edilen localhost portlarını normal şekilde göster
- process classification: Docker / containerized

### Faz 2

- Docker CLI entegrasyonu ile:
  - container adı
  - image adı
  - mapped container port
- UI’da badge göster

### Faz 3

- container aksiyonları:
  - container inspect
  - logs aç
  - stop/restart

Not:

- Faz 1’i MVP’de tut, Faz 2-3’ü roadmap’e koy

---

## 10) Güvenlik, privacy, permission

Temel ilkeler:

- telemetry varsayılan kapalı
- gereksiz veri toplama yok
- local-first settings
- command line ve path gibi hassas alanlar kontrollü gösterilmeli

Permission yaklaşımı:

- erişilemeyen metadata durumunda crash etme
- “Permission denied” state’i göster
- admin isteyen aksiyonlarda kullanıcıyı açık bilgilendir

Tehlikeli aksiyonlar:

- kill process
- force kill
- system process müdahalesi

Koruma önerileri:

- confirm dialog
- elevated warning
- protected process badge
- dangerous action logs

---

## 11) UI/UX önerisi

## 11.1 Ana ekran

Bölümler:

- top bar
  - search
  - refresh
  - filters
  - settings
- port list
- status bar
  - last scan
  - number of ports
  - filtered count

## 11.2 Görsel dil

- sade, utility-first arayüz
- koyu tema önemli
- hızlı tarama hissi veren canlı ama sakin UI
- badge sistemi:
  - HTTP
  - HTTPS
  - TCP
  - UDP
  - Docker
  - WSL
  - System
  - Inaccessible

## 11.3 Boş durumlar

- aktif port yok
- filtre sonucu boş
- permission yüzünden metadata alınamadı
- hata durumları için retry CTA

## 11.4 Settings ekranı

- sekmeli yapı:
  - General
  - Scanning
  - Actions
  - Appearance
  - Privacy & Safety
  - Advanced
  - About

---

## 12) Domain model önerisi

```ts
type PortEntry = {
  id: string;
  port: number;
  protocol: "tcp" | "udp";
  host: string;
  isListening: boolean;
  suggestedUrl?: string;
  pid?: number;
  processName?: string;
  executablePath?: string;
  workingDirectory?: string;
  commandLine?: string;
  classification?:
    | "native"
    | "node"
    | "python"
    | "docker"
    | "wsl"
    | "database"
    | "unknown";
  isSystemProcess?: boolean;
  isAccessible?: boolean;
  requiresElevation?: boolean;
  startedAt?: string;
  uptimeSeconds?: number;
  tags?: string[];
};
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortEntry {
    pub id: String,
    pub port: u16,
    pub protocol: String,
    pub host: String,
    pub is_listening: bool,
    pub suggested_url: Option<String>,
    pub pid: Option<u32>,
    pub process_name: Option<String>,
    pub executable_path: Option<String>,
    pub working_directory: Option<String>,
    pub command_line: Option<String>,
    pub classification: Option<String>,
    pub is_system_process: bool,
    pub is_accessible: bool,
    pub requires_elevation: bool,
    pub started_at: Option<String>,
    pub uptime_seconds: Option<u64>,
    pub tags: Vec<String>,
}
```

---

## 13) Tauri command API önerisi

Önerilen command’ler:

- `get_ports() -> Vec<PortEntry>`
- `refresh_ports() -> Vec<PortEntry>`
- `get_port_details(port: u16) -> PortEntryDetails`
- `open_in_browser(port: u16, path: Option<String>)`
- `open_folder(pid: Option<u32>, path_hint: Option<String>)`
- `open_terminal(pid: Option<u32>, path_hint: Option<String>)`
- `kill_process(pid: u32, force: bool)`
- `get_settings() -> AppSettings`
- `save_settings(settings: AppSettings)`
- `get_system_info()`
- `export_diagnostics()`
- `check_for_updates()`

Not:

- UI hiçbir zaman direkt OS logic bilmemeli
- tüm kritik aksiyonlar command katmanından geçmeli

---

## 14) CLI kapsamı

## 14.1 Komutlar

```bash
lpm list
lpm list --json
lpm list --watch
lpm inspect 3000
lpm open 3000
lpm open 3000 --path /health
lpm folder 3000
lpm terminal 3000
lpm kill 3000
lpm kill --pid 1234 --force
lpm settings get
lpm settings set refreshIntervalMs 5000
```

## 14.2 Çıktı modları

- human readable table
- JSON
- NDJSON opsiyonel

## 14.3 CLI tech stack

- Rust içinde ayrı binary
- `clap`
- aynı core discovery/action crate’lerini paylaş

---

## 15) Logging ve hata yönetimi

## 15.1 Log seviyeleri

- info
- warn
- error
- debug

## 15.2 Log event’leri

- app startup
- scan start/end
- scan duration
- port count
- action triggered
- action success/failure
- settings changed
- update check
- panic/crash

## 15.3 Error handling ilkeleri

- UI’da teknik stack trace gösterme
- kullanıcıya anlaşılır mesaj ver
- debug details ayrı “show details” altında
- recoverable error’larda retry sun

---

## 16) Test stratejisi

## 16.1 Rust testleri

- port parsing
- process classification
- URL generation
- settings serialization
- permissions fallback
- Windows path handling

## 16.2 Frontend testleri

- port list rendering
- filter logic
- sort logic
- settings persistence
- destructive action confirmation

## 16.3 E2E / smoke

- app açılışı
- mock port verisiyle listeleme
- refresh
- settings save/load
- kill action confirmation flow

## 16.4 Manuel test checklist

- normal user
- admin mode
- WSL aktif
- Docker aktif
- inaccessible process
- many ports scenario
- duplicate processes
- no ports state
- tray behavior
- startup behavior

---

## 17) Performance hedefleri

- ilk açılış hızlı olmalı
- scan süresi düşük tutulmalı
- UI polling cihazı yormamalı
- büyük port listelerinde sanal listeleme gerekebilir

Öneri:

- 2–5 saniye refresh default
- aggressive scan sadece ayarlardan açılmalı
- diff-based UI update yapısı düşünülmeli

---

## 18) Roadmap — fazlara bölünmüş yapılacaklar

## Faz 0 — Proje kurulumu

- [ ] repo oluştur
- [ ] Tauri v2 + React + TypeScript + Vite kur
- [ ] Tailwind + shadcn/ui kur
- [ ] Rust modül yapısını oluştur
- [ ] lint/format araçlarını kur
- [ ] GitHub Actions başlangıç pipeline’ını ekle
- [ ] logging altyapısını kur
- [ ] settings dosyası için temel persistence kur

## Faz 1 — Core port discovery MVP

- [ ] aktif port discovery implement et
- [ ] PID eşleme yap
- [ ] process name çek
- [ ] executable path çek
- [ ] working directory çekmeyi dene
- [ ] command line çekmeyi dene
- [ ] `PortEntry` modelini stabilize et
- [ ] Tauri command: `get_ports`
- [ ] hata/fallback akışlarını kur

## Faz 2 — Ana UI

- [ ] ana liste ekranını yap
- [ ] search ekle
- [ ] basic filter ekle
- [ ] basic sort ekle
- [ ] refresh butonu ekle
- [ ] auto refresh polling ekle
- [ ] loading / empty / error state’leri ekle
- [ ] row actions dropdown ekle

## Faz 3 — Aksiyonlar

- [ ] browser’da aç
- [ ] folder aç
- [ ] terminal aç
- [ ] kill process
- [ ] confirm dialog’lar
- [ ] copy actions
- [ ] success/error toast’ları

## Faz 4 — Settings

- [ ] settings data modeli finalize et
- [ ] settings ekranını sekmeli yap
- [ ] scanning ayarları
- [ ] actions ayarları
- [ ] appearance ayarları
- [ ] privacy/safety ayarları
- [ ] advanced ayarları
- [ ] settings import/export opsiyonu

## Faz 5 — Tray & startup

- [ ] system tray kur
- [ ] close to tray davranışı
- [ ] launch on startup
- [ ] start minimized
- [ ] tray quick actions
- [ ] favorite ports quick access

## Faz 6 — Details & diagnostics

- [ ] process details drawer
- [ ] same PID altında çoklu port görünümü
- [ ] diagnostics export
- [ ] log viewer basic ekranı
- [ ] report issue akışı

## Faz 7 — CLI

- [ ] core crate’leri CLI ile paylaş
- [ ] `list`
- [ ] `inspect`
- [ ] `open`
- [ ] `folder`
- [ ] `terminal`
- [ ] `kill`
- [ ] `settings`
- [ ] JSON output
- [ ] exit code düzeni

## Faz 8 — Windows edge cases

- [ ] admin permission handling
- [ ] inaccessible process UX
- [ ] system process badging
- [ ] Windows Terminal detection
- [ ] path fallback logic
- [ ] self-kill protection

## Faz 9 — Integrations

- [ ] WSL basic detection
- [ ] Docker basic classification
- [ ] advanced metadata roadmap taslağı
- [ ] experimental toggles

## Faz 10 — Release quality

- [ ] updater
- [ ] MSI build
- [ ] portable build
- [ ] versioning stratejisi
- [ ] changelog akışı
- [ ] issue templates
- [ ] contribution guide
- [ ] public README
- [ ] screenshots/gif’ler
- [ ] telemetry policy / privacy note

---

## 19) MVP kapsamı vs V1 kapsamı

## MVP

- aktif portları göster
- PID + process name göster
- browser/folder/terminal aç
- kill process
- search/filter/sort
- settings
- tray
- logging
- Windows packaging

## V1

- detay drawer
- CLI
- diagnostics export
- startup behavior
- updater
- WSL basic detection
- Docker basic classification

## V1.5+

- container metadata
- distro-aware WSL support
- saved filters
- favorites
- advanced URL rules
- richer process classification

---

## 20) Açık kaynak/public hazırlık checklist’i

- [ ] temiz repo adı seç
- [ ] uygun lisans seç
  - MIT veya Apache-2.0
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] SECURITY.md
- [ ] issue templates
- [ ] PR template
- [ ] README:
  - problem
  - özellikler
  - ekran görüntüleri
  - kurulum
  - geliştirme
  - roadmap
- [ ] releases sayfası düzeni
- [ ] demo gif/video
- [ ] “known limitations” bölümü

---

## 21) Önerilen isim fikirleri

Bunlar sadece brainstorming:

- Portly
- PortDeck
- LocalPort
- LoopPort
- PortPilot
- DockPort
- LocalFlow Ports
- PortScope
- DevPorts
- Localhost Manager

> Public release için kısa, akılda kalıcı ve GitHub/alan adı uygunluğu olan isim seç.

---

## 22) Teknik riskler

- Windows’ta working directory tespiti her process için stabil olmayabilir
- bazı process’lerde command line/path erişimi kısıtlı olabilir
- WSL ve Docker metadata ilk sürümde eksik olabilir
- tray/startup davranışları bazı sistemlerde farklı hissedilebilir
- aggressive polling performans maliyeti yaratabilir

Azaltma planı:

- graceful fallback
- advanced features’i flag arkasına alma
- feature bazlı incremental release

---

## 23) Benim net önerdiğim final stack

**Desktop:** Tauri v2  
**Backend/Core:** Rust + Tokio + Sysinfo + netstat/native Windows API fallback  
**Frontend:** React + TypeScript + Vite  
**UI:** Tailwind + shadcn/ui + Lucide  
**State:** Zustand  
**Server-state / polling:** TanStack Query  
**Validation:** Zod  
**Logging:** tracing + tauri-plugin-log  
**Settings:** JSON config + serde  
**CLI:** Rust + clap  
**Testing:** cargo test + Vitest + RTL + temel smoke tests  
**CI/CD:** GitHub Actions  
**Packaging:** MSI + portable exe  
**Updates:** tauri updater

---

## 24) İlk sprint için net task listesi

### Sprint 1

- [ ] Tauri projesini ayağa kaldır
- [ ] React UI shell oluştur
- [ ] settings persistence kur
- [ ] Rust’ta port discovery POC yap
- [ ] port + PID + process name verisini UI’a bağla
- [ ] list ekranını çıkar
- [ ] manuel refresh ekle

### Sprint 2

- [ ] executable path / command line / working dir çek
- [ ] search/filter/sort
- [ ] browser aç
- [ ] folder aç
- [ ] terminal aç
- [ ] basic settings ekranı

### Sprint 3

- [ ] kill flow
- [ ] tray
- [ ] auto refresh
- [ ] empty/error states
- [ ] logs
- [ ] MSI build pipeline

### Sprint 4

- [ ] details drawer
- [ ] diagnostics export
- [ ] startup settings
- [ ] updater groundwork
- [ ] README + public repo cleanup

---

## 25) Son karar özeti

Bu projeyi geliştirirken en sağlıklı strateji:

1. **Windows-first MVP**
2. discovery/action core’u Rust’ta temiz ayır
3. UI’yı modern ama basit tut
4. WSL/Docker gibi alanları ilk sürümde “partial support” olarak sun
5. settings, tray, logging ve diagnostics’i en baştan düşün
6. CLI’yi ayrı ama aynı core’u kullanan bir katman olarak kur

Böyle yaparsan hem hızlı çıkarsın hem de public bir ürün gibi büyütebilirsin.

# TaskManager Frontend

Bu proje, modern bir görev yönetim uygulamasının frontend kısmıdır. Trello benzeri bir arayüz ile kullanıcıların görevlerini organize etmelerini sağlar.

## 🚀 Özellikler

- **Modern UI/UX**: React 19 ve modern CSS ile geliştirilmiş arayüz
- **Drag & Drop**: Kartları listeler arasında sürükleyip bırakma
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda uyumlu
- **Gerçek Zamanlı Güncelleme**: Anlık veri senkronizasyonu
- **Kullanıcı Yönetimi**: Kayıt, giriş ve oturum yönetimi
- **Pano Yönetimi**: Panolar oluşturma, düzenleme ve silme
- **Liste Yönetimi**: Listeler oluşturma ve düzenleme
- **Kart Yönetimi**: Görev kartları oluşturma, düzenleme ve silme

## 🛠️ Teknolojiler

- **React 19**: Modern React hooks ve functional components
- **React Router**: Sayfa yönlendirme ve navigasyon
- **React Beautiful DnD**: Sürükle-bırak işlevselliği
- **Axios**: HTTP istekleri ve API iletişimi
- **Vite**: Hızlı geliştirme ve build aracı
- **CSS3**: Modern CSS özellikleri ve responsive tasarım

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd TaskManagement/UI/client
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
# veya
yarn dev
```

4. **Tarayıcıda açın**
```
http://localhost:5173
```

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview

# Linting
npm run lint
```

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Header.jsx      # Navigasyon header'ı
│   ├── CreateBoardModal.jsx
│   ├── CreateListModal.jsx
│   ├── CreateCardModal.jsx
│   └── CardDetailModal.jsx
├── pages/              # Sayfa bileşenleri
│   ├── Dashboard.jsx   # Ana dashboard
│   ├── Board.jsx       # Kanban board
│   ├── Login.jsx       # Giriş sayfası
│   └── Register.jsx    # Kayıt sayfası
├── services/           # API servisleri
│   ├── boardService.js
│   ├── listService.js
│   └── cardService.js
├── App.jsx             # Ana uygulama bileşeni
├── App.css             # Ana stil dosyası
└── main.jsx            # Uygulama giriş noktası
```

## 🌐 API Entegrasyonu

Uygulama, backend API'leri ile iletişim kurar:

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT token tabanlı
- **Endpoints**: 
  - `/auth/login` - Kullanıcı girişi
  - `/auth/register` - Kullanıcı kaydı
  - `/boards` - Pano yönetimi
  - `/lists` - Liste yönetimi
  - `/cards` - Kart yönetimi

## 🎨 Tasarım Sistemi

### Renkler
- **Primary**: #667eea (Mavi)
- **Secondary**: #764ba2 (Mor)
- **Text**: #172b4d (Koyu)
- **Background**: #f5f6f8 (Açık gri)

### Tipografi
- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Font Sizes**: 0.8rem - 2.5rem arası
- **Line Height**: 1.6

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Container**: max-width: 1200px
- **Padding**: 1rem - 3rem arası

## 📱 Responsive Tasarım

- **Mobile First**: Mobil öncelikli tasarım yaklaşımı
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Grid System**: CSS Grid ile esnek layout

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Production
Build klasörünü herhangi bir static hosting servisine yükleyebilirsiniz:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya maintainer ile iletişime geçebilirsiniz.

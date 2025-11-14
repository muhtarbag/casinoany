# Katkıda Bulunma Rehberi

BahisSiteleri projesine katkıda bulunmayı düşündüğünüz için teşekkür ederiz! Bu doküman, katkı sürecini ve standartlarımızı açıklar.

## 🚀 Başlarken

### 1. Development Environment Kurulumu

```bash
# Repository'yi fork edin ve klonlayın
git clone https://github.com/YOUR_USERNAME/bahissiteleri.git
cd bahissiteleri

# Bağımlılıkları yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

### 2. Branch Stratejisi

- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/*` - Yeni özellikler
- `fix/*` - Bug fixes
- `docs/*` - Dokümantasyon
- `refactor/*` - Code refactoring

```bash
# Feature branch oluştur
git checkout -b feature/amazing-feature

# Fix branch oluştur
git checkout -b fix/bug-description
```

## 📋 Katkı Türleri

### 🐛 Bug Reports

Bug bulduğunuzda GitHub Issues'da şu bilgileri paylaşın:

**Template:**
```markdown
**Bug Açıklaması:**
[Kısa ve net açıklama]

**Adımlar:**
1. [İlk adım]
2. [İkinci adım]
3. [Hata oluşuyor]

**Beklenen Davranış:**
[Ne olması gerekiyordu]

**Gerçek Davranış:**
[Ne oldu]

**Screenshots:**
[Varsa ekran görüntüleri]

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Version: [1.0.0]

**Console Errors:**
```
[Console logs]
```
```

### ✨ Feature Requests

Yeni özellik önerileriniz için:

**Template:**
```markdown
**Özellik Açıklaması:**
[Ne istiyorsunuz]

**Problem:**
[Bu özellik hangi problemi çözüyor]

**Çözüm:**
[Nasıl çalışmalı]

**Alternatifler:**
[Düşündüğünüz diğer çözümler]

**Ek Bilgi:**
[Screenshots, mockups, vs.]
```

### 💻 Code Contributions

#### Kod Standartları

**TypeScript:**
```typescript
// ✅ İyi
interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// ❌ Kötü
const fetchUser = async (id: any) => {
  const data = await supabase
    .from('users' as any)
    .select('*')
    .eq('id', id)
    .single();
  return data.data;
};
```

**React Components:**
```typescript
// ✅ İyi - Functional component with TypeScript
import { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// ❌ Kötü
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

**Naming Conventions:**
```typescript
// Components: PascalCase
const UserProfile = () => {};

// Hooks: camelCase with 'use' prefix
const useAuth = () => {};

// Utilities: camelCase
const formatDate = (date: Date) => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Types/Interfaces: PascalCase
interface UserData {}
type AuthState = {};
```

#### Commit Messages

Conventional Commits formatını kullanın:

```bash
# Format
<type>(<scope>): <subject>

# Tipler
feat:     # Yeni özellik
fix:      # Bug fix
docs:     # Dokümantasyon
style:    # Formatting, whitespace
refactor: # Code refactoring
test:     # Test ekleme/düzenleme
chore:    # Maintenance

# Örnekler
feat(blog): add AI blog generation feature
fix(auth): resolve token refresh bug
docs(readme): update installation guide
refactor(admin): split Admin.tsx into modules
```

#### Pull Request Süreci

1. **Branch güncel mi kontrol edin:**
```bash
git checkout main
git pull origin main
git checkout your-branch
git rebase main
```

2. **Testler geçiyor mu:**
```bash
npm run test
npm run build
```

3. **PR Template:**
```markdown
## Değişiklik Türü
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Açıklama
[Ne değişti ve neden]

## Test Edilen Durumlar
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Mobile Safari
- [ ] Edge cases test edildi

## Screenshots
[Varsa ekleyin]

## Checklist
- [ ] Code TypeScript standartlarına uygun
- [ ] Commit messages conventional format'ta
- [ ] Dokümantasyon güncellendi
- [ ] Tests eklendi/güncellendi
- [ ] Breaking changes dokümante edildi
```

## 🧪 Testing

### Unit Tests (Coming Soon)
```bash
npm run test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

### Manual Testing Checklist

**Admin Panel:**
- [ ] Site CRUD operations çalışıyor
- [ ] Blog editor çalışıyor
- [ ] AI generation çalışıyor
- [ ] Image upload çalışıyor
- [ ] Analytics görünüyor

**Frontend:**
- [ ] Site listing çalışıyor
- [ ] Search/filter çalışıyor
- [ ] Site detail sayfası açılıyor
- [ ] Yorumlar gösteriliyor
- [ ] Responsive design düzgün

## 📚 Dokümantasyon

Yeni özellikler için dokümantasyon zorunludur:

- **README.md**: Özellik listesine ekleyin
- **Code comments**: Karmaşık logic'leri açıklayın
- **Type definitions**: Interface/type documentation
- **API docs**: Yeni endpoint'leri dokümante edin

## 🔍 Code Review Süreci

### Reviewer Guidelines

Reviewerlar şunlara dikkat etmeli:

1. **Functionality**: Kod çalışıyor mu?
2. **Tests**: Yeterli test coverage var mı?
3. **Performance**: Performance sorunları var mı?
4. **Security**: Güvenlik açıkları var mı?
5. **Style**: Kod standartlarına uygun mu?
6. **Documentation**: Yeterli dokümantasyon var mı?

### Review Feedback

```markdown
# ✅ Constructive feedback
"Bu fonksiyon daha performanslı olabilir. useMemo kullanmayı düşündün mü?"

# ❌ Destructive feedback
"Bu kod berbat, tamamen yeniden yaz."
```

## 🏆 Recognition

Katkıda bulunanlar `CONTRIBUTORS.md` dosyasına eklenir:

```markdown
## Contributors

- [@username](https://github.com/username) - Feature X, Bug fix Y
```

## 📞 İletişim

Sorularınız için:

- **GitHub Issues**: Teknik sorular
- **Email**: your.email@example.com
- **Discord**: [Community Link](#)

## 📜 License

Katkılarınız MIT License altında lisanslanır.

---

**Teşekkürler! 🎉**

Her katkı, projeyi daha iyi yapar. Community'ye hoş geldiniz!

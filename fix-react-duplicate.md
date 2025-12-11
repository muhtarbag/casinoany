# React Duplicate Instance Hatası Çözümü

Bu hata "Cannot read properties of null (reading 'useState')" genellikle build cache sorunlarından kaynaklanır.

## Çözüm Adımları:

### 1. Browser Cache'i Temizle
- Tarayıcınızda **Hard Refresh** yapın: `Ctrl + Shift + R` (Windows/Linux) veya `Cmd + Shift + R` (Mac)
- Veya tarayıcı geliştirici araçlarını açıp (F12) -> Network tab -> "Disable cache" işaretleyin

### 2. Dev Server'ı Yeniden Başlatın
Lovable'da:
- Sayfayı tamamen yenileyin
- Veya projeyi kapatıp tekrar açın

### 3. Eğer Sorun Devam Ederse
Build cache'i temizlemek için genellikle yardımcı olur:
- Tarayıcı önbelleğini tamamen temizleyin
- Farklı bir tarayıcıda deneyin
- Gizli mod (Incognito) kullanın

## Bu Hatanın Teknik Nedeni

React, `useState` gibi hook'ları yönetmek için kendi iç state mekanizmasını kullanır. 
Eğer:
1. React'in birden fazla versiyonu yüklenirse
2. Build cache bozulursa
3. Hot Module Replacement düzgün çalışmazsa

React'in iç state yöneticisi `null` olur ve bu hata ortaya çıkar.

## Kodunuz Doğru
`src/pages/Index.tsx` dosyanızdaki kod tamamen doğru yazılmış. Sorun kodunuzla değil, build ortamıyla ilgili.
